import { useState, useEffect } from "react";
import API from "../../services/axios_instance";

/* ─── Google Fonts ──────────────────────────────────────────────────── */
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap";
if (!document.querySelector(`link[href="${FONT_LINK}"]`)) {
  const l = document.createElement("link"); l.rel = "stylesheet"; l.href = FONT_LINK;
  document.head.appendChild(l);
}

const T = {
  bg:"#f0f2f5", bg1:"#ffffff",
  green:"#2ecc71", greenD:"#1a4731",
  greenPl:"rgba(46,204,113,0.10)", greenBd:"rgba(46,204,113,0.22)",
  red:"#e74c3c", redPl:"rgba(231,76,60,0.10)", redBd:"rgba(231,76,60,0.22)",
  amber:"#f0a500", amberPl:"rgba(240,165,0,0.10)", amberBd:"rgba(240,165,0,0.22)",
  blue:"#2980b9", bluePl:"rgba(41,128,185,0.10)", blueBd:"rgba(41,128,185,0.22)",
  purple:"#8e44ad", purplePl:"rgba(142,68,173,0.10)", purpleBd:"rgba(142,68,173,0.22)",
  t1:"#1a2332", t2:"#4a5568", t3:"#9aa3b0",
  border:"rgba(26,71,49,0.08)", border2:"rgba(26,71,49,0.14)",
  mono:"'DM Mono', monospace", sans:"'Inter', sans-serif", disp:"'Syne', sans-serif",
};

const CSS = `
  @keyframes op-fadeUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes op-slideIn  { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
  @keyframes op-drawerIn { from{opacity:0;transform:translateX(36px)} to{opacity:1;transform:translateX(0)} }
  @keyframes op-overlayIn{ from{opacity:0} to{opacity:1} }
  @keyframes op-blink    { 0%,100%{opacity:1} 50%{opacity:.3} }
  .op-row          { transition:background .15s; cursor:pointer; }
  .op-row:hover td { background:rgba(46,204,113,.03) !important; }
  .op-row:hover .op-arrow { opacity:1 !important; transform:translateX(0) !important; }
  .op-btn          { transition:all .18s; cursor:pointer; border:none; }
  .op-btn:hover    { filter:brightness(1.08); transform:translateY(-1px); }
  .op-tab          { transition:all .18s; cursor:pointer; background:none; border:none; }
  .op-tab:hover    { color:${T.greenD} !important; }
  .op-close:hover  { background:rgba(0,0,0,.07) !important; }
  .op-kpi:hover    { transform:translateY(-2px); box-shadow:0 6px 20px rgba(26,71,49,.12) !important; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:#d1d9d1; border-radius:4px; }
`;
if (!document.querySelector("#op-css")) {
  const s = document.createElement("style"); s.id = "op-css"; s.textContent = CSS;
  document.head.appendChild(s);
}

/* ─── Configs ─────────────────────────────────────────────────────────── */
const OP_TYPE = {
  depot:   { label:"Dépôt",   icon:"↓", color:T.green,  bg:T.greenPl, bd:T.greenBd },
  retrait: { label:"Retrait", icon:"↑", color:T.red,    bg:T.redPl,   bd:T.redBd   },
};
const OP_STATUT = {
  validé:     { label:"Validé",     bg:T.greenPl, bd:T.greenBd, color:T.greenD },
  en_attente: { label:"En attente", bg:T.amberPl, bd:T.amberBd, color:T.amber  },
  rejeté:     { label:"Rejeté",     bg:T.redPl,   bd:T.redBd,   color:T.red    },
  success:    { label:"Validé",     bg:T.greenPl, bd:T.greenBd, color:T.greenD },
  pending:    { label:"En attente", bg:T.amberPl, bd:T.amberBd, color:T.amber  },
  rejected:   { label:"Rejeté",     bg:T.redPl,   bd:T.redBd,   color:T.red    },
};
const MODE_CFG = {
  mobile_money: { label:"Mobile Money", icon:"📱", color:T.purple },
  en_ligne:     { label:"En ligne",     icon:"💳", color:T.blue   },
  especes:      { label:"Espèces",      icon:"💵", color:T.amber  },
};
const CLIENT_STATUT = {
  actif:    { label:"Actif",    bg:T.greenPl, bd:T.greenBd, color:T.greenD },
  suspendu: { label:"Suspendu", bg:T.redPl,   bd:T.redBd,   color:T.red    },
  active:   { label:"Actif",    bg:T.greenPl, bd:T.greenBd, color:T.greenD },
  suspended:{ label:"Suspendu", bg:T.redPl,   bd:T.redBd,   color:T.red    },
};

const AV_PAL = [
  {bg:"rgba(46,204,113,.15)", c:T.greenD},
  {bg:"rgba(41,128,185,.15)", c:T.blue  },
  {bg:"rgba(240,165,0,.15)",  c:"#7a5200"},
  {bg:"rgba(231,76,60,.15)",  c:T.red   },
  {bg:"rgba(142,68,173,.15)", c:T.purple},
];
const avColor = (s) => AV_PAL[s.charCodeAt(0) % AV_PAL.length];

/* ─── Atoms ──────────────────────────────────────────────────────────── */
function Av({ ini, nom, size=34 }) {
  const txt = ini || (nom || "??").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const p = avColor(txt);
  return <div style={{ width:size, height:size, borderRadius:"50%", flexShrink:0, background:p.bg, color:p.c, border:`1.5px solid ${p.c}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*.34, fontWeight:700, fontFamily:T.mono }}>{txt}</div>;
}

function Tag({ label, bg, bd, color }) {
  return <span style={{ display:"inline-flex", alignItems:"center", padding:"4px 11px", borderRadius:20, fontSize:11, fontWeight:600, fontFamily:T.sans, background:bg, color, border:`1px solid ${bd}` }}>{label}</span>;
}

function SH({ title }) {
  return <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:14 }}><div style={{ width:3, height:14, borderRadius:2, background:T.green }}/><span style={{ fontFamily:T.disp, fontSize:13, fontWeight:700, color:T.t1, letterSpacing:.3 }}>{title}</span></div>;
}

function SoldeGauge({ solde, minimum }) {
  const pct   = Math.min((solde / 25000) * 100, 100);
  const color = solde < minimum ? T.red : solde < 2000 ? T.amber : T.green;
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:6 }}>
        <div><div style={{ fontFamily:T.mono, fontSize:9, color:T.t3, textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>Solde du portefeuille</div><div style={{ fontFamily:T.mono, fontSize:28, fontWeight:600, color, lineHeight:1 }}>{solde.toLocaleString()} F</div></div>
        <div style={{ fontFamily:T.mono, fontSize:10, color:T.t3 }}>min. {minimum.toLocaleString()} F</div>
      </div>
      <div style={{ height:8, borderRadius:8, background:T.border2, overflow:"hidden" }}><div style={{ height:"100%", borderRadius:8, width:`${pct}%`, background:`linear-gradient(90deg,${color},${color}99)`, boxShadow:`0 0 8px ${color}55`, transition:"width 1s ease" }}/></div>
      {solde < minimum && <div style={{ fontFamily:T.mono, fontSize:10, color:T.red, marginTop:5 }}>⚠ Solde insuffisant</div>}
    </div>
  );
}

/* ─── Drawer ─────────────────────────────────────────────────────────── */
function ClientDrawer({ client, onClose }) {
  const [tab, setTab] = useState("operations");
  if (!client) return null;
  const cs = CLIENT_STATUT[client.statut || client.status] || CLIENT_STATUT.actif;
  const operations = client.operations || [];
  const totalDepots   = operations.filter(o=> (o.type||o.transaction_type)==="depot"  && (o.statut||o.status)==="validé").reduce((s,o)=>s+(o.montant||o.amount||0), 0);
  const totalRetraits = operations.filter(o=> (o.type||o.transaction_type)==="retrait"&& (o.statut||o.status)==="validé").reduce((s,o)=>s+(o.montant||o.amount||0), 0);
  const enAttente     = operations.filter(o=> (o.statut||o.status)==="en_attente" || (o.statut||o.status)==="pending");
  const nom = client.nom || client.first_name || "—";
  const tel = client.tel || client.phone_number || "—";
  const solde = client.solde || client.balance || 0;
  const soldeMinimum = client.soldeMinimum || 500;

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(10,20,15,.32)", backdropFilter:"blur(2px)", zIndex:99, animation:"op-overlayIn .22s ease both" }}/>
      <div style={{ position:"fixed", top:0, right:0, bottom:0, width:540, background:T.bg1, boxShadow:"-8px 0 48px rgba(10,20,15,.16)", zIndex:100, display:"flex", flexDirection:"column", animation:"op-drawerIn .28s cubic-bezier(.2,.8,.4,1) both", fontFamily:T.sans, overflowY:"auto" }}>

        {/* Header */}
        <div style={{ padding:"18px 22px 0", borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <Av ini={client.ini} nom={nom} size={46}/>
              <div>
                <div style={{ fontFamily:T.disp, fontSize:16, fontWeight:700, color:T.t1, marginBottom:3 }}>{nom}</div>
                <div style={{ fontFamily:T.mono, fontSize:11, color:T.t3, marginBottom:5 }}>{client.id?.slice(0,8) || client.client_code} · {tel}</div>
                <Tag label={cs.label} bg={cs.bg} bd={cs.bd} color={cs.color}/>
              </div>
            </div>
            <button className="op-close" onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:`1px solid ${T.border}`, background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:T.t2 }}>✕</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:14 }}>
            {[
              { label:"Inscrit le", val:client.inscription || client.created_at?.slice(0,10) || "—" },
              { label:"Courses",    val:client.totalCourses || client.total_rides || 0 },
              { label:"Ville",      val:client.ville || client.activity_zone || "—" },
            ].map((item,i) => (
              <div key={i} style={{ background:T.bg, borderRadius:9, padding:"8px 10px", border:`1px solid ${T.border}` }}><div style={{ fontFamily:T.mono, fontSize:9, color:T.t3, textTransform:"uppercase", letterSpacing:.8, marginBottom:3 }}>{item.label}</div><div style={{ fontFamily:T.mono, fontSize:12, fontWeight:600, color:T.t1 }}>{item.val}</div></div>
            ))}
          </div>
          <div style={{ display:"flex", gap:0 }}>
            {[{ id:"operations", label:"Opérations" },{ id:"solde", label:"Solde & Stats" }].map(t => {
              const active = tab === t.id;
              return <button key={t.id} className="op-tab" onClick={() => setTab(t.id)} style={{ padding:"8px 18px", borderBottom:active?`2px solid ${T.greenD}`:"2px solid transparent", marginBottom:-1, color:active?T.greenD:T.t3, fontWeight:active?700:400, fontFamily:T.sans, fontSize:12 }}>
                {t.label}
                {t.id==="operations" && enAttente.length > 0 && <span style={{ marginLeft:6, background:T.amberPl, color:T.amber, border:`1px solid ${T.amberBd}`, borderRadius:20, fontSize:9, fontFamily:T.mono, padding:"1px 6px" }}>{enAttente.length}</span>}
              </button>;
            })}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, padding:"18px 22px", display:"flex", flexDirection:"column", gap:16 }}>

          {tab === "operations" && (
            <div style={{ background:T.bg1, border:`1px solid ${T.border}`, borderRadius:12, overflow:"hidden" }}>
              <div style={{ padding:"14px 16px", borderBottom:`1px solid ${T.border}` }}><SH title="Historique des opérations"/></div>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead><tr style={{ background:"#fafbfc" }}>{["Type","Montant","Mode","Date","Réf.","Statut"].map(h => <th key={h} style={{ padding:"8px 14px", textAlign:"left", fontSize:9, fontFamily:T.mono, color:T.t3, fontWeight:500, textTransform:"uppercase", letterSpacing:.8, borderBottom:`1px solid ${T.border2}` }}>{h}</th>)}</tr></thead>
                <tbody>
                  {operations.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding:24, textAlign:"center", color:T.t3 }}>Aucune opération</td></tr>
                  ) : (
                    operations.map((op, i) => {
                      const ot = OP_TYPE[op.type || op.transaction_type] || OP_TYPE.depot;
                      const os = OP_STATUT[op.statut || op.status] || OP_STATUT.en_attente;
                      const mc = MODE_CFG[op.mode] || MODE_CFG.mobile_money;
                      const montant = op.montant || op.amount || 0;
                      return (
                        <tr key={op.id || i} style={{ borderBottom:`1px solid ${T.border}`, animation:`op-slideIn .35s ease ${i*45}ms both` }}>
                          <td style={{ padding:"10px 14px" }}><div style={{ display:"flex", alignItems:"center", gap:7 }}><div style={{ width:28, height:28, borderRadius:7, background:ot.bg, border:`1px solid ${ot.bd}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:ot.color }}>{ot.icon}</div><span style={{ fontFamily:T.sans, fontSize:12, fontWeight:600, color:ot.color }}>{ot.label}</span></div></td>
                          <td style={{ padding:"10px 14px" }}><span style={{ fontFamily:T.mono, fontSize:13, fontWeight:700, color: (op.type||op.transaction_type)==="depot"?T.greenD:T.red }}>{(op.type||op.transaction_type)==="depot"?"+":"-"}{montant.toLocaleString()} F</span></td>
                          <td style={{ padding:"10px 14px" }}><span style={{ fontFamily:T.sans, fontSize:11, color:T.t2 }}>{mc.icon} {mc.label}</span></td>
                          <td style={{ padding:"10px 14px" }}><div style={{ fontFamily:T.mono, fontSize:11, color:T.t1 }}>{op.date || op.created_at?.slice(0,10)}</div><div style={{ fontFamily:T.mono, fontSize:10, color:T.t3 }}>{op.heure || "—"}</div></td>
                          <td style={{ padding:"10px 14px" }}><span style={{ fontFamily:T.mono, fontSize:10, color:T.t3 }}>{op.ref || op.reference || "—"}</span></td>
                          <td style={{ padding:"10px 14px" }}><Tag label={os.label} bg={os.bg} bd={os.bd} color={os.color}/></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "solde" && (<>
            <div style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:12, padding:"16px 18px" }}><SH title="Portefeuille"/><SoldeGauge solde={solde} minimum={soldeMinimum}/></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[
                { label:"Total dépôts validés",   val:`+${totalDepots.toLocaleString()} F`,   color:T.green, bg:T.greenPl, bd:T.greenBd, icon:"↓" },
                { label:"Total retraits validés",  val:`-${totalRetraits.toLocaleString()} F`, color:T.red,   bg:T.redPl,   bd:T.redBd,   icon:"↑" },
              ].map((item,i) => (
                <div key={i} style={{ background:item.bg, border:`1px solid ${item.bd}`, borderRadius:12, padding:"14px 16px" }}><div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}><div style={{ width:28, height:28, borderRadius:7, background:T.bg1, border:`1px solid ${item.bd}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:700, color:item.color }}>{item.icon}</div><span style={{ fontFamily:T.mono, fontSize:9, color:T.t3, textTransform:"uppercase", letterSpacing:1 }}>{item.label}</span></div><div style={{ fontFamily:T.mono, fontSize:20, fontWeight:700, color:item.color }}>{item.val}</div></div>
              ))}
            </div>
            <div style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:12, padding:"14px 16px" }}>
              <SH title="Répartition des opérations"/>
              {[
                { label:"Dépôts",       count:operations.filter(o=> (o.type||o.transaction_type)==="depot").length,   color:T.green },
                { label:"Retraits",     count:operations.filter(o=> (o.type||o.transaction_type)==="retrait").length, color:T.red   },
                { label:"Validées",     count:operations.filter(o=> ((o.statut||o.status)==="validé"||(o.statut||o.status)==="success")).length,   color:T.greenD },
                { label:"En attente",   count:operations.filter(o=> ((o.statut||o.status)==="en_attente"||(o.statut||o.status)==="pending")).length,color:T.amber  },
                { label:"Rejetées",     count:operations.filter(o=> ((o.statut||o.status)==="rejeté"||(o.statut||o.status)==="rejected")).length,   color:T.red    },
              ].map((item,i) => {
                const pct = operations.length > 0 ? Math.round(item.count/operations.length*100) : 0;
                return (
                  <div key={i} style={{ marginBottom:i<4?12:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                      <span style={{ fontFamily:T.sans, fontSize:12, color:T.t2 }}>{item.label}</span>
                      <div style={{ display:"flex", gap:8 }}><span style={{ fontFamily:T.mono, fontSize:11, fontWeight:600, color:item.color }}>{pct}%</span><span style={{ fontFamily:T.mono, fontSize:10, color:T.t3 }}>{item.count}</span></div>
                    </div>
                    <div style={{ height:5, borderRadius:5, background:T.border2, overflow:"hidden" }}><div style={{ height:"100%", borderRadius:5, width:`${pct}%`, background:`linear-gradient(90deg,${item.color},${item.color}88)`, boxShadow:`0 0 6px ${item.color}44`, transition:"width 1s ease" }}/></div>
                  </div>
                );
              })}
            </div>
            <div style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:12, padding:"14px 16px" }}>
              <SH title="Contact"/>
              {[{ label:"Téléphone", val:tel },{ label:"Email", val:client.email || "—" },{ label:"Ville", val:client.ville || "—" }].map((item,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:i<2?`1px solid ${T.border}`:"none" }}><span style={{ fontFamily:T.sans, fontSize:12, color:T.t3 }}>{item.label}</span><span style={{ fontFamily:T.mono, fontSize:12, fontWeight:600, color:T.t1 }}>{item.val}</span></div>
              ))}
            </div>
          </>)}
        </div>

        {/* Footer — juste fermer */}
        <div style={{ padding:"14px 22px", borderTop:`1px solid ${T.border}`, display:"flex", gap:10, flexShrink:0 }}>
          <button className="op-btn" onClick={onClose} style={{ flex:1, height:42, borderRadius:10, background:T.bg, color:T.t2, border:`1px solid ${T.border2}`, fontFamily:T.sans, fontSize:13, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center" }}>Fermer</button>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
const TABS = ["Tous","Actifs","Suspendus","En attente"];

export default function ClientsOperationsPage() {
  const [clients,   setClients]   = useState([]);
  const [stats,     setStats]     = useState({ total_soldes:0, depots_mois:0, retraits_mois:0, ops_en_attente:0 });
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("Tous");
  const [search,    setSearch]    = useState("");
  const [selected,  setSelected]  = useState(null);

  /* ── Chargement API ───────────────────────────────────────────────── */
  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab === "Actifs")     params.status = "Actifs";
      else if (activeTab === "Suspendus")  params.status = "Suspendus";
      else if (activeTab === "En attente") params.status = "En attente";
      if (search) params.search = search;

      const { data } = await API.get("/admin/operations/clients/", { params });
      const statsRes = await API.get("/admin/operations/stats/");

      if (data.success) {
        const adapted = (data.data || []).map(c => ({
          ...c,
          id: c.id || c.client_code,
          ini: c.ini || (c.first_name || c.nom || "??").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),
          nom: c.nom || c.first_name || c.full_name || "—",
          tel: c.tel || c.phone_number || "—",
          email: c.email || "—",
          ville: c.ville || c.activity_zone || "—",
          solde: c.solde || c.balance || 0,
          soldeMinimum: c.soldeMinimum || 500,
          statut: c.statut || c.status || "actif",
          inscription: c.inscription || c.created_at?.slice(0,10) || "—",
          totalCourses: c.totalCourses || c.total_rides || 0,
          operations: (c.operations || []).map(o => ({
            ...o,
            type: o.type || o.transaction_type || "depot",
            montant: o.montant || o.amount || 0,
            mode: o.mode || "mobile_money",
            date: o.date || o.created_at?.slice(0,10) || "—",
            heure: o.heure || "—",
            statut: o.statut || o.status || "validé",
            ref: o.ref || o.reference || "—",
          })),
        }));
        setClients(adapted);
      }
      if (statsRes.data.success && statsRes.data.data) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error("Erreur chargement clients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, [activeTab]);
  useEffect(() => { const t = setTimeout(() => fetchClients(), 400); return () => clearTimeout(t); }, [search]);

  const opsEnAttente = stats.ops_en_attente || clients.reduce((n, c) => n + (c.operations||[]).filter(o=> (o.statut||o.status)==="en_attente"||(o.statut||o.status)==="pending").length, 0);

  const counts = {
    "Tous":       clients.length,
    "Actifs":     clients.filter(c=> (c.statut||c.status)==="actif"||(c.statut||c.status)==="active").length,
    "Suspendus":  clients.filter(c=> (c.statut||c.status)==="suspendu"||(c.statut||c.status)==="suspended").length,
    "En attente": clients.filter(c=> (c.operations||[]).some(o=> (o.statut||o.status)==="en_attente"||(o.statut||o.status)==="pending")).length,
  };

  const tabColor = (tab) => tab==="Actifs"?T.greenD:tab==="Suspendus"?T.red:tab==="En attente"?T.amber:T.greenD;

  if (loading) {
    return <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", background:T.bg, fontFamily:T.mono, color:T.t3 }}><div style={{ textAlign:"center" }}><div style={{ fontSize:28, marginBottom:10, animation:"op-blink 1.4s infinite" }}>💳</div><div>Chargement des clients...</div></div></div>;
  }

  return (
    <div style={{ flex:1, overflowY:"auto", background:T.bg, padding:"26px 28px", display:"flex", flexDirection:"column", gap:18, fontFamily:T.sans }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}><div style={{ width:3, height:20, borderRadius:2, background:T.green }}/><span style={{ fontFamily:T.disp, fontSize:17, fontWeight:800, color:T.t1, letterSpacing:-.2 }}>Gestion des clients & opérations</span></div>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:T.bg1, border:`1px solid ${T.border}`, borderRadius:10, padding:"7px 14px" }}><svg viewBox="0 0 24 24" fill="none" stroke={T.t3} strokeWidth="2" width="13" height="13"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom, téléphone, ID..." style={{ border:"none", outline:"none", background:"transparent", fontFamily:T.sans, fontSize:13, color:T.t1, width:200 }}/></div>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,minmax(0,1fr))", gap:12 }}>
        {[
          { label:"Total soldes",     val:`${((stats.total_soldes||0)/1000).toFixed(0)}K F`, accent:T.greenD },
          { label:"Dépôts du mois",   val:`${((stats.depots_mois||0)/1000).toFixed(0)}K F`, accent:T.green  },
          { label:"Retraits du mois", val:`${((stats.retraits_mois||0)/1000).toFixed(0)}K F`,accent:T.red   },
          { label:"Ops en attente",   val:opsEnAttente,                                     accent:T.amber  },
        ].map((k,i) => (
          <div key={i} className="op-kpi" style={{ background:T.bg1, border:`1px solid ${T.border}`, borderRadius:14, padding:"14px 18px", boxShadow:"0 2px 8px rgba(26,71,49,.06)", position:"relative", overflow:"hidden", animation:`op-fadeUp .4s ease ${i*65}ms both`, transition:"transform .2s, box-shadow .2s" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${k.accent},${k.accent}44)` }}/>
            <div style={{ fontFamily:T.mono, fontSize:9, color:T.t3, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>{k.label}</div>
            <div style={{ fontFamily:T.mono, fontSize:28, fontWeight:500, color:k.accent, lineHeight:1 }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:0, borderBottom:`2px solid ${T.border}` }}>
        {TABS.map(tab => {
          const active = activeTab===tab;
          return <button key={tab} className="op-tab" onClick={() => setActiveTab(tab)} style={{ padding:"10px 20px", borderBottom:active?`2px solid ${tabColor(tab)}`:"2px solid transparent", marginBottom:-2, color:active?tabColor(tab):T.t3, fontWeight:active?700:400, fontFamily:T.sans, fontSize:13, display:"flex", alignItems:"center", gap:7 }}>
            {tab}<span style={{ fontFamily:T.mono, fontSize:10, background:active?`${tabColor(tab)}15`:"rgba(0,0,0,.04)", color:active?tabColor(tab):T.t3, border:active?`1px solid ${tabColor(tab)}33`:"1px solid transparent", borderRadius:20, padding:"1px 7px" }}>{counts[tab]}</span>
          </button>;
        })}
      </div>

      {/* Table */}
      <div style={{ background:T.bg1, border:`1px solid ${T.border}`, borderRadius:16, boxShadow:"0 2px 12px rgba(26,71,49,.06)", overflow:"hidden", animation:"op-fadeUp .45s ease .2s both" }}>
        {clients.length === 0 ? <div style={{ padding:48, textAlign:"center", color:T.t3 }}>Aucun client trouvé</div> : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead><tr style={{ background:"#fafbfc" }}>{["Client","Téléphone","Solde","Ops totales","Dépôts validés","Retraits validés","En attente","Statut"].map(col => <th key={col} style={{ padding:"11px 14px", textAlign:"left", fontSize:10, fontFamily:T.mono, color:T.t3, fontWeight:500, textTransform:"uppercase", letterSpacing:.9, borderBottom:`1.5px solid ${T.border2}`, whiteSpace:"nowrap" }}>{col}</th>)}</tr></thead>
              <tbody>
                {clients.map((c,i) => {
                  const cs = CLIENT_STATUT[c.statut||c.status] || CLIENT_STATUT.actif;
                  const ops = c.operations || [];
                  const depots   = ops.filter(o=> (o.type||o.transaction_type)==="depot"  && ((o.statut||o.status)==="validé"||(o.statut||o.status)==="success")).reduce((s,o)=>s+(o.montant||o.amount||0),0);
                  const retraits = ops.filter(o=> (o.type||o.transaction_type)==="retrait"&& ((o.statut||o.status)==="validé"||(o.statut||o.status)==="success")).reduce((s,o)=>s+(o.montant||o.amount||0),0);
                  const attente  = ops.filter(o=> (o.statut||o.status)==="en_attente"||(o.statut||o.status)==="pending").length;
                  return (
                    <tr key={c.id} className="op-row" onClick={() => setSelected(c)} style={{ borderBottom:`1px solid ${T.border}`, animation:`op-slideIn .4s ease ${i*50}ms both` }}>
                      <td style={{ padding:"12px 14px" }}><div style={{ display:"flex", alignItems:"center", gap:9 }}><Av ini={c.ini} nom={c.nom} size={30}/><div><div style={{ fontFamily:T.sans, fontWeight:600, color:T.t1, fontSize:13 }}>{c.nom}</div><div style={{ fontFamily:T.mono, fontSize:10, color:T.t3 }}>{c.id?.slice(0,8) || c.client_code}</div></div></div></td>
                      <td style={{ padding:"12px 14px" }}><span style={{ fontFamily:T.mono, fontSize:12, color:T.t2 }}>{c.tel}</span></td>
                      <td style={{ padding:"12px 14px" }}><span style={{ fontFamily:T.mono, fontSize:13, fontWeight:700, color:(c.solde||0) < (c.soldeMinimum||500) ? T.red : T.greenD }}>{(c.solde||0).toLocaleString()} F</span></td>
                      <td style={{ padding:"12px 14px" }}><span style={{ fontFamily:T.mono, fontSize:12, color:T.t2 }}>{ops.length}</span></td>
                      <td style={{ padding:"12px 14px" }}><span style={{ fontFamily:T.mono, fontSize:12, fontWeight:600, color:T.green }}>+{depots.toLocaleString()} F</span></td>
                      <td style={{ padding:"12px 14px" }}><span style={{ fontFamily:T.mono, fontSize:12, fontWeight:600, color:T.red }}>-{retraits.toLocaleString()} F</span></td>
                      <td style={{ padding:"12px 14px" }}>{attente > 0 ? <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:T.amberPl, color:T.amber, border:`1px solid ${T.amberBd}`, borderRadius:20, fontSize:11, fontWeight:600, padding:"3px 10px" }}><span style={{ width:6, height:6, borderRadius:"50%", background:T.amber, animation:"op-blink 1.4s infinite" }}/>{attente} en att.</span> : <span style={{ fontFamily:T.mono, fontSize:11, color:T.t3 }}>—</span>}</td>
                      <td style={{ padding:"12px 14px" }}><div style={{ display:"flex", alignItems:"center", gap:8 }}><Tag label={cs.label} bg={cs.bg} bd={cs.bd} color={cs.color}/><div className="op-arrow" style={{ color:T.t3, opacity:0, transform:"translateX(-5px)", transition:"all .18s" }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="9 18 15 12 9 6"/></svg></div></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding:"11px 16px", borderTop:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}><span style={{ fontFamily:T.mono, fontSize:11, color:T.t3 }}>{clients.length} client{clients.length>1?"s":""} affiché{clients.length>1?"s":""}</span></div>
      </div>

      {selected && <ClientDrawer client={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}