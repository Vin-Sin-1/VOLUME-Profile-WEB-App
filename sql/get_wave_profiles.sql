-- ============================================================================
-- get_wave_profiles()  —  one volume profile per Weis-style wave
-- ============================================================================
-- Waves are detected with the same zigzag-by-amount algorithm as the
-- VSA-Mobile-Waves app (detectWaves): scan renko brick CLOSES in bar_index
-- order; an up-wave tracks its highest close and ends at that high once price
-- retraces >= p_wave_size from it (mirrored for down-waves). Every wave is
-- therefore p_wave_size OR MORE, never fixed. The final, still-developing
-- wave is included and flagged "developing": true.
--
-- Unlike the waves app, each brick belongs to exactly ONE wave (the pivot
-- brick goes to the wave it completes) so volume is never double-counted.
--
-- buy/sell volumes are derived from the brick delta column:
--   buy = (volume + delta) / 2,  sell = (volume - delta) / 2
-- velocity = volume / wave duration in seconds (per bucket and per wave).
--
-- INSTALL (self-hosted Supabase): paste this whole file into Studio's SQL
-- editor and run it. Re-running replaces the function safely.
--
-- EXAMPLE:
--   SELECT get_wave_profiles('GC%', now() - interval '4 hours', now(),
--                            4, 1.2, 7.0);
--
-- REST test (same anon key as the apps):
--   curl -s "$SB_URL/rest/v1/rpc/get_wave_profiles" \
--     -H "apikey: $SB_KEY" -H "Authorization: Bearer $SB_KEY" \
--     -H "Content-Type: application/json" \
--     -d '{"p_instrument":"GC%","p_start_time":"2026-07-15T08:00:00Z",
--          "p_cutoff_time":"2026-07-15T12:00:00Z","p_brick_size":4,
--          "p_bucket_size":1.2,"p_wave_size":7.0}'
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_wave_profiles(
  p_instrument  text,
  p_start_time  timestamptz,
  p_cutoff_time timestamptz,
  p_brick_size  int     DEFAULT 4,
  p_bucket_size numeric DEFAULT 1.2,
  p_wave_size   numeric DEFAULT 7.0
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_close  numeric[];
  n        int;
  c        numeric;
  dir      int;          -- +1 while in an up-wave, -1 in a down-wave
  ev       numeric;      -- extreme close of the current wave
  ep       int;          -- 1-based index of that extreme
  pivots   int[] := '{}';
  i        int;
  result   jsonb;
BEGIN
  SELECT array_agg(rb.close::numeric ORDER BY rb.bar_index)
    INTO v_close
  FROM renko_bricks rb
  WHERE rb.instrument LIKE p_instrument
    AND rb.brick_size = p_brick_size
    AND rb.bar_start_time >= p_start_time
    AND rb.bar_start_time <= p_cutoff_time;

  n := COALESCE(array_length(v_close, 1), 0);
  IF n = 0 THEN
    RETURN jsonb_build_object(
      'meta', jsonb_build_object('wave_count', 0, 'wave_size', p_wave_size,
                                 'bucket_size', p_bucket_size,
                                 'brick_size', p_brick_size),
      'waves', '[]'::jsonb);
  END IF;

  -- ── pass 1: zigzag pivot detection on closes ─────────────────────────────
  dir := CASE WHEN n > 1 AND v_close[2] >= v_close[1] THEN 1 ELSE -1 END;
  ev  := v_close[1];
  ep  := 1;
  FOR i IN 2..n LOOP
    c := v_close[i];
    IF dir = 1 THEN
      IF c > ev THEN
        ev := c; ep := i;
      ELSIF ev - c >= p_wave_size THEN
        pivots := pivots || ep;         -- up-wave ends at its high
        dir := -1; ev := c; ep := i;
      END IF;
    ELSE
      IF c < ev THEN
        ev := c; ep := i;
      ELSIF c - ev >= p_wave_size THEN
        pivots := pivots || ep;         -- down-wave ends at its low
        dir := 1; ev := c; ep := i;
      END IF;
    END IF;
  END LOOP;
  pivots := pivots || n;                -- close the developing wave

  -- ── pass 2: aggregate buckets per wave, build the JSON ───────────────────
  WITH b AS (
    SELECT row_number() OVER (ORDER BY rb.bar_index) AS rn,
           rb.instrument, rb.bar_start_time,
           rb.close::numeric  AS close,
           rb.volume::numeric AS volume,
           COALESCE(rb.delta, 0)::numeric AS delta,
           rb.is_bull
    FROM renko_bricks rb
    WHERE rb.instrument LIKE p_instrument
      AND rb.brick_size = p_brick_size
      AND rb.bar_start_time >= p_start_time
      AND rb.bar_start_time <= p_cutoff_time
  ),
  w AS (                                -- wave k = bricks (pivot[k-1], pivot[k]]
    SELECT t.ord::int AS wave_no,
           COALESCE(lag(t.p) OVER (ORDER BY t.ord), 0) + 1 AS rn_from,
           t.p AS rn_to
    FROM unnest(pivots) WITH ORDINALITY AS t(p, ord)
  ),
  bw AS (
    SELECT w.wave_no, b.*
    FROM b JOIN w ON b.rn BETWEEN w.rn_from AND w.rn_to
  ),
  wave_meta AS (
    SELECT wave_no,
           min(bar_start_time) AS start_time,
           max(bar_start_time) AS end_time,
           GREATEST(EXTRACT(EPOCH FROM max(bar_start_time) - min(bar_start_time)), 1)::numeric AS dur_s,
           sum(volume)         AS vol,
           sum(delta)          AS net_delta,
           count(*)            AS bricks,
           (array_agg(close ORDER BY rn))[1]                 AS start_price,
           (array_agg(close ORDER BY rn DESC))[1]            AS end_price
    FROM bw
    GROUP BY wave_no
  ),
  buckets AS (
    SELECT wave_no,
           round(close / p_bucket_size) * p_bucket_size AS bucket,
           sum(volume)                        AS tv,
           count(*)                           AS bc,
           sum(volume) FILTER (WHERE is_bull)          AS bull,
           sum(volume) FILTER (WHERE NOT is_bull)      AS bear,
           sum((volume + delta) / 2)          AS buy,
           sum((volume - delta) / 2)          AS sell,
           sum(delta)                         AS nd
    FROM bw
    GROUP BY wave_no, round(close / p_bucket_size) * p_bucket_size
  ),
  wave_json AS (
    SELECT m.wave_no,
           jsonb_build_object(
             'id',           m.wave_no,
             'dir',          CASE WHEN m.end_price >= m.start_price THEN 'up' ELSE 'down' END,
             'developing',   m.wave_no = (SELECT max(wave_no) FROM wave_meta),
             'start_time',   m.start_time,
             'end_time',     m.end_time,
             'duration_s',   round(m.dur_s),
             'start_price',  m.start_price,
             'end_price',    m.end_price,
             'total_volume', m.vol,
             'brick_count',  m.bricks,
             'velocity',     round(m.vol / m.dur_s, 2),
             'net_delta',    m.net_delta,
             'delta_pct',    round(100 * m.net_delta / NULLIF(m.vol, 0), 1),
             'poc',          (SELECT k.bucket FROM buckets k
                              WHERE k.wave_no = m.wave_no
                              ORDER BY k.tv DESC, k.bucket LIMIT 1),
             'profile',      (SELECT jsonb_agg(jsonb_build_object(
                                'bucket',       k.bucket,
                                'total_volume', k.tv,
                                'brick_count',  k.bc,
                                'bull_vol',     COALESCE(k.bull, 0),
                                'bear_vol',     COALESCE(k.bear, 0),
                                'buy_vol',      round(k.buy),
                                'sell_vol',     k.tv - round(k.buy),  -- buy+sell == total exactly
                                'net_delta',    k.nd,
                                'delta_pct',    round(100 * k.nd / NULLIF(k.tv, 0), 1),
                                'velocity',     round(k.tv / m.dur_s, 2)
                              ) ORDER BY k.bucket)
                              FROM buckets k WHERE k.wave_no = m.wave_no)
           ) AS wj
    FROM wave_meta m
  )
  SELECT jsonb_build_object(
    'meta', jsonb_build_object(
      'instrument',   (SELECT max(instrument) FROM b),
      'wave_size',    p_wave_size,
      'bucket_size',  p_bucket_size,
      'brick_size',   p_brick_size,
      'wave_count',   (SELECT count(*) FROM wave_meta),
      'cutoff_price', (SELECT end_price FROM wave_meta ORDER BY wave_no DESC LIMIT 1),
      'cutoff_is_bull', (SELECT end_price >= start_price FROM wave_meta ORDER BY wave_no DESC LIMIT 1),
      'total_volume', (SELECT sum(vol) FROM wave_meta)
    ),
    'waves', (SELECT jsonb_agg(wj ORDER BY wave_no) FROM wave_json)
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_wave_profiles(text, timestamptz, timestamptz, int, numeric, numeric)
  TO anon, authenticated;
