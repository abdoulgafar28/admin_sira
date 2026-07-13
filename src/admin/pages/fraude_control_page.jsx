import { useState, useEffect } from "react";
import API from "../../services/axios_instance";

/* ─── Google Fonts ──────────────────────────────────────────────────── */
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap";
if (!document.querySelector(`link[href="${FONT_LINK}"]`)) {
  const l = document.createElement("link"); l.rel = "stylesheet"; l.href = FONT_LINK;
  document.head.appendChild(l);
}

/* ─── Tokens ─────────────────────────────────────────────────────────── */
const T = {
  bg:      "#f0f2f5",
  bg1:     "#ffffff",
  green:   "#2ecc71",
  greenD:  "#1a4731",
  greenPl: "rgba(46,204,113,0.10)",
  greenBd: "rgba(46,204,113,0.22)",
  red:     "#e74c3c",
  redPl:   "rgba(231,76,60,0.10)",
  redBd:   "rgba(231,76,60,0.22)",
  redD:    "#c0392b",
  amber:   "#f0a500",
  amberPl: "rgba(240,165,0,0.10)",
  amberBd: "rgba(240,165,0,0.22)",
  blue:    "#2980b9",
  bluePl:  "rgba(41,128,185,0.10)",
  blueBd:  "rgba(41,128,185,0.22)",
  t1:      "#1a2332",
  t2:      "#4a5568",
  t3:      "#9aa3b0",
  border:  "rgba(26,71,49,0.08)",
  border2: "rgba(26,71,49,0.14)",
  mono:    "'DM Mono', monospace",
  sans:    "'Inter', sans-serif",
  disp:    "'Syne', sans-serif",
};

/* ─── CSS ────────────────────────────────────────────────────────────── */
const CSS = `
  @keyframes af-fadeUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes af-slideIn  { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
  @keyframes af-modalIn  { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
  @keyframes af-overlayIn{ from{opacity:0} to{opacity:1} }
  @keyframes af-pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes af-draw     { from{stroke-dashoffset:600} to{stroke-dashoffset:0} }
  .af-row { transition:background .15s; cursor:pointer; }
  .af-row:hover td { background:rgba(46,204,113,.03) !important; }
  .af-row-alert:hover td { background:rgba(231,76,60,.04) !important; }
  .af-row-warn:hover td  { background:rgba(240,165,0,.04) !important; }
  .af-btn { transition:all .18s; cursor:pointer; border:none; }
  .af-btn:hover { filter:brightness(1.1); transform:scale(1.06); }
  .af-tab { transition:all .18s; cursor:pointer; background:none; border:none; }
  .af-tab:hover { color:${T.greenD} !important; }
  .af-close:hover { background:rgba(0,0,0,.08) !important; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:#d1d9d1; border-radius:4px; }
`;
if (!document.querySelector("#af-css")) {
  const s = document.createElement("style"); s.id = "af-css"; s.textContent = CSS;
  document.head.appendChild(s);
}

/* ─── Helpers ────────────────────────────────────────────────────────── */
const ecartPct = (d) => Math.round(Math.abs((d.distParcourue || d.distance_deviation_km || 0) - (d.distTheorique || d.estimated_distance_km || 1)) / (d.distTheorique || d.estimated_distance_km || 1) * 100);

const STATUT_CFG = {
  ok:             { label:"OK",           bg:T.greenPl, bd:T.greenBd, color:T.greenD, dot:"#2ecc71" },
  avertissement:  { label:"Avertissement",bg:T.amberPl, bd:T.amberBd, color:T.amber,  dot:"#f0a500" },
  alerte:         { label:"Alerte",       bg:T.redPl,   bd:T.redBd,   color:T.red,    dot:"#e74c3c" },
};

const AV_PAL = [
  {bg:"rgba(46,204,113,.15)", c:T.greenD},
  {bg:"rgba(41,128,185,.15)", c:T.blue  },
  {bg:"rgba(240,165,0,.15)",  c:"#7a5200"},
  {bg:"rgba(231,76,60,.15)",  c:T.red   },
  {bg:"rgba(142,68,173,.15)", c:"#6c3483"},
];
const avColor = (s) => AV_PAL[s.charCodeAt(0) % AV_PAL.length];

function VitesseBar({ val, limite }) {
  const pct   = Math.min((val / (limite * 1.8)) * 100, 100);
  const over  = val > limite;
  const color = over ? T.red : val > limite * 0.85 ? T.amber : T.green;
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
        <span style={{ fontFamily:T.mono, fontSize:11, fontWeight:600, color }}>{val} km/h</span>
        <span style={{ fontFamily:T.mono, fontSize:10, color:T.t3 }}>/ {limite}</span>
      </div>
      <div style={{ height:4, borderRadius:4, background:T.border2, overflow:"hidden", width:70 }}>
        <div style={{
          height:"100%", borderRadius:4, width:`${pct}%`,
          background:color, boxShadow:`0 0 6px ${color}55`,
          transition:"width 1s ease",
        }} />
      </div>
    </div>
  );
}

/* ─── Atoms ──────────────────────────────────────────────────────────── */
function Av({ ini, nom, size=34 }) {
  const txt = ini || (nom || "??").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const p = avColor(txt);
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%", flexShrink:0,
      background:p.bg, color:p.c, border:`1.5px solid ${p.c}30`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:size*.34, fontWeight:700, fontFamily:T.mono,
    }}>{txt}</div>
  );
}

function Tag({ label, bg, bd, color, dot }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"4px 10px", borderRadius:20,
      fontSize:11, fontWeight:600, fontFamily:T.sans,
      background:bg, color, border:`1px solid ${bd}`,
    }}>
      {dot && <span style={{ width:6, height:6, borderRadius:"50%", background:dot, flexShrink:0, animation: color===T.red ? "af-pulse 1.6s infinite" : "none" }} />}
      {label}
    </span>
  );
}

function SH({ title }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
      <div style={{ width:3, height:16, borderRadius:2, background:T.green }} />
      <span style={{ fontFamily:T.disp, fontSize:13, fontWeight:700, color:T.t1, letterSpacing:.4 }}>{title}</span>
    </div>
  );
}

function MetricCard({ label, icon, children }) {
  return (
    <div style={{
      background:T.bg, border:`1px solid ${T.border}`,
      borderRadius:12, padding:"12px 14px",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
        <span style={{ fontSize:13 }}>{icon}</span>
        <span style={{ fontFamily:T.mono, fontSize:10, color:T.t3, textTransform:"uppercase", letterSpacing:.8 }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

/* ─── Fausse carte SVG ───────────────────────────────────────────────── */
function FakeMap({ driver }) {
  const coords = driver.coords || [];
  if (coords.length < 2) {
    return <div style={{ height:280, borderRadius:12, background:"#e8f0e4", border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ color:T.t3, fontSize:13 }}>Données GPS non disponibles</span></div>;
  }
  const lats = coords.map(c => c.lat || c.x || 0);
  const lngs = coords.map(c => c.lng || c.y || 0);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const pad = 60;
  const W = 560, H = 280;
  const toX = (lng) => pad + ((lng - minLng) / (maxLng - minLng || 1)) * (W - pad*2);
  const toY = (lat) => H - pad - ((lat - minLat) / (maxLat - minLat || 1)) * (H - pad*2);
  const points = coords.map(c => ({ x:toX(c.lng || c.y || 0), y:toY(c.lat || c.x || 0) }));
  const pathD  = points.map((p,i) => `${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
  const isAlert = driver.statut === "alerte";
  const routeColor = isAlert ? T.red : driver.statut === "avertissement" ? T.amber : T.green;
  const theoD = `M${points[0].x},${points[0].y} L${points[points.length-1].x},${points[points.length-1].y}`;

  return (
    <div style={{ position:"relative", borderRadius:12, overflow:"hidden", background:"#e8f0e8", border:`1px solid ${T.border}` }}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ display:"block" }}>
        <rect width={W} height={H} fill="#e8f0e4" />
        {[...Array(8)].map((_,i) => <line key={`h${i}`} x1={0} y1={i*42} x2={W} y2={i*42} stroke="#d8e8d4" strokeWidth=".8" />)}
        {[...Array(14)].map((_,i) => <line key={`v${i}`} x1={i*42} y1={0} x2={i*42} y2={H} stroke="#d8e8d4" strokeWidth=".8" />)}
        <path d={`M0,${H/2} L${W},${H/2}`} stroke="#c8d8c4" strokeWidth="5" fill="none" opacity=".6"/>
        <path d={`M${W/3},0 L${W/3},${H}`} stroke="#c8d8c4" strokeWidth="3" fill="none" opacity=".5"/>
        <path d={`M${W*2/3},0 L${W*2/3},${H}`} stroke="#c8d8c4" strokeWidth="5" fill="none" opacity=".6"/>
        <path d={theoD} stroke="#94a3a0" strokeWidth="2" strokeDasharray="6,4" fill="none" opacity=".7" />
        <path d={pathD} stroke={routeColor} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="600" strokeDashoffset="600" style={{ animation:"af-draw 1.6s ease forwards" }} />
        {isAlert && points.slice(1,-1).map((p,i) => <circle key={i} cx={p.x} cy={p.y} r="10" fill={T.red} opacity=".15" />)}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={i===0||i===points.length-1 ? 8 : 5} fill={i===0 ? T.greenD : i===points.length-1 ? routeColor : "#fff"} stroke={routeColor} strokeWidth="2" />
            {(i===0 || i===points.length-1) && <text x={p.x+11} y={p.y+4} fill={T.t2} fontSize="10" fontFamily={T.mono}>{i===0 ? "Départ" : "Arrivée"}</text>}
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ─── Modal détail ───────────────────────────────────────────────────── */
function TrajetModal({ driver, onClose, onSignal }) {
  if (!driver) return null;
  const sc  = STATUT_CFG[driver.statut] || STATUT_CFG.ok;
  const eP  = ecartPct(driver);
  const isAlert = driver.statut === "alerte";
  const tel = driver.tel || driver.telephone || driver.phone || "—";
  const nom = driver.nom || driver.name || "—";
  const ini = driver.ini || nom;
  const incidents = driver.incidents || [];
  const vitesseMax = driver.vitesseMax || driver.vitesse_max || 0;
  const vitesseMoy = driver.vitesseMoy || driver.vitesse_moy || 0;
  const limiteZone = driver.limiteZone || 50;
  const detour = driver.detour || driver.detour_km || 0;
  const detourJustifie = driver.detourJustifie !== undefined ? driver.detourJustifie : (driver.detour_justifie || false);
  const distGps = driver.distGps || driver.distance_gps_km || 0;
  const distParcourue = driver.distParcourue || driver.distance_deviation_km || 0;
  const distTheorique = driver.distTheorique || driver.estimated_distance_km || 0;

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(10,20,15,.4)", backdropFilter:"blur(3px)", zIndex:99, animation:"af-overlayIn .22s ease both" }} />
      <div style={{ position:"fixed", top:"5%", left:"50%", transform:"translateX(-50%)", width:640, maxHeight:"90vh", background:T.bg1, borderRadius:18, boxShadow:"0 24px 64px rgba(10,20,15,.22)", zIndex:100, display:"flex", flexDirection:"column", overflow:"hidden", animation:"af-modalIn .28s cubic-bezier(.2,.8,.4,1) both", fontFamily:T.sans }}>
        <div style={{ padding:"18px 22px 14px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <Av ini={ini} nom={nom} size={44} />
            <div>
              <div style={{ fontFamily:T.disp, fontSize:16, fontWeight:700, color:T.t1 }}>{nom}</div>
              <div style={{ fontFamily:T.mono, fontSize:11, color:T.t3, marginTop:3 }}>{driver.id?.slice(0,8)} · {driver.client || "—"}</div>
              <div style={{ marginTop:6 }}><Tag label={sc.label} bg={sc.bg} bd={sc.bd} color={sc.color} dot={sc.dot} /></div>
            </div>
          </div>
          <button className="af-close" onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:`1px solid ${T.border}`, background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:T.t2 }}>✕</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0, borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
          {[
            { label:"GPS", val:`${distGps} km`, color:T.t1 },
            { label:"Parcourue", val:`${distParcourue} km`, color: distParcourue > distTheorique*1.3 ? T.red : T.t1 },
            { label:"Théorique", val:`${distTheorique} km`, color:T.t1 },
            { label:"Écart", val:`+${eP}%`, color: eP>30?T.red:eP>15?T.amber:T.greenD },
          ].map((m,i) => (
            <div key={i} style={{ padding:"12px 14px", textAlign:"center", borderRight: i<3 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ fontFamily:T.mono, fontSize:10, color:T.t3, textTransform:"uppercase", letterSpacing:.8, marginBottom:5 }}>{m.label}</div>
              <div style={{ fontFamily:T.mono, fontSize:17, fontWeight:500, color:m.color }}>{m.val}</div>
            </div>
          ))}
        </div>
        <div style={{ overflowY:"auto", flex:1, padding:"18px 22px", display:"flex", flexDirection:"column", gap:18 }}>
          <div><SH title="Trajet sur carte" /><FakeMap driver={driver} /></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <MetricCard label="Vitesse maximale" icon="⚡">
              <VitesseBar val={vitesseMax} limite={limiteZone} />
              {vitesseMax > limiteZone && <div style={{ fontFamily:T.mono, fontSize:10, color:T.red, marginTop:4 }}>+{vitesseMax - limiteZone} km/h au-dessus</div>}
            </MetricCard>
            <MetricCard label="Vitesse moyenne" icon="📊">
              <VitesseBar val={vitesseMoy} limite={limiteZone} />
            </MetricCard>
            <MetricCard label="Détour" icon="🔄">
              <div style={{ fontFamily:T.mono, fontSize:17, fontWeight:500, color: detour>1 ? T.red : T.greenD }}>{detour} km</div>
              <div style={{ fontFamily:T.mono, fontSize:10, color: detourJustifie ? T.greenD : T.red, marginTop:3 }}>{detourJustifie ? "✓ Justifié" : "✗ Non justifié"}</div>
            </MetricCard>
            <MetricCard label="Zone de vitesse" icon="🚦">
              <div style={{ fontFamily:T.mono, fontSize:17, fontWeight:500, color:T.t1 }}>{limiteZone} km/h</div>
            </MetricCard>
          </div>
          {incidents.length > 0 && (
            <div>
              <SH title="Incidents détectés" />
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {incidents.map((inc, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, background:T.redPl, border:`1px solid ${T.redBd}`, borderRadius:10, padding:"10px 12px", animation:`af-fadeUp .3s ease ${i*60}ms both` }}>
                    <span style={{ fontSize:14 }}>⚠️</span>
                    <span style={{ fontFamily:T.sans, fontSize:12, color:T.t1 }}>{typeof inc === 'string' ? inc : inc.description || inc.message || JSON.stringify(inc)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ padding:"14px 22px", borderTop:`1px solid ${T.border}`, display:"flex", gap:10, flexShrink:0 }}>
          <a href={`tel:+226${tel.replace(/\s/g,"")}`} className="af-btn" style={{ flex:1, height:40, borderRadius:10, background:T.bluePl, color:T.blue, border:`1.5px solid ${T.blueBd}`, fontFamily:T.sans, fontSize:13, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:8, textDecoration:"none" }}>📞 Appeler {tel}</a>
          {isAlert && (
            <button className="af-btn" onClick={() => { onSignal(driver.id); onClose(); }} style={{ flex:1, height:40, borderRadius:10, background:T.redD, color:"#fff", fontFamily:T.sans, fontSize:13, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>⚠️ Signaler ce conducteur</button>
          )}
          {driver.statut === "avertissement" && (
            <button className="af-btn" onClick={() => { onSignal(driver.id); onClose(); }} style={{ flex:1, height:40, borderRadius:10, background:T.amberPl, color:T.amber, border:`1.5px solid ${T.amberBd}`, fontFamily:T.sans, fontSize:13, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>⚠️ Émettre un avertissement</button>
          )}
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
const TABS = ["GPS par trajet","Trajets","Parc","Chemins"];

export default function AntiFraude() {
  const [drivers,   setDrivers]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [search,    setSearch]    = useState("");
  const [selected,  setSelected]  = useState(null);
  const [signales,  setSignales]  = useState([]);
  const [notif,     setNotif]     = useState(null);

  /* ── Chargement API ───────────────────────────────────────────────── */
  const fetchFraudAlerts = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/admin/fraud/");
      if (data.success && data.data) {
        // Adapter les données API au format attendu
        const adapted = (data.data || data.results || []).map(d => ({
          ...d,
          id: d.id || `#${Math.random().toString(36).slice(2,8)}`,
          ini: d.ini || (d.nom || d.name || "??").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),
          nom: d.nom || d.name || d.driver_name || "—",
          tel: d.tel || d.telephone || d.phone || "—",
          client: d.client || d.client_name || "—",
          distGps: d.distGps || d.distance_gps_km || 0,
          distParcourue: d.distParcourue || d.distance_deviation_km || 0,
          distTheorique: d.distTheorique || d.estimated_distance_km || 0,
          vitesseMax: d.vitesseMax || d.vitesse_max || 0,
          vitesseMoy: d.vitesseMoy || d.vitesse_moy || 0,
          limiteZone: d.limiteZone || 50,
          detour: d.detour || d.detour_km || 0,
          detourJustifie: d.detourJustifie !== undefined ? d.detourJustifie : (d.detour_justifie || false),
          statut: d.statut || d.status || "ok",
          coords: d.coords || d.gps_points || [],
          incidents: d.incidents || d.alerts || [],
        }));
        setDrivers(adapted);
      }
    } catch (err) {
      console.error("Erreur chargement fraude:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFraudAlerts(); }, []);

  const handleSignal = async (id) => {
    try {
      await API.patch(`/admin/fraud/${id}/resolve/`, { note: "Conducteur signalé par l'administrateur" });
    } catch (err) {
      console.error("Erreur signalement:", err);
    }
    setSignales(p => [...p, id]);
    const d = drivers.find(d => d.id === id);
    setNotif(`✓ Conducteur ${d?.nom || 'inconnu'} signalé`);
    setTimeout(() => setNotif(null), 3500);
  };

  const filtered = drivers.filter(d =>
    (d.nom || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.tel || "").includes(search) ||
    (d.client || "").toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    alerte:        drivers.filter(d => d.statut === "alerte").length,
    avertissement: drivers.filter(d => d.statut === "avertissement").length,
  };

  if (loading) {
    return (
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", background:T.bg, fontFamily:T.mono, color:T.t3 }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:28, marginBottom:10, animation:"af-pulse 1.4s infinite" }}>🔍</div>
          <div>Chargement des données anti-fraude...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex:1, overflowY:"auto", background:T.bg, padding:"26px 28px", display:"flex", flexDirection:"column", gap:18, fontFamily:T.sans }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:3, height:18, borderRadius:2, background:T.green }} />
          <span style={{ fontFamily:T.disp, fontSize:16, fontWeight:800, color:T.t1 }}>Contrôles anti-fraude</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:T.bg1, border:`1px solid ${T.border}`, borderRadius:10, padding:"7px 14px" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={T.t3} strokeWidth="2" width="13" height="13"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Conducteur, client, téléphone..." style={{ border:"none", outline:"none", background:"transparent", fontFamily:T.sans, fontSize:13, color:T.t1, width:220 }} />
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,minmax(0,1fr))", gap:12 }}>
        {[
          { label:"Alertes actives",     val:counts.alerte,        accent:T.red,   pl:T.redPl   },
          { label:"Avertissements",      val:counts.avertissement, accent:T.amber, pl:T.amberPl },
          { label:"Conducteurs signalés",val:signales.length,      accent:T.blue,  pl:T.bluePl  },
        ].map((k,i) => (
          <div key={i} style={{ background:T.bg1, border:`1px solid ${T.border}`, borderRadius:14, padding:"14px 18px", boxShadow:"0 2px 8px rgba(26,71,49,.06)", position:"relative", overflow:"hidden", animation:`af-fadeUp .4s ease ${i*70}ms both` }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${k.accent},${k.accent}44)` }} />
            <div style={{ fontFamily:T.mono, fontSize:9, color:T.t3, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>{k.label}</div>
            <div style={{ fontFamily:T.mono, fontSize:30, fontWeight:500, color:k.accent, lineHeight:1 }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:0, borderBottom:`2px solid ${T.border}` }}>
        {TABS.map((tab, i) => {
          const active = activeTab === i;
          return (
            <button key={tab} className="af-tab" onClick={() => setActiveTab(i)} style={{
              padding:"10px 22px", borderBottom: active ? `2px solid ${T.greenD}` : "2px solid transparent", marginBottom:-2, color: active ? T.greenD : T.t3, fontWeight: active ? 700 : 400, fontFamily:T.sans, fontSize:13,
            }}>{tab}</button>
          );
        })}
      </div>

      {/* Bannière */}
      <div style={{ display:"flex", alignItems:"center", gap:10, background:T.amberPl, border:`1px solid ${T.amberBd}`, borderRadius:10, padding:"10px 14px" }}>
        <span style={{ fontSize:14 }}>⚠️</span>
        <span style={{ fontFamily:T.sans, fontSize:12, color:"#7a5200" }}>
          Les courses avec un écart &gt;15% ou une vitesse excessive doivent être signalées.
          <strong style={{ color:T.amber }}> Cliquez sur une ligne</strong> pour voir le trajet sur carte et agir.
        </span>
      </div>

      {/* Table */}
      <div style={{ background:T.bg1, border:`1px solid ${T.border}`, borderRadius:16, boxShadow:"0 2px 12px rgba(26,71,49,.06)", overflow:"hidden", animation:"af-fadeUp .45s ease .2s both" }}>
        {drivers.length === 0 ? (
          <div style={{ padding:48, textAlign:"center", color:T.t3 }}>Aucune alerte de fraude détectée</div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ background:"#fafbfc" }}>
                  {["Conducteur","Téléphone","Client","Dist. GPS","Dist. Parcourue","Dist. Théorique","Écart","Vit. Max","Détour","Statut","Actions"].map(col => (
                    <th key={col} style={{ padding:"11px 13px", textAlign:"left", fontSize:10, fontFamily:T.mono, color:T.t3, fontWeight:500, textTransform:"uppercase", letterSpacing:.9, borderBottom:`1.5px solid ${T.border2}`, whiteSpace:"nowrap" }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => {
                  const sc  = STATUT_CFG[d.statut] || STATUT_CFG.ok;
                  const eP  = ecartPct(d);
                  const overspeed = d.vitesseMax > d.limiteZone;
                  const rowClass = d.statut === "alerte" ? "af-row af-row-alert" : d.statut === "avertissement" ? "af-row af-row-warn" : "af-row";
                  const signale = signales.includes(d.id);

                  return (
                    <tr key={d.id} className={rowClass} onClick={() => setSelected(d)} style={{ borderBottom:`1px solid ${T.border}`, animation:`af-slideIn .4s ease ${i*55}ms both`, opacity: signale ? .55 : 1 }}>
                      <td style={{ padding:"12px 13px", verticalAlign:"middle" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                          <Av ini={d.ini} nom={d.nom} />
                          <div>
                            <div style={{ fontWeight:600, color:T.t1, whiteSpace:"nowrap" }}>{d.nom}</div>
                            <div style={{ fontFamily:T.mono, fontSize:10, color:T.t3 }}>{d.id?.slice(0,8)}</div>
                          </div>
                          {signale && <span style={{ fontFamily:T.mono, fontSize:9, color:T.blue, background:T.bluePl, borderRadius:20, padding:"1px 6px", border:`1px solid ${T.blueBd}` }}>Signalé</span>}
                        </div>
                      </td>
                      <td style={{ padding:"12px 13px", verticalAlign:"middle" }}><div style={{ fontFamily:T.mono, fontSize:11, color:T.t2, whiteSpace:"nowrap" }}>{d.tel}</div></td>
                      <td style={{ padding:"12px 13px", verticalAlign:"middle", color:T.t2, fontSize:12 }}>{d.client}</td>
                      <td style={{ padding:"12px 13px", verticalAlign:"middle" }}><span style={{ fontFamily:T.mono, fontSize:12, color:T.t1 }}>{d.distGps} km</span></td>
                      <td style={{ padding:"12px 13px", verticalAlign:"middle" }}><span style={{ fontFamily:T.mono, fontSize:12, fontWeight:600, color: d.distParcourue > d.distTheorique*1.3 ? T.red : T.t1 }}>{d.distParcourue} km</span></td>
                      <td style={{ padding:"12px 13px", verticalAlign:"middle" }}><span style={{ fontFamily:T.mono, fontSize:12, color:T.t2 }}>{d.distTheorique} km</span></td>
                      <td style={{ padding:"12px 13px", verticalAlign:"middle" }}>
                        <span style={{ display:"inline-block", padding:"3px 9px", borderRadius:20, fontFamily:T.mono, fontSize:11, fontWeight:600, background: eP>30?T.redPl:eP>15?T.amberPl:T.greenPl, color: eP>30?T.red:eP>15?T.amber:T.greenD, border:`1px solid ${eP>30?T.redBd:eP>15?T.amberBd:T.greenBd}` }}>+{eP}%</span>
                      </td>
                      <td style={{ padding:"12px 13px", verticalAlign:"middle" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                          <span style={{ fontFamily:T.mono, fontSize:12, fontWeight:600, color:overspeed?T.red:T.t1 }}>{d.vitesseMax}</span>
                          <span style={{ fontFamily:T.mono, fontSize:10, color:T.t3 }}>km/h</span>
                          {overspeed && <span style={{ fontSize:11 }}>🔴</span>}
                        </div>
                      </td>
                      <td style={{ padding:"12px 13px", verticalAlign:"middle" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                          <span style={{ fontFamily:T.mono, fontSize:12, color: !d.detourJustifie&&d.detour>1 ? T.red : T.t1 }}>{d.detour} km</span>
                          {!d.detourJustifie && d.detour > 0.5 && <span style={{ fontSize:10 }}>⚠️</span>}
                        </div>
                      </td>
                      <td style={{ padding:"12px 13px", verticalAlign:"middle" }}><Tag label={sc.label} bg={sc.bg} bd={sc.bd} color={sc.color} dot={sc.dot} /></td>
                      <td style={{ padding:"12px 13px", verticalAlign:"middle" }}>
                        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                          <button className="af-btn" title="Voir trajet" onClick={e => { e.stopPropagation(); setSelected(d); }} style={{ width:30, height:30, borderRadius:8, background:T.greenPl, border:`1px solid ${T.greenBd}`, color:T.greenD, display:"flex", alignItems:"center", justifyContent:"center" }}>👁</button>
                          <a href={`tel:+226${(d.tel||"").replace(/\s/g,"")}`} onClick={e => e.stopPropagation()} title="Appeler" style={{ width:30, height:30, borderRadius:8, background:T.bluePl, border:`1px solid ${T.blueBd}`, color:T.blue, display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", flexShrink:0 }}>📞</a>
                          {(d.statut === "alerte" || d.statut === "avertissement") && !signale && (
                            <button className="af-btn" title="Signaler" onClick={e => { e.stopPropagation(); handleSignal(d.id); }} style={{ width:30, height:30, borderRadius:8, background:T.redPl, border:`1px solid ${T.redBd}`, color:T.red, display:"flex", alignItems:"center", justifyContent:"center" }}>⚠</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding:"11px 16px", borderTop:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontFamily:T.mono, fontSize:11, color:T.t3 }}>{filtered.length} trajet{filtered.length>1?"s":""} affiché{filtered.length>1?"s":""}</span>
          <div style={{ display:"flex", gap:6 }}>
            {["‹","1","2","3","›"].map((item,i) => <button key={i} style={{ width:28, height:28, borderRadius:7, border:`1px solid ${T.border2}`, background: i===1 ? T.greenD : "transparent", color: i===1 ? "#fff" : T.t2, fontFamily:T.mono, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>{item}</button>)}
          </div>
        </div>
      </div>

      {selected && <TrajetModal driver={selected} onClose={() => setSelected(null)} onSignal={handleSignal} />}
      {notif && <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", background:T.greenD, color:"#fff", borderRadius:10, padding:"11px 22px", fontFamily:T.sans, fontSize:13, fontWeight:500, boxShadow:"0 8px 24px rgba(26,71,49,.25)", zIndex:200, animation:"af-fadeUp .3s ease both" }}>{notif}</div>}
    </div>
  );
}