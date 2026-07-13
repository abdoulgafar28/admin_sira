import { useState, useEffect } from "react";
import API from "../../services/axios_instance";
import DriversValidationPage from "./driver_validation_page";
import SurveillancePage from "./surveillance_page";
import AntiFraudPage from "./fraude_control_page";

/* ─── Google Fonts ──────────────────────────────────────────────────── */
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap";
if (!document.querySelector(`link[href="${FONT_LINK}"]`)) {
  const l = document.createElement("link"); l.rel = "stylesheet"; l.href = FONT_LINK;
  document.head.appendChild(l);
}

const T = {
  bg0:     "#f0f2f5",
  bg1:     "#ffffff",
  bg2:     "#f8faf8",
  
  green:   "#2ecc71",
  greenD:  "#1a4731",
  greenM:  "#27ae60",
  greenPl: "rgba(46,204,113,0.10)",
  greenBd: "rgba(46,204,113,0.22)",
  red:     "#e74c3c",
  redPl:   "rgba(231,76,60,0.10)",
  redBd:   "rgba(231,76,60,0.22)",
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

const GLOBAL_CSS = `
  @keyframes sira-fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes sira-countUp { from{opacity:0;transform:scale(.82)} to{opacity:1;transform:scale(1)} }
  @keyframes sira-slideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
  @keyframes sira-pulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(46,204,113,.5)} 50%{opacity:.7;box-shadow:0 0 0 5px rgba(46,204,113,0)} }
  .sira-kpi { transition:transform .2s, box-shadow .2s; cursor:default; }
  .sira-kpi:hover { transform:translateY(-3px); box-shadow:0 8px 28px rgba(26,71,49,.13) !important; }
  .sira-kpi:hover .sira-kpi-shine { opacity:1 !important; }
  .sira-row:hover td { background:rgba(46,204,113,.035) !important; }
  .sira-arow:hover { background:rgba(231,76,60,.04) !important; }
  .sira-cond:hover { background:rgba(46,204,113,.04) !important; }
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:#d1d9d1; border-radius:4px; }
`;
if (!document.querySelector("#sira-css")) {
  const s = document.createElement("style"); s.id = "sira-css"; s.textContent = GLOBAL_CSS;
  document.head.appendChild(s);
}

const STATUT_MAP = {
  terminée: { label:"Terminée", bg:T.greenPl, bd:T.greenBd, color:T.greenD },
  en_cours: { label:"En cours", bg:T.bluePl,  bd:T.blueBd,  color:T.blue   },
  annulée:  { label:"Annulée",  bg:T.redPl,   bd:T.redBd,   color:T.red    },
  litige:   { label:"Litige",   bg:T.amberPl, bd:T.amberBd, color:T.amber  },
  completed:  { label:"Terminée", bg:T.greenPl, bd:T.greenBd, color:T.greenD },
  cancelled:  { label:"Annulée",  bg:T.redPl,   bd:T.redBd,   color:T.red    },
};

const AV_PAL = [
  { bg:"rgba(46,204,113,.14)",  c:T.greenD },
  { bg:"rgba(41,128,185,.14)",  c:T.blue   },
  { bg:"rgba(240,165,0,.14)",   c:"#7a5200" },
  { bg:"rgba(231,76,60,.14)",   c:T.red    },
  { bg:"rgba(26,71,49,.14)",    c:T.greenD },
];
const avColor  = (s) => AV_PAL[s.charCodeAt(0) % AV_PAL.length];
const nivColor = (n) => n === "red" ? T.red : n === "amber" ? T.amber : T.blue;
const nivPl    = (n) => n === "red" ? T.redPl : n === "amber" ? T.amberPl : T.bluePl;
const nivBd    = (n) => n === "red" ? T.redBd : n === "amber" ? T.amberBd : T.blueBd;

function Av({ ini, size = 32 }) {
  const p = avColor(ini);
  return <div style={{ width:size, height:size, borderRadius:"50%", flexShrink:0, background:p.bg, color:p.c, border:`1.5px solid ${p.c}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size * 0.36, fontWeight:700, fontFamily:T.mono }}>{ini}</div>;
}

function Tag({ label, bg, bd, color }) {
  return <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:500, fontFamily:T.sans, background:bg, color, border:`1px solid ${bd}` }}>{label}</span>;
}

function Badge({ label, color, bg, bd }) {
  return <span style={{ fontFamily:T.mono, fontSize:10, fontWeight:500, background:bg, color, border:`1px solid ${bd}`, borderRadius:20, padding:"2px 9px" }}>{label}</span>;
}

function SH({ title, right }) {
  return <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}><div style={{ display:"flex", alignItems:"center", gap:10 }}><div style={{ width:3, height:16, borderRadius:2, background:T.green }}/><span style={{ fontFamily:T.disp, fontSize:13, fontWeight:700, color:T.t1, letterSpacing:.4 }}>{title}</span></div>{right}</div>;
}

function KpiCard({ label, value, sub, accent, accentPl, icon, delay = 0 }) {
  return (
    <div className="sira-kpi" style={{ position:"relative", overflow:"hidden", background:T.bg1, border:`1px solid ${T.border}`, borderRadius:16, padding:"20px 22px", boxShadow:"0 2px 10px rgba(26,71,49,.07)", display:"flex", flexDirection:"column", gap:10, animation:"sira-fadeUp .5s ease both", animationDelay:`${delay}ms` }}>
      <div className="sira-kpi-shine" style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 0% 0%, ${accentPl} 0%, transparent 65%)`, opacity:0, transition:"opacity .3s", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${accent}, ${accent}44)`, borderRadius:"16px 16px 0 0" }}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginTop:4 }}><span style={{ fontSize:10, fontFamily:T.mono, color:T.t3, textTransform:"uppercase", letterSpacing:1 }}>{label}</span><span style={{ fontSize:20, opacity:.75 }}>{icon}</span></div>
      <div style={{ fontFamily:T.mono, fontSize:36, fontWeight:500, color:T.t1, lineHeight:1, animation:"sira-countUp .6s ease both", animationDelay:`${delay + 100}ms` }}>{value}</div>
      <div style={{ fontFamily:T.sans, fontSize:12, color:T.t2 }}>{sub}</div>
    </div>
  );
}

function Card({ children, style = {}, delay = 0 }) {
  return <div style={{ background:T.bg1, border:`1px solid ${T.border}`, borderRadius:16, padding:"18px 20px", boxShadow:"0 2px 10px rgba(26,71,49,.06)", animation:"sira-fadeUp .5s ease both", animationDelay:`${delay}ms`, ...style }}>{children}</div>;
}

function CoursesTable({ rows }) {
  const TH = ({ children }) => <th style={{ textAlign:"left", padding:"8px 12px", fontSize:10, fontFamily:T.mono, color:T.t3, textTransform:"uppercase", letterSpacing:.9, borderBottom:`1.5px solid ${T.border2}`, fontWeight:500 }}>{children}</th>;
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead><tr><TH>#</TH><TH>Conducteur</TH><TH>Client</TH><TH>Dist.</TH><TH>Montant</TH><TH>Statut</TH><TH>Heure</TH></tr></thead>
        <tbody>
          {rows.map((c, i) => {
            const st = STATUT_MAP[c.statut || c.status] ?? { label:c.statut||c.status||"—", bg:"#eee", bd:"#ccc", color:T.t2 };
            const ini = c.ini || (c.conducteur || c.nom || "??").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
            const nom = c.conducteur || c.nom || c.driver_name || "—";
            const client = c.client || c.client_name || "—";
            const dist = c.dist || c.distance || "—";
            const montant = c.montant || c.total_fare || 0;
            const heure = c.heure || (c.created_at ? c.created_at.slice(11,16) : "—");
            return (
              <tr key={c.id || i} className="sira-row" style={{ animation:"sira-slideIn .4s ease both", animationDelay:`${i * 45}ms` }}>
                <td style={{ padding:"10px 12px", color:T.t3, fontFamily:T.mono, fontSize:11 }}>#{String(c.id).slice(0,8)}</td>
                <td style={{ padding:"10px 12px" }}><div style={{ display:"flex", alignItems:"center", gap:9 }}><Av ini={ini}/><span style={{ fontFamily:T.sans, fontWeight:500, color:T.t1 }}>{nom}</span></div></td>
                <td style={{ padding:"10px 12px", color:T.t2, fontFamily:T.sans }}>{client}</td>
                <td style={{ padding:"10px 12px", color:T.t2, fontFamily:T.mono }}>{dist}</td>
                <td style={{ padding:"10px 12px", fontFamily:T.mono, fontWeight:500, color:T.greenD }}>{Number(montant).toLocaleString()} F</td>
                <td style={{ padding:"10px 12px" }}><Tag label={st.label} bg={st.bg} bd={st.bd} color={st.color}/></td>
                <td style={{ padding:"10px 12px", color:T.t3, fontFamily:T.mono, fontSize:11 }}>{heure}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
function DashboardContent() {
  const [statsData,   setStatsData]   = useState(null);
  const [recentRides, setRecentRides] = useState([]);
  const [alerts,      setAlerts]      = useState([]);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, ridesRes, alertsRes, driversRes] = await Promise.all([
          API.get("/admin/dashboard/stats/"),
          API.get("/admin/dashboard/recent-rides/"),
          API.get("/admin/dashboard/alerts/"),
          API.get("/admin/dashboard/pending-validations/"),
        ]);

        if (statsRes.data.success) setStatsData(statsRes.data.data);
        if (ridesRes.data.success) setRecentRides(ridesRes.data.data || []);
        if (alertsRes.data.success) setAlerts(alertsRes.data.data || []);
        if (driversRes.data.success) setPendingDrivers(driversRes.data.data || []);
      } catch (err) {
        console.error("Erreur dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const courses  = statsData?.courses || {};
  const drivers  = statsData?.conducteurs || {};
  const finances = statsData?.finances || {};
  const fraud    = statsData?.fraude || {};

  const repartition = [
    { label:"Terminées", count: courses.terminees || 0, pct: Math.round(((courses.terminees||0)/(courses.total_today||1))*100) || 0, color:T.green,  pl:T.greenPl },
    { label:"En cours",  count: courses.en_cours  || 0, pct: Math.round(((courses.en_cours||0)/(courses.total_today||1))*100)  || 0, color:T.blue,   pl:T.bluePl  },
    { label:"Annulées",  count: courses.annulees  || 0, pct: Math.round(((courses.annulees||0)/(courses.total_today||1))*100)  || 0, color:T.red,    pl:T.redPl   },
    { label:"Litiges",   count: courses.litiges   || 0, pct: Math.round(((courses.litiges||0)/(courses.total_today||1))*100)   || 0, color:T.amber,  pl:T.amberPl },
  ];

  if (loading) {
    return <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", background:T.bg0, fontFamily:T.mono, color:T.t3 }}><div style={{ textAlign:"center" }}><div style={{ fontSize:28, marginBottom:10, animation:"sira-pulse 1.4s infinite" }}>📊</div><div>Chargement du tableau de bord...</div></div></div>;
  }

  return (
    <div style={{ flex:1, overflowY:"auto", background:T.bg0, padding:"26px 28px", display:"flex", flexDirection:"column", gap:20 }}>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, minmax(0,1fr))", gap:14 }}>
        <KpiCard label="Courses aujourd'hui" value={courses.total_today || 0}   sub={`${courses.total_month || 0} ce mois`} accent={T.green} accentPl={T.greenPl} icon="🛵" delay={0}   />
        <KpiCard label="Conducteurs actifs"  value={drivers.actifs || 0}        sub={`${drivers.en_course || 0} en course`}    accent={T.blue}  accentPl={T.bluePl}  icon="👤" delay={70}  />
        <KpiCard label="Revenus du jour"     value={`${(finances.revenus_jour || 0).toLocaleString()} F`} sub={`${(finances.revenus_mois || 0).toLocaleString()} F ce mois`} accent={T.amber} accentPl={T.amberPl} icon="💳" delay={140} />
        <KpiCard label="Litiges ouverts"     value={courses.litiges || 0}        sub={`${fraud.alertes_pending || 0} alertes fraude`} accent={T.red}   accentPl={T.redPl}   icon="⚠" delay={210} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1.55fr) minmax(0,1fr)", gap:16 }}>

        {/* Courses récentes */}
        <Card delay={280}>
          <SH title="Dernières courses" right={<Badge label={`${recentRides.length} courses`} color={T.greenD} bg={T.greenPl} bd={T.greenBd} />} />
          <CoursesTable rows={recentRides} />
        </Card>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Alertes */}
          <Card delay={320}>
            <SH title="Alertes actives" right={<Badge label={`${alerts.length} alertes`} color={T.red} bg={T.redPl} bd={T.redBd} />} />
            <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
              {alerts.length === 0 ? <div style={{ padding:16, textAlign:"center", color:T.t3, fontSize:12 }}>Aucune alerte</div> : alerts.map((a, i) => (
                <div key={a.id || i} className="sira-arow" style={{ display:"flex", gap:10, padding:"9px 8px", borderRadius:10, transition:"background .15s", cursor:"default", animation:"sira-slideIn .4s ease both", animationDelay:`${i * 55}ms` }}>
                  <div style={{ width:34, height:34, borderRadius:9, flexShrink:0, background:nivPl(a.niv||a.niveau), border:`1px solid ${nivBd(a.niv||a.niveau)}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>{a.icon || "⚠"}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}><span style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:T.t1 }}>{a.titre || a.title}</span><span style={{ fontFamily:T.mono, fontSize:10, color:T.t3, flexShrink:0, marginLeft:6 }}>{a.temps || a.time}</span></div>
                    <div style={{ fontFamily:T.sans, fontSize:11, color:T.t2, marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.detail || a.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Répartition */}
          <Card delay={360}>
            <SH title="Répartition courses" />
            <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
              {repartition.map((r, i) => (
                <div key={r.label} style={{ animation:"sira-fadeUp .4s ease both", animationDelay:`${i * 65}ms` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}><span style={{ fontFamily:T.sans, fontSize:12, color:T.t2 }}>{r.label}</span><div style={{ display:"flex", gap:8, alignItems:"center" }}><span style={{ fontFamily:T.mono, fontSize:11, fontWeight:500, color:r.color }}>{r.pct}%</span><span style={{ fontFamily:T.mono, fontSize:10, color:T.t3 }}>{r.count}</span></div></div>
                  <div style={{ height:5, borderRadius:5, background:T.border2, overflow:"hidden" }}><div style={{ height:"100%", borderRadius:5, background:`linear-gradient(90deg, ${r.color}, ${r.color}99)`, width:`${r.pct}%`, boxShadow:`0 0 8px ${r.color}55`, transition:"width 1.1s cubic-bezier(.4,0,.2,1)" }}/></div>
                </div>
              ))}
            </div>
          </Card>

          {/* Conducteurs en attente */}
          <Card delay={400}>
            <SH title="En attente validation" right={<Badge label={`${pendingDrivers.length}`} color={T.greenD} bg={T.greenPl} bd={T.greenBd} />} />
            <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
              {pendingDrivers.length === 0 ? <div style={{ padding:16, textAlign:"center", color:T.t3, fontSize:12 }}>Aucun conducteur en attente</div> : pendingDrivers.map((c, i) => {
                const ini = c.ini || (c.nom || c.name || "??").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
                const docsOk = c.docs_count || c.docs_status || "0/0";
                const isComplet = typeof docsOk === 'string' ? docsOk.includes('/') ? docsOk.split('/')[0] === docsOk.split('/')[1] : docsOk === 'complets' : false;
                return (
                  <div key={c.id || i} className="sira-cond" style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 8px", borderRadius:10, cursor:"default", transition:"background .15s", animation:"sira-slideIn .4s ease both", animationDelay:`${i * 55}ms` }}>
                    <Av ini={ini} size={36}/>
                    <div style={{ flex:1, minWidth:0 }}><div style={{ fontFamily:T.sans, fontSize:13, fontWeight:500, color:T.t1 }}>{c.nom || c.name}</div><div style={{ fontFamily:T.mono, fontSize:10, color:T.t3 }}>{c.tel || c.phone}</div></div>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                      <Tag label={isComplet ? "Complet" : "Incomplet"} bg={isComplet ? T.greenPl : T.redPl} bd={isComplet ? T.greenBd : T.redBd} color={isComplet ? T.greenD : T.red}/>
                      <span style={{ fontFamily:T.mono, fontSize:10, color:T.t3 }}>{c.date || c.created_at?.slice(0,10) || "—"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PageRenderer({ activePage }) {
  switch (activePage) {
    case "validation":   return <DriversValidationPage />;
    case "surveillance": return <SurveillancePage />;
    case "antifraude":   return <AntiFraudPage />;
    default:             return <DashboardContent />;
  }
}

export default function SiraDashboard() {
  const [activePage] = useState("dashboard");
  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:T.bg0, color:T.t1, fontFamily:T.sans }}>
      <main style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <PageRenderer activePage={activePage} />
      </main>
    </div>
  );
}