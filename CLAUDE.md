# Volume Profile Web App — Project Brief

## What This Is
A standalone mobile-first web app displaying volume profile histograms for futures trading.
Built separately from the existing Renko charts app — do NOT touch that repo.
Single HTML file, hosted on GitHub Pages, accessible from phone and laptop.

## Owner
Senior Data Architect / Futures trader, Stockholm.
Trades MGC (Gold Micro) and CL (WTI Crude Oil) using VSA + Wyckoff methodology.

---

## Supabase Connection

Live source is a **self-hosted Supabase** exposed via a Tailscale Funnel (as configured in
`index.html`). It is only reachable from the trader's own network / the funnel — not from
sandboxed CI or agent environments with restricted egress.

**URL:** https://desktop-5k8hiht.tail9252c1.ts.net
**Anon key:** in `index.html` (`SUPABASE_ANON_KEY`) — public by design (RLS-gated anon role).

> **Retired:** the old Supabase Cloud project `nyykpszexlxtapbnkxpw`
> (`https://nyykpszexlxtapbnkxpw.supabase.co`, "OHLC Database") is **paused/no longer used**.
> The live pipeline moved to the self-hosted instance above; ignore the cloud project.

### Core RPC Function
```
get_volume_profile(
  p_instrument  TEXT,        -- 'GC%' or 'CL%' or 'ES%'
  p_start_time  TIMESTAMPTZ,
  p_cutoff_time TIMESTAMPTZ,
  p_brick_size  INT     DEFAULT 4,
  p_bucket_size NUMERIC DEFAULT 1.2
)
RETURNS JSONB
```

### Return Format
```json
{
  "meta": {
    "instrument": "GC JUN26",
    "cutoff_price": 4515.4,
    "cutoff_is_bull": false,
    "poc": 4515.6,
    "total_session_volume": 12951,
    "bucket_size": 1.2,
    "brick_size": 4
  },
  "profile": [
    {
      "bucket": 4515.6,
      "total_volume": 1423,
      "brick_count": 170,
      "bull_vol": 915,
      "bear_vol": 508,
      "buy_vol": 725,
      "sell_vol": 698,
      "net_delta": 27,
      "delta_pct": 1.9,
      "velocity": 0.93
    }
  ]
}
```

### Bucket Sizes by Instrument
- GC (Gold):  p_bucket_size = 1.2
- CL (Oil):   p_bucket_size = 0.12
- ES (S&P):   p_bucket_size = 1.2

### JavaScript RPC Call
```javascript
const { data, error } = await supabase
  .rpc('get_volume_profile', {
    p_instrument:  'GC%',
    p_start_time:  startTime,
    p_cutoff_time: new Date().toISOString(),
    p_brick_size:  4,
    p_bucket_size: 1.2
  });
```

---

## UI Layout (mobile-first, 390px)

```
Title + VOL/VEL toggle
Meta pills: LAST | POC | VAH | VAL | VOL
Instrument: [GC] [CL] [ES]
Window:     [1h] [2h] [3h] [4h] [5h] [London] [NY] [Refresh]
Histogram rows (price | bar | volume | delta%)
Tooltip panel (tap to show all 10 fields)
```

---

## Colour Scheme
```
Background:     #0d1117
Panel:          #1e293b
Border:         #334155
Text:           #f1f5f9
Muted:          #64748b
Gold:           #fcd34d
Green:          #22c55e
Red:            #ef4444
Amber (POC):    #f59e0b
Purple (VA):    #a78bfa
Orange (VEL):   #f97316
Blue (buying):  #3b82f6
```

---

## Histogram Logic

### VOL Mode
- Bar width proportional to total_volume
- Left portion = bull_vol, right = bear_vol
- delta_pct < -8%  = red bar
- delta_pct > +6%  = blue bar
- Current price    = green (override)
- POC              = amber (override)
- VA levels        = purple left border

### VEL Mode (velocity = volume / time, pre-computed by DB)
- Bar width proportional to velocity
- Single color bar (no bull/bear split)
- P70 filter: zero out velocity for buckets where total_volume < P70
- velocity > 60% of max = orange
- velocity 30-60%       = amber
- velocity < 30%        = blue-grey
- velocity = 0 (below P70) = invisible

### P70 Filter
```javascript
const sorted = profile.map(r => r.total_volume).sort((a,b) => a-b);
const p70 = sorted[Math.floor(sorted.length * 0.70)];
profile.forEach(r => { if (r.total_volume < p70) r.velocity = 0; });
```

### Value Area (70% of volume)
```javascript
const byVol = [...profile].sort((a,b) => b.total_volume - a.total_volume);
let acc = 0; const vaSet = new Set();
for (const r of byVol) {
  acc += r.total_volume; vaSet.add(r.bucket);
  if (acc >= meta.total_session_volume * 0.70) break;
}
const vah = Math.max(...[...vaSet]);
const val = Math.min(...[...vaSet]);
```

---

## Session Windows (UTC)
- 1h / 2h / 3h / 4h (default) / 5h = now minus N hours
- London = today 08:00 UTC to now
- NY     = today 13:30 UTC to now
- Stockholm = UTC+2 — display times in Stockholm in UI

---

## Tooltip Fields (on tap)
PRICE | VEL | VOL | BRICKS | BUY | SELL | BULL | BEAR | DELTA | D%

---

## Tech Stack
- Single index.html file — no build process
- Supabase JS v2 via CDN
- Vanilla JS (preferred) or React via CDN
- GitHub Pages deployment
- Mobile touch: tap row to show/hide tooltip

---

## What Is Already Done
- get_volume_profile() Supabase function — deployed and tested
- VOL/VEL toggle design — validated
- P70 velocity filter — working
- Value Area calculation — working
- Dark theme + color palette — defined
- Mobile layout — designed

## What To Build
- index.html with full app
- Supabase client browser connection
- Instrument selector
- Time window selector
- Histogram render
- Tap-to-tooltip on mobile
- Refresh button
- GitHub Pages setup

---

## Instruments in Supabase
- GC JUN26 → pattern 'GC%', bucket 1.2
- CL JUL26 → pattern 'CL%', bucket 0.12
- ES JUN26 → pattern 'ES%', bucket 1.2

Note: NT8 wipes table on restart — data starts from last NT8 launch.
Note: Contract names roll periodically (JUN26 to SEP26 etc).
