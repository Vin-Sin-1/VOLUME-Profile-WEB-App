import { useState } from "react";

var META = {
  instrument: "GC JUN26",
  session_label: "Last 3 Hours (11:46-14:46 Stockholm)",
  cutoff_price: 4515.4, cutoff_is_bull: false,
  poc: 4515.6, total_session_volume: 12951,
};

var PROFILE = [
  { bucket:4537.2, total_volume:43,   brick_count:4,   bull_vol:29,  bear_vol:14,  buy_vol:37,  sell_vol:6,   net_delta:31,   delta_pct:72.1,  velocity:74.14 },
  { bucket:4536.0, total_volume:218,  brick_count:15,  bull_vol:167, bear_vol:51,  buy_vol:133, sell_vol:85,  net_delta:48,   delta_pct:22.0,  velocity:2.18  },
  { bucket:4534.8, total_volume:442,  brick_count:39,  bull_vol:318, bear_vol:124, buy_vol:240, sell_vol:202, net_delta:38,   delta_pct:8.6,   velocity:0.55  },
  { bucket:4533.6, total_volume:621,  brick_count:50,  bull_vol:205, bear_vol:416, buy_vol:250, sell_vol:371, net_delta:-121, delta_pct:-19.5, velocity:0.74  },
  { bucket:4532.4, total_volume:349,  brick_count:24,  bull_vol:172, bear_vol:177, buy_vol:168, sell_vol:181, net_delta:-13,  delta_pct:-3.7,  velocity:0.78  },
  { bucket:4531.2, total_volume:157,  brick_count:9,   bull_vol:43,  bear_vol:114, buy_vol:91,  sell_vol:66,  net_delta:25,   delta_pct:15.9,  velocity:2.70  },
  { bucket:4530.0, total_volume:31,   brick_count:7,   bull_vol:4,   bear_vol:27,  buy_vol:8,   sell_vol:23,  net_delta:-15,  delta_pct:-48.4, velocity:3.71  },
  { bucket:4528.8, total_volume:29,   brick_count:7,   bull_vol:5,   bear_vol:24,  buy_vol:14,  sell_vol:15,  net_delta:-1,   delta_pct:-3.4,  velocity:12.81 },
  { bucket:4527.6, total_volume:47,   brick_count:8,   bull_vol:16,  bear_vol:31,  buy_vol:18,  sell_vol:29,  net_delta:-11,  delta_pct:-23.4, velocity:5.08  },
  { bucket:4526.4, total_volume:42,   brick_count:7,   bull_vol:3,   bear_vol:39,  buy_vol:10,  sell_vol:32,  net_delta:-22,  delta_pct:-52.4, velocity:3.96  },
  { bucket:4525.2, total_volume:65,   brick_count:7,   bull_vol:3,   bear_vol:62,  buy_vol:27,  sell_vol:38,  net_delta:-11,  delta_pct:-16.9, velocity:4.93  },
  { bucket:4524.0, total_volume:5,    brick_count:4,   bull_vol:3,   bear_vol:2,   buy_vol:2,   sell_vol:3,   net_delta:-1,   delta_pct:-20.0, velocity:0.74  },
  { bucket:4522.8, total_volume:125,  brick_count:18,  bull_vol:95,  bear_vol:30,  buy_vol:73,  sell_vol:52,  net_delta:21,   delta_pct:16.8,  velocity:2.84  },
  { bucket:4521.6, total_volume:241,  brick_count:42,  bull_vol:135, bear_vol:106, buy_vol:129, sell_vol:112, net_delta:17,   delta_pct:7.1,   velocity:2.75  },
  { bucket:4520.4, total_volume:549,  brick_count:67,  bull_vol:305, bear_vol:244, buy_vol:336, sell_vol:213, net_delta:123,  delta_pct:22.4,  velocity:1.80  },
  { bucket:4519.2, total_volume:890,  brick_count:85,  bull_vol:651, bear_vol:239, buy_vol:531, sell_vol:359, net_delta:172,  delta_pct:19.3,  velocity:1.94  },
  { bucket:4518.0, total_volume:995,  brick_count:138, bull_vol:440, bear_vol:555, buy_vol:445, sell_vol:550, net_delta:-105, delta_pct:-10.6, velocity:0.80  },
  { bucket:4516.8, total_volume:1105, brick_count:146, bull_vol:498, bear_vol:607, buy_vol:556, sell_vol:549, net_delta:7,    delta_pct:0.6,   velocity:1.08  },
  { bucket:4515.6, total_volume:1423, brick_count:170, bull_vol:915, bear_vol:508, buy_vol:725, sell_vol:698, net_delta:27,   delta_pct:1.9,   velocity:0.93  },
  { bucket:4514.4, total_volume:1313, brick_count:174, bull_vol:573, bear_vol:740, buy_vol:604, sell_vol:709, net_delta:-105, delta_pct:-8.0,  velocity:1.09  },
  { bucket:4513.2, total_volume:1101, brick_count:159, bull_vol:632, bear_vol:469, buy_vol:572, sell_vol:529, net_delta:43,   delta_pct:3.9,   velocity:1.32  },
  { bucket:4512.0, total_volume:956,  brick_count:113, bull_vol:376, bear_vol:580, buy_vol:408, sell_vol:548, net_delta:-140, delta_pct:-14.6, velocity:1.33  },
  { bucket:4510.8, total_volume:519,  brick_count:66,  bull_vol:299, bear_vol:220, buy_vol:247, sell_vol:272, net_delta:-25,  delta_pct:-4.8,  velocity:2.16  },
  { bucket:4509.6, total_volume:618,  brick_count:57,  bull_vol:240, bear_vol:378, buy_vol:249, sell_vol:369, net_delta:-120, delta_pct:-19.4, velocity:2.21  },
  { bucket:4508.4, total_volume:423,  brick_count:34,  bull_vol:201, bear_vol:222, buy_vol:184, sell_vol:239, net_delta:-55,  delta_pct:-13.0, velocity:1.41  },
  { bucket:4507.2, total_volume:330,  brick_count:31,  bull_vol:97,  bear_vol:233, buy_vol:135, sell_vol:195, net_delta:-60,  delta_pct:-18.2, velocity:2.11  },
  { bucket:4506.0, total_volume:265,  brick_count:22,  bull_vol:78,  bear_vol:187, buy_vol:91,  sell_vol:174, net_delta:-83,  delta_pct:-31.3, velocity:4.68  },
  { bucket:4504.8, total_volume:33,   brick_count:7,   bull_vol:3,   bear_vol:30,  buy_vol:0,   sell_vol:33,  net_delta:-33,  delta_pct:-100.0,velocity:7.61  },
  { bucket:4503.6, total_volume:16,   brick_count:2,   bull_vol:0,   bear_vol:16,  buy_vol:0,   sell_vol:16,  net_delta:-16,  delta_pct:-100.0,velocity:80.00 },
];

var VOL_P70 = 618;
PROFILE.forEach(function(r) { if (r.total_volume < VOL_P70) r.velocity = 0; });

var MAX_VOL = Math.max.apply(null, PROFILE.map(function(d) { return d.total_volume; }));
var MAX_VEL = Math.max.apply(null, PROFILE.map(function(d) { return d.velocity; }));
var VEL_POC = PROFILE.reduce(function(a,b) { return b.velocity > a.velocity ? b : a; });
var CURRENT = PROFILE.reduce(function(a,b) {
  return Math.abs(b.bucket - META.cutoff_price) < Math.abs(a.bucket - META.cutoff_price) ? b : a;
});
var _vb = PROFILE.filter(function(r) { return r.velocity > 0; });
var AVG_VEL = _vb.length > 0 ? (_vb.reduce(function(s,r) { return s+r.velocity; },0)/_vb.length).toFixed(2) : "0.00";

var _sorted = PROFILE.slice().sort(function(a,b) { return b.total_volume - a.total_volume; });
var _acc = 0, VA_SET = {};
for (var _i = 0; _i < _sorted.length; _i++) {
  _acc += _sorted[_i].total_volume; VA_SET[_sorted[_i].bucket] = true;
  if (_acc >= META.total_session_volume * 0.70) break;
}
var _va = PROFILE.filter(function(r) { return VA_SET[r.bucket]; });
var VAH = Math.max.apply(null, _va.map(function(r) { return r.bucket; }));
var VAL = Math.min.apply(null, _va.map(function(r) { return r.bucket; }));

function getColor(row, isVol, activePoc) {
  if (row.bucket === CURRENT.bucket) return { bull:"#22c55e", bear:"#16a34a" };
  if (row.bucket === activePoc)      return { bull:"#f59e0b", bear:"#d97706" };
  if (isVol) {
    if (row.delta_pct < -8) return { bull:"#7f1d1d99", bear:"#ef4444cc" };
    if (row.delta_pct > 6)  return { bull:"#3b82f6cc", bear:"#1d4ed8cc" };
    return { bull:"#3b82f633", bear:"#64748b99" };
  }
  if (row.velocity === 0) return { bull:"#1e293b", bear:"#1e293b" };
  var pct = row.velocity / MAX_VEL;
  if (pct > 0.6) return { bull:"#f97316cc", bear:"#f97316cc" };
  if (pct > 0.3) return { bull:"#f59e0b88", bear:"#f59e0b88" };
  return { bull:"#3b82f644", bear:"#3b82f644" };
}

function Pill(label, value, color) {
  return (
    <div key={label} style={{ background:"#1e293b", borderRadius:6, padding:"4px 10px", border:"1px solid #334155", display:"flex", gap:6, alignItems:"center" }}>
      <span style={{ color:"#475569", fontSize:10 }}>{label}</span>
      <span style={{ color:color, fontSize:13, fontWeight:700 }}>{value}</span>
    </div>
  );
}

export default function GCProfile() {
  var ms = useState("VOL"); var mode = ms[0]; var setMode = ms[1];
  var hs = useState(null);  var hovered = hs[0]; var setHovered = hs[1];
  var isVol = mode === "VOL";
  var activePoc = isVol ? META.poc : VEL_POC.bucket;

  return (
    <div style={{ background:"#0d1117", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"monospace", padding:"24px 16px" }}>
      <div style={{ width:"100%", maxWidth:640 }}>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, flexWrap:"wrap", gap:10 }}>
          <div>
            <span style={{ color:"#fcd34d", fontSize:18, fontWeight:700 }}>GC JUN26</span>
            <span style={{ color:"#64748b", fontSize:11, marginLeft:10 }}>{META.session_label}</span>
          </div>
          <div style={{ display:"flex", borderRadius:8, overflow:"hidden", border:"1px solid #334155" }}>
            <button onClick={function() { setMode("VOL"); }} style={{ padding:"6px 20px", fontSize:12, fontWeight:700, fontFamily:"monospace", cursor:"pointer", border:"none", borderRight:"1px solid #334155", background:isVol?"#1c1917":"#1e293b", color:isVol?"#f59e0b":"#475569" }}>VOL</button>
            <button onClick={function() { setMode("VEL"); }} style={{ padding:"6px 20px", fontSize:12, fontWeight:700, fontFamily:"monospace", cursor:"pointer", border:"none", background:!isVol?"#1c1917":"#1e293b", color:!isVol?"#f97316":"#475569" }}>VEL</button>
          </div>
        </div>

        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
          {Pill("LAST", META.cutoff_price.toFixed(1)+(META.cutoff_is_bull?" ^":" v"), META.cutoff_is_bull?"#22c55e":"#ef4444")}
          {Pill(isVol?"POC":"vPOC", activePoc.toFixed(1), isVol?"#f59e0b":"#f97316")}
          {isVol && Pill("VAH", VAH.toFixed(1), "#a78bfa")}
          {isVol && Pill("VAL", VAL.toFixed(1), "#a78bfa")}
          {isVol && Pill("VOL", META.total_session_volume.toLocaleString(), "#94a3b8")}
          {!isVol && Pill("MAX", MAX_VEL.toFixed(2)+" t/s", "#f97316")}
          {!isVol && Pill("AVG", AVG_VEL+" t/s", "#94a3b8")}
          {!isVol && Pill("P70", VOL_P70.toString(), "#475569")}
        </div>

        <div style={{ display:"flex", gap:12, marginBottom:14, flexWrap:"wrap" }}>
          {(isVol ? [
            { color:"#22c55e",   label:"Current "+META.cutoff_price.toFixed(1) },
            { color:"#f59e0b",   label:"POC "+META.poc.toFixed(1) },
            { color:"#a78bfa",   label:"VA "+VAL.toFixed(1)+"-"+VAH.toFixed(1) },
            { color:"#ef4444cc", label:"Selling <-8%" },
            { color:"#3b82f6cc", label:"Buying >+6%" },
          ] : [
            { color:"#22c55e",   label:"Current "+META.cutoff_price.toFixed(1) },
            { color:"#f97316",   label:"vPOC "+VEL_POC.bucket.toFixed(1) },
            { color:"#f97316cc", label:"High >60%" },
            { color:"#f59e0b88", label:"Med 30-60%" },
            { color:"#3b82f644", label:"Low <30%" },
            { color:"#1e293b",   label:"Below P70" },
          ]).map(function(item) {
            return (
              <div key={item.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:10, height:10, background:item.color, borderRadius:2, flexShrink:0, border:"1px solid #334155" }} />
                <span style={{ color:"#94a3b8", fontSize:11 }}>{item.label}</span>
              </div>
            );
          })}
        </div>

        <div>
          {PROFILE.map(function(row) {
            var totalW = isVol ? (row.total_volume/MAX_VOL)*260 : (row.velocity/MAX_VEL)*260;
            var bullW  = isVol && row.total_volume>0 ? (row.bull_vol/row.total_volume)*totalW : totalW;
            var bearW  = isVol ? totalW-bullW : 0;
            var isCur  = row.bucket === CURRENT.bucket;
            var isPoc  = row.bucket === activePoc;
            var isVA   = isVol && VA_SET[row.bucket];
            var isHov  = hovered !== null && hovered === row.bucket;
            var colors = getColor(row, isVol, activePoc);
            return (
              <div key={row.bucket} onMouseEnter={function() { setHovered(row.bucket); }} onMouseLeave={function() { setHovered(null); }}
                style={{ display:"flex", alignItems:"center", height:17, marginBottom:3, cursor:"default", opacity:hovered!==null&&!isHov?0.35:1 }}>
                <div style={{ width:4, height:13, marginRight:4, flexShrink:0, borderLeft:isVA?"2px solid #a78bfa66":"2px solid transparent", background:isVA?"#a78bfa22":"transparent" }} />
                <div style={{ width:62, textAlign:"right", paddingRight:10, fontSize:11, flexShrink:0, fontWeight:isCur||isPoc?700:400, color:isCur?"#22c55e":isPoc?(isVol?"#f59e0b":"#f97316"):isVA?"#c4b5fd":"#64748b" }}>{row.bucket.toFixed(1)}</div>
                <div style={{ position:"relative", height:13, width:260, background:"#1e293b", borderRadius:2, overflow:"hidden", flexShrink:0 }}>
                  <div style={{ position:"absolute", left:0, top:0, height:"100%", width:bullW, background:colors.bull, borderRadius:"2px 0 0 2px" }} />
                  {isVol && <div style={{ position:"absolute", left:bullW, top:0, height:"100%", width:bearW, background:colors.bear, borderRadius:bearW>0?"0 2px 2px 0":0 }} />}
                  {isCur && <div style={{ position:"absolute", right:-1, top:"50%", transform:"translateY(-50%)", width:0, height:0, borderTop:"4px solid transparent", borderBottom:"4px solid transparent", borderLeft:"5px solid #22c55e" }} />}
                </div>
                <div style={{ paddingLeft:8, fontSize:10, minWidth:58, fontWeight:isCur||isPoc?700:400, color:isCur?"#22c55e":isPoc?(isVol?"#f59e0b":"#f97316"):"#475569" }}>
                  {isVol ? row.total_volume.toLocaleString() : (row.velocity>0?row.velocity.toFixed(2)+"t/s":"-")}
                </div>
                <div style={{ fontSize:9, minWidth:46, color:isVol?(row.delta_pct>0?"#3b82f6":row.delta_pct<0?"#ef4444":"#475569"):"#475569" }}>
                  {isVol ? ((row.delta_pct>0?"+":"")+row.delta_pct.toFixed(1)+"%") : (row.velocity>0?row.total_volume.toLocaleString():"")}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop:14, minHeight:64, background:"#1e293b", borderRadius:8, padding:"10px 14px", border:"1px solid #334155" }}>
          {hovered !== null ? (function() {
            var row = PROFILE.filter(function(r) { return r.bucket === hovered; })[0];
            if (!row) return null;
            return (
              <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                {[
                  { label:"PRICE",  value:row.bucket.toFixed(1),                                 color:"#f1f5f9" },
                  { label:"VEL",    value:row.velocity>0?row.velocity.toFixed(2)+" t/s":"< P70", color:row.velocity>0?"#f97316":"#475569" },
                  { label:"VOL",    value:row.total_volume.toLocaleString(),                      color:"#f1f5f9" },
                  { label:"BRICKS", value:row.brick_count.toString(),                             color:"#94a3b8" },
                  { label:"BUY",    value:row.buy_vol.toLocaleString(),                           color:"#22c55e" },
                  { label:"SELL",   value:row.sell_vol.toLocaleString(),                          color:"#ef4444" },
                  { label:"BULL",   value:row.bull_vol.toLocaleString(),                          color:"#3b82f6" },
                  { label:"BEAR",   value:row.bear_vol.toLocaleString(),                          color:"#f97316" },
                  { label:"DELTA",  value:(row.net_delta>0?"+":"")+row.net_delta,                 color:row.net_delta>0?"#3b82f6":row.net_delta<0?"#ef4444":"#64748b" },
                  { label:"D%",     value:(row.delta_pct>0?"+":"")+row.delta_pct+"%",             color:row.delta_pct>0?"#3b82f6":row.delta_pct<0?"#ef4444":"#64748b" },
                ].map(function(item) {
                  return (
                    <div key={item.label}>
                      <div style={{ color:"#64748b", fontSize:9, marginBottom:2 }}>{item.label}</div>
                      <div style={{ color:item.color, fontSize:12, fontWeight:700 }}>{item.value}</div>
                    </div>
                  );
                })}
              </div>
            );
          })() : <div style={{ color:"#334155", fontSize:11 }}>Hover a row for details</div>}
        </div>

        <div style={{ marginTop:10, color:"#334155", fontSize:10, textAlign:"right" }}>
          VOL = volume at price · VEL = ticks/sec (P70+ only) · 4-pip to 12-pip buckets
        </div>
      </div>
    </div>
  );
}
