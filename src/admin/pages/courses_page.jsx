import { useState, useEffect } from "react";
import API from "../../services/axios_instance";

/* ─── Google Fonts ──────────────────────────────────────────────────── */
const FONT_HREF = "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap";

const T = {
  bg:"#f0f2f5", bg1:"#ffffff", bg2:"#f8faf8",
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

/* ─── CSS complet ───────────────────────────────────────────────────── */
const CSS = `
  @keyframes cr-fadeUp    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cr-slideIn   { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
  @keyframes cr-drawerIn  { from{opacity:0;transform:translateX(36px)} to{opacity:1;transform:translateX(0)} }
  @keyframes cr-modalIn   { from{opacity:0;transform:scale(.95) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes cr-overlayIn { from{opacity:0} to{opacity:1} }
  @keyframes cr-blink     { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes cr-mapDraw   { from{stroke-dashoffset:800} to{stroke-dashoffset:0} }
  @keyframes cr-shimmer   { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
  .cr-row          { transition:background .15s; cursor:pointer; }
  .cr-row:hover td { background:rgba(46,204,113,.03) !important; }
  .cr-row:hover .cr-arrow { opacity:1 !important; transform:translateX(0) !important; }
  .cr-btn          { transition:all .18s; cursor:pointer; border:none; }
  .cr-btn:hover    { filter:brightness(1.08); transform:translateY(-1px); }
  .cr-btn:disabled { opacity:.55; cursor:not-allowed; filter:none; transform:none; }
  .cr-tab          { transition:all .18s; cursor:pointer; background:none; border:none; }
  .cr-tab:hover    { color:${T.greenD} !important; }
  .cr-close:hover  { background:rgba(0,0,0,.07) !important; }
  .cr-step.done    { border-color:${T.green} !important; background:${T.greenPl} !important; }
  .cr-step.active  { border-color:${T.greenD} !important; background:${T.greenD} !important; color:#fff !important; }
  .cr-pkg-card     { transition:all .2s; cursor:pointer; }
  .cr-pkg-card:hover { border-color:${T.green} !important; transform:translateY(-2px); box-shadow:0 6px 20px rgba(26,71,49,.12) !important; }
  .cr-section-tab  { transition:all .18s; cursor:pointer; border:none; background:none; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:#d1d9d1; border-radius:4px; }
`;

/* ─── Configs ───────────────────────────────────────────────────────── */
const STATUT_CFG = {
  en_cours: { label:"En cours",  bg:T.bluePl,  bd:T.blueBd,  color:T.blue,   dot:T.blue  },
  terminée: { label:"Terminée",  bg:T.greenPl, bd:T.greenBd, color:T.greenD, dot:T.green },
  annulée:  { label:"Annulée",   bg:T.redPl,   bd:T.redBd,   color:T.red,    dot:T.red   },
  litige:   { label:"Litige",    bg:T.amberPl, bd:T.amberBd, color:T.amber,  dot:T.amber },
};

const PAIEMENT_CFG = {
  mobile_money: { label:"Mobile Money",     icon:"📱", bg:T.purplePl, bd:T.purpleBd, color:T.purple },
  en_ligne:     { label:"Paiement en ligne",icon:"💳", bg:T.bluePl,   bd:T.blueBd,   color:T.blue   },
  especes:      { label:"Espèces",          icon:"💵", bg:T.amberPl,  bd:T.amberBd,  color:T.amber  },
};

const AV_PAL = [
  {bg:"rgba(46,204,113,.15)",c:T.greenD},{bg:"rgba(41,128,185,.15)",c:T.blue},
  {bg:"rgba(240,165,0,.15)",c:"#7a5200"},{bg:"rgba(231,76,60,.15)",c:T.red},
  {bg:"rgba(142,68,173,.15)",c:T.purple},
];
const avColor = (s) => AV_PAL[(s||"?").charCodeAt(0) % AV_PAL.length];

/* ─── Atoms ─────────────────────────────────────────────────────────── */
function Av({ ini, nom, size=34 }){
  const txt = ini || (nom||"??").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const p = avColor(txt);
  return <div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,background:p.bg,color:p.c,border:`1.5px solid ${p.c}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.34,fontWeight:700,fontFamily:T.mono}}>{txt}</div>;
}

function Tag({ label, bg, bd, color, dot }){
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 11px",borderRadius:20,fontSize:11,fontWeight:600,fontFamily:T.sans,background:bg,color,border:`1px solid ${bd}`}}>
    {dot && <span style={{width:6,height:6,borderRadius:"50%",background:dot,flexShrink:0,animation:dot===T.blue?"cr-blink 1.4s ease-in-out infinite":"none"}}/>}{label}</span>;
}

function Stars({ note }){
  if (!note) return <span style={{fontFamily:T.mono,fontSize:11,color:T.t3}}>—</span>;
  return <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:12,color:T.amber}}>{"★".repeat(Math.round(note))}</span><span style={{fontFamily:T.mono,fontSize:11,color:T.t3}}>{Number(note).toFixed(1)}</span></div>;
}

function SH({ title }){
  return <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:12}}><div style={{width:3,height:14,borderRadius:2,background:T.green}}/><span style={{fontFamily:T.disp,fontSize:13,fontWeight:700,color:T.t1,letterSpacing:.3}}>{title}</span></div>;
}

function InfoRow({ label, value, mono=false, color }){
  return <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${T.border}`}}><span style={{fontFamily:T.sans,fontSize:12,color:T.t3}}>{label}</span><span style={{fontFamily:mono?T.mono:T.sans,fontSize:12,fontWeight:600,color:color||T.t1}}>{value}</span></div>;
}

function SoldeBlock({ course }){
  const suffisant = (course.soldeClient||0) >= (course.soldeMinimum||500);
  const paye = course.clientPaye;
  return <div style={{background:paye?T.greenPl:T.redPl,border:`1.5px solid ${paye?T.greenBd:T.redBd}`,borderRadius:12,padding:"14px 16px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
      <div><div style={{fontFamily:T.mono,fontSize:9,color:T.t3,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Solde du client</div><div style={{fontFamily:T.mono,fontSize:26,fontWeight:600,color:suffisant?T.greenD:T.red,lineHeight:1}}>{(course.soldeClient||0).toLocaleString()} F</div></div>
      <div style={{width:40,height:40,borderRadius:"50%",background:paye?T.greenPl:T.redPl,border:`2px solid ${paye?T.green:T.red}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{paye?"✓":"✗"}</div>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
      <Tag label={paye?"Paiement confirmé":"Non payé"} bg={paye?T.greenPl:T.redPl} bd={paye?T.greenBd:T.redBd} color={paye?T.greenD:T.red} dot={paye?T.green:T.red}/>
      {!suffisant && <span style={{fontFamily:T.mono,fontSize:10,color:T.red}}>Solde insuffisant (min. {(course.soldeMinimum||500).toLocaleString()} F)</span>}
    </div>
  </div>;
}

function PaiementBlock({ modePaiement, montant }){
  if (!modePaiement) return null;
  const cfg = PAIEMENT_CFG[modePaiement] || {};
  return <div style={{background:cfg.bg,border:`1.5px solid ${cfg.bd}`,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
    <div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:42,height:42,borderRadius:10,background:"rgba(255,255,255,.7)",border:`1px solid ${cfg.bd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{cfg.icon}</div><div><div style={{fontFamily:T.mono,fontSize:9,color:T.t3,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Mode de paiement</div><div style={{fontFamily:T.sans,fontSize:14,fontWeight:700,color:cfg.color}}>{cfg.label}</div></div></div>
    <div style={{textAlign:"right"}}><div style={{fontFamily:T.mono,fontSize:9,color:T.t3,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Montant payé</div><div style={{fontFamily:T.mono,fontSize:18,fontWeight:700,color:T.greenD}}>{(montant||0).toLocaleString()} F</div></div>
  </div>;
}

function ColisModal({ course, onClose }){
  if (!course?.colis) return null;
  const { colis } = course;
  return <>
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(10,20,15,.5)",backdropFilter:"blur(4px)",zIndex:200,animation:"cr-overlayIn .22s ease both"}}/>
    <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:440,background:T.bg1,borderRadius:20,boxShadow:"0 24px 64px rgba(10,20,15,.28)",zIndex:201,fontFamily:T.sans,animation:"cr-modalIn .28s cubic-bezier(.2,.8,.4,1) both",overflow:"hidden"}}>
      <div style={{background:`linear-gradient(135deg,${T.greenD},#2a6048)`,padding:"20px 22px 18px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div><div style={{fontFamily:T.mono,fontSize:10,color:"rgba(255,255,255,.6)",letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Détail du colis — {course.id?.slice(0,8)}</div><div style={{fontFamily:T.disp,fontSize:16,fontWeight:700,color:"#fff"}}>{colis.description}</div></div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.25)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>✕</button>
        </div>
        {colis.fragile && <div style={{marginTop:10,display:"inline-flex",alignItems:"center",gap:6,background:"rgba(231,76,60,.25)",border:"1px solid rgba(231,76,60,.4)",borderRadius:20,padding:"3px 10px"}}><span>⚠️</span><span style={{fontFamily:T.mono,fontSize:10,color:"#ffcdd2",fontWeight:600}}>FRAGILE</span></div>}
      </div>
      <div style={{padding:"20px 22px",display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[{icon:"⚖️",label:"Poids",val:colis.poids},{icon:"📐",label:"Dimensions",val:colis.dimensions},{icon:"💰",label:"Valeur décl.",val:colis.valeur>0?`${colis.valeur.toLocaleString()} F`:"Non renseignée"}].map((item,i)=><div key={i} style={{background:T.bg,borderRadius:10,padding:"10px 12px",border:`1px solid ${T.border}`,textAlign:"center"}}><div style={{fontSize:18,marginBottom:4}}>{item.icon}</div><div style={{fontFamily:T.mono,fontSize:9,color:T.t3,textTransform:"uppercase",letterSpacing:.8,marginBottom:3}}>{item.label}</div><div style={{fontFamily:T.mono,fontSize:11,fontWeight:600,color:T.t1}}>{item.val}</div></div>)}
        </div>
        {colis.instructions && colis.instructions!=="—" && <div style={{background:T.amberPl,border:`1px solid ${T.amberBd}`,borderRadius:10,padding:"12px 14px"}}><div style={{display:"flex",gap:8,alignItems:"flex-start"}}><span style={{fontSize:14,flexShrink:0}}>📋</span><div><div style={{fontFamily:T.mono,fontSize:9,color:T.amber,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Instructions de livraison</div><div style={{fontFamily:T.sans,fontSize:13,color:T.t1,lineHeight:1.5}}>{colis.instructions}</div></div></div></div>}
        <div style={{background:T.bg,borderRadius:10,padding:"12px 14px",border:`1px solid ${T.border}`}}>
          <div style={{fontFamily:T.mono,fontSize:9,color:T.t3,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Itinéraire</div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}><div style={{width:8,height:8,borderRadius:"50%",background:T.greenD}}/><span style={{fontFamily:T.sans,fontSize:12,color:T.t1}}>{course.depart}</span></div>
          <div style={{width:1.5,height:12,background:T.border2,marginLeft:3.5,marginBottom:5}}/>
          <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:"50%",background:T.red}}/><span style={{fontFamily:T.sans,fontSize:12,color:T.t1}}>{course.arrivee}</span></div>
        </div>
        <button onClick={onClose} className="cr-btn" style={{width:"100%",height:42,borderRadius:10,background:T.greenD,color:"#fff",fontFamily:T.sans,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center"}}>Fermer</button>
      </div>
    </div>
  </>;
}

function Timeline({ steps }){
  if (!steps || steps.length===0) return <div style={{color:T.t3,fontSize:13}}>Aucun historique disponible</div>;
  return <div style={{display:"flex",flexDirection:"column"}}>
    {steps.map((step,i)=><div key={i} style={{display:"flex",gap:12,position:"relative"}}>
      {i<steps.length-1 && <div style={{position:"absolute",left:11,top:24,bottom:-4,width:1.5,background:step.done?T.green:T.border2}}/>}
      <div className={`cr-step${step.active?" active":step.done?" done":""}`} style={{width:24,height:24,borderRadius:"50%",flexShrink:0,border:`2px solid ${T.border2}`,background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,zIndex:1,...(step.error&&step.active?{borderColor:T.red,background:T.redPl,color:T.red}:{})}}>
        {step.done&&!step.active?"✓":step.active&&step.error?"!":step.active?"●":""}
      </div>
      <div style={{paddingBottom:16,flex:1}}><div style={{fontFamily:T.sans,fontSize:13,fontWeight:step.active?600:500,color:step.active&&step.error?T.red:step.active?T.greenD:step.done?T.t1:T.t3}}>{step.label}</div><div style={{fontFamily:T.mono,fontSize:10,color:T.t3,marginTop:2}}>{step.heure}</div></div>
    </div>)}
  </div>;
}

function LiveMap({ course }){
  const W=476,H=220;
  if (!course.coords || course.coords.length<2) return <div style={{height:H,borderRadius:12,overflow:"hidden",background:"#e8f0e4",border:`1px solid ${T.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}><span style={{fontSize:24,opacity:.4}}>🗺️</span><span style={{fontFamily:T.mono,fontSize:11,color:T.t3}}>Données GPS non disponibles</span></div>;
  const pts=course.coords.map(c=>({x:c.x*W,y:c.y*H}));
  const pathD=pts.map((p,i)=>`${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const progress=(course.progression||0)/100;
  const segIdx=Math.min(Math.floor(progress*(pts.length-1)),pts.length-2);
  const segProg=(progress*(pts.length-1))-segIdx;
  const mx=pts[segIdx]?.x+((pts[segIdx+1]?.x||0)-(pts[segIdx]?.x||0))*segProg||0;
  const my=pts[segIdx]?.y+((pts[segIdx+1]?.y||0)-(pts[segIdx]?.y||0))*segProg||0;
  const isLive=course.statut==="en_cours";
  const routeColor=isLive?T.blue:T.greenD;
  return <div style={{position:"relative",borderRadius:12,overflow:"hidden",background:"#e8f0e4",border:`1px solid ${T.border}`}}>
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
      <rect width={W} height={H} fill="#e8f0e4"/>
      {[...Array(7)].map((_,i)=><line key={`h${i}`} x1={0} y1={i*36} x2={W} y2={i*36} stroke="#d8e8d4" strokeWidth=".6"/>)}
      {[...Array(14)].map((_,i)=><line key={`v${i}`} x1={i*36} y1={0} x2={i*36} y2={H} stroke="#d8e8d4" strokeWidth=".6"/>)}
      <path d={`M0,${H*.5} L${W},${H*.5}`} stroke="#c8d8c4" strokeWidth="5" fill="none" opacity=".5"/>
      <path d={`M${W*.35},0 L${W*.35},${H}`} stroke="#c8d8c4" strokeWidth="3" fill="none" opacity=".5"/>
      <path d={`M${W*.7},0 L${W*.7},${H}`} stroke="#c8d8c4" strokeWidth="5" fill="none" opacity=".5"/>
      <path d={pathD} stroke={routeColor} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="800" strokeDashoffset="800" style={{animation:"cr-mapDraw 1.4s ease forwards"}}/>
      <circle cx={pts[0].x} cy={pts[0].y} r="7" fill={T.greenD} stroke="#fff" strokeWidth="2"/>
      <text x={pts[0].x+10} y={pts[0].y+4} fill={T.t2} fontSize="9" fontFamily={T.mono}>Départ</text>
      <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="7" fill={isLive?T.t3:T.green} stroke="#fff" strokeWidth="2"/>
      <text x={pts[pts.length-1].x+10} y={pts[pts.length-1].y+4} fill={T.t2} fontSize="9" fontFamily={T.mono}>Arrivée</text>
      {isLive && <g transform={`translate(${mx},${my})`}><circle r="13" fill={T.blue} opacity=".18"/><circle r="7" fill={T.blue} stroke="#fff" strokeWidth="2"/><text x="-5" y="4" fontSize="9" fill="#fff">🛵</text></g>}
    </svg>
    {isLive && <div style={{position:"absolute",top:8,left:8,display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.92)",borderRadius:7,padding:"3px 9px",border:`1px solid ${T.blueBd}`}}><span style={{width:6,height:6,borderRadius:"50%",background:T.blue,display:"inline-block",animation:"cr-blink 1.2s infinite"}}/><span style={{fontFamily:T.mono,fontSize:10,color:T.blue,fontWeight:500}}>LIVE — {course.vitesse||0} km/h</span></div>}
  </div>;
}

function ProgressBar({ pct, color }){
  return <div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontFamily:T.mono,fontSize:10,color:T.t3}}>Progression trajet</span><span style={{fontFamily:T.mono,fontSize:11,fontWeight:600,color}}>{pct}%</span></div><div style={{height:6,borderRadius:6,background:T.border2,overflow:"hidden"}}><div style={{height:"100%",borderRadius:6,width:`${pct}%`,background:`linear-gradient(90deg,${color},${color}99)`,boxShadow:`0 0 8px ${color}55`,transition:"width 1s ease"}}/></div></div>;
}

/* ─── Drawer ─────────────────────────────────────────────────────────── */
function CourseDrawer({ course, onClose, onCancelCourse, onResolveLitige, onOpenColis }){
  const [drawerTab, setDrawerTab] = useState("apercu");
  if (!course) return null;
  const sc = STATUT_CFG[course.statut] || STATUT_CFG.terminée;
  const isLive = course.statut === "en_cours";
  const hasCoords = course.coords && course.coords.length >= 2;
  const showMap = (course.statut === "en_cours" || course.statut === "terminée") && hasCoords;

  return <>
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(10,20,15,.32)",backdropFilter:"blur(2px)",zIndex:99,animation:"cr-overlayIn .22s ease both"}}/>
    <div style={{position:"fixed",top:0,right:0,bottom:0,width:520,background:T.bg1,boxShadow:"-8px 0 48px rgba(10,20,15,.16)",zIndex:100,display:"flex",flexDirection:"column",animation:"cr-drawerIn .28s cubic-bezier(.2,.8,.4,1) both",fontFamily:T.sans,overflowY:"auto"}}>
      {/* Header */}
      <div style={{padding:"18px 22px 0",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
          <div><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}><span style={{fontFamily:T.mono,fontSize:13,fontWeight:600,color:T.t3}}>{course.id?.slice(0,8)}</span><Tag label={sc.label} bg={sc.bg} bd={sc.bd} color={sc.color} dot={sc.dot}/></div><div style={{fontFamily:T.sans,fontSize:12,color:T.t2}}>{course.date} · {course.heure}</div></div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {course.colis && <button className="cr-btn" onClick={()=>onOpenColis(course)} style={{display:"flex",alignItems:"center",gap:6,background:T.greenPl,border:`1.5px solid ${T.greenBd}`,borderRadius:9,padding:"7px 12px",color:T.greenD,fontFamily:T.sans,fontSize:12,fontWeight:600}}>📦 Détail colis</button>}
            <button className="cr-close" onClick={onClose} style={{width:32,height:32,borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:T.t2}}>✕</button>
          </div>
        </div>
        <div style={{display:"flex",gap:0}}>
          {[{id:"apercu",label:"Aperçu"},{id:"paiement",label:"Paiement"},{id:"timeline",label:"Historique"}].map(tab=>{const a=drawerTab===tab.id;return <button key={tab.id} className="cr-section-tab" onClick={()=>setDrawerTab(tab.id)} style={{padding:"8px 16px",borderBottom:a?`2px solid ${T.greenD}`:"2px solid transparent",marginBottom:-1,color:a?T.greenD:T.t3,fontWeight:a?700:400,fontSize:12}}>{tab.label}</button>;})}
        </div>
      </div>
      {/* Body */}
      <div style={{flex:1,padding:"18px 22px",display:"flex",flexDirection:"column",gap:16}}>
        {drawerTab==="apercu"&&<>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {/* Conducteur */}
            <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px"}}>
              <div style={{fontFamily:T.mono,fontSize:9,color:T.t3,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Conducteur</div>
              <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}><Av ini={course.conducteurIni} nom={course.conducteur} size={36}/><div><div style={{fontFamily:T.sans,fontSize:13,fontWeight:600,color:T.t1}}>{course.conducteur}</div><div style={{fontFamily:T.mono,fontSize:11,color:T.t3}}>{course.conducteurTel}</div></div></div>
              {course.conducteurTel&&course.conducteurTel!=="—"&&<a href={`tel:+226${course.conducteurTel.replace(/\s/g,"")}`} className="cr-btn" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:T.bluePl,border:`1px solid ${T.blueBd}`,borderRadius:8,padding:"7px 0",width:"100%",color:T.blue,fontFamily:T.sans,fontSize:12,fontWeight:600,textDecoration:"none"}}>📞 Appeler</a>}
            </div>
            {/* Client */}
            <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px"}}>
              <div style={{fontFamily:T.mono,fontSize:9,color:T.t3,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Client</div>
              <div style={{marginBottom:10}}><div style={{fontFamily:T.sans,fontSize:13,fontWeight:600,color:T.t1,marginBottom:2}}>{course.client}</div><div style={{fontFamily:T.mono,fontSize:11,color:T.t3,marginBottom:4}}>{course.clientTel}</div>{course.note && <Stars note={course.note}/>}</div>
              {course.clientTel&&course.clientTel!=="—"&&<a href={`tel:+226${course.clientTel.replace(/\s/g,"")}`} className="cr-btn" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:T.greenPl,border:`1px solid ${T.greenBd}`,borderRadius:8,padding:"7px 0",width:"100%",color:T.greenD,fontFamily:T.sans,fontSize:12,fontWeight:600,textDecoration:"none"}}>📞 Appeler</a>}
            </div>
          </div>
          {/* Trajet */}
          <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontFamily:T.mono,fontSize:9,color:T.t3,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Trajet</div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}><div style={{width:8,height:8,borderRadius:"50%",background:T.greenD}}/><span style={{fontFamily:T.sans,fontSize:12,color:T.t1}}>{course.depart}</span></div>
            <div style={{width:1.5,height:12,background:T.border2,marginLeft:3.5,marginBottom:5}}/>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><div style={{width:8,height:8,borderRadius:"50%",background:T.red}}/><span style={{fontFamily:T.sans,fontSize:12,color:T.t1}}>{course.arrivee}</span></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {[{label:"Distance",val:course.distance},{label:"Durée",val:course.duree},{label:"Montant",val:`${(course.montant||0).toLocaleString()} F`}].map((m,i)=><div key={i} style={{textAlign:"center"}}><div style={{fontFamily:T.mono,fontSize:9,color:T.t3,textTransform:"uppercase",letterSpacing:.8}}>{m.label}</div><div style={{fontFamily:T.mono,fontSize:14,fontWeight:600,color:T.t1,marginTop:3}}>{m.val}</div></div>)}
            </div>
          </div>
          {/* Carte */}
          {showMap && <div><SH title={isLive?"Suivi en temps réel 🔴":"Carte du trajet"}/>{isLive && course.progression && <div style={{marginBottom:8}}><ProgressBar pct={course.progression} color={T.blue}/></div>}<LiveMap course={course}/></div>}
          {/* Annulation / Litige */}
          {course.motifAnnulation && <div style={{background:T.redPl,border:`1px solid ${T.redBd}`,borderRadius:12,padding:"12px 14px"}}><div style={{fontFamily:T.mono,fontSize:9,color:T.red,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Motif d'annulation</div><div style={{fontFamily:T.sans,fontSize:13,color:T.t1}}>{course.motifAnnulation}</div></div>}
          {course.motifLitige && <div style={{background:T.amberPl,border:`1px solid ${T.amberBd}`,borderRadius:12,padding:"12px 14px"}}><div style={{fontFamily:T.mono,fontSize:9,color:T.amber,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Motif du litige</div><div style={{fontFamily:T.sans,fontSize:13,color:T.t1}}>{course.motifLitige}</div></div>}
        </>}
        {/* Paiement */}
        {drawerTab==="paiement"&&<>
          <SoldeBlock course={course}/>
          {course.modePaiement && <PaiementBlock modePaiement={course.modePaiement} montant={course.montant}/>}
          <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px 16px"}}>
            <SH title="Résumé financier"/>
            <InfoRow label="Montant de la course" value={`${(course.montant||0).toLocaleString()} F`} mono color={T.greenD}/>
            <InfoRow label="Frais de service (5%)" value={`${Math.round((course.montant||0)*.05).toLocaleString()} F`} mono color={T.t2}/>
            <InfoRow label="Part conducteur (95%)" value={`${Math.round((course.montant||0)*.95).toLocaleString()} F`} mono color={T.t1}/>
            <div style={{marginTop:8,paddingTop:8,borderTop:`2px solid ${T.greenBd}`}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:T.sans,fontSize:13,fontWeight:700,color:T.t1}}>Total encaissé</span><span style={{fontFamily:T.mono,fontSize:14,fontWeight:700,color:T.greenD}}>{(course.montant||0).toLocaleString()} F</span></div></div>
          </div>
          {!course.clientPaye && <div style={{background:T.redPl,border:`1px solid ${T.redBd}`,borderRadius:12,padding:"12px 14px"}}><div style={{display:"flex",gap:8}}><span style={{fontSize:16}}>🚨</span><div><div style={{fontFamily:T.sans,fontSize:13,fontWeight:600,color:T.red,marginBottom:3}}>Paiement non effectué</div><div style={{fontFamily:T.sans,fontSize:12,color:T.t2}}>Solde actuel : <strong>{(course.soldeClient||0).toLocaleString()} F</strong></div></div></div></div>}
        </>}
        {/* Historique */}
        {drawerTab==="timeline"&&<div><SH title="Historique de la course"/><Timeline steps={course.timeline}/></div>}
      </div>
      {/* Actions */}
      <div style={{padding:"14px 22px",borderTop:`1px solid ${T.border}`,display:"flex",gap:10,flexShrink:0}}>
        {isLive && <button className="cr-btn" onClick={()=>{onCancelCourse(course.id);onClose();}} style={{flex:1,height:42,borderRadius:10,background:T.redPl,color:T.red,border:`1.5px solid ${T.redBd}`,fontFamily:T.sans,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>✕ Annuler la course</button>}
        {course.statut==="litige" && <button className="cr-btn" onClick={()=>{onResolveLitige(course.id);onClose();}} style={{flex:1,height:42,borderRadius:10,background:T.greenD,color:"#fff",fontFamily:T.sans,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>✓ Résoudre le litige</button>}
        {(course.statut==="terminée"||course.statut==="annulée") && <button className="cr-btn" style={{flex:1,height:42,borderRadius:10,background:T.bg,color:T.t2,border:`1px solid ${T.border2}`,fontFamily:T.sans,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>📥 Exporter le reçu</button>}
      </div>
    </div>
  </>;
}

/* ════════════════════════════════════════════════════════════════════ */
const TABS = ["Toutes","En cours","Terminées","Annulées","Litiges"];

export default function CoursesManagementPage(){
  const [courses,setCourses]=useState([]);
  const [stats,setStats]=useState({en_cours:0,terminees:0,annulees:0,litiges:0});
  const [loading,setLoading]=useState(true);
  const [activeTab,setActiveTab]=useState("Toutes");
  const [search,setSearch]=useState("");
  const [selected,setSelected]=useState(null);
  const [colisFor,setColisFor]=useState(null);
  const [notif,setNotif]=useState(null);
  const [actionLoading,setActionLoading]=useState(false);

  const showNotif=(msg)=>{setNotif(msg);setTimeout(()=>setNotif(null),3200);};

  const fetchCourses=async()=>{
    setLoading(true);
    try{
      const params={};
      if(activeTab!=="Toutes") params.status=activeTab;
      if(search) params.search=search;
      const {data}=await API.get("/admin/rides/",{params});
      setCourses(data.data||[]);
      if(data.stats) setStats(data.stats);
    }catch(err){console.error(err);}
    finally{setLoading(false);}
  };

  useEffect(()=>{fetchCourses();},[activeTab]);
  useEffect(()=>{const t=setTimeout(()=>fetchCourses(),400);return ()=>clearTimeout(t);},[search]);

  const handleCancel=async(id)=>{
    setActionLoading(true);
    try{await API.patch(`/rides/${id}/cancel/`,{motif:"Annulée par l'administrateur"});fetchCourses();setSelected(null);showNotif("✓ Course annulée avec succès");}
    catch(err){alert("Erreur annulation");}
    finally{setActionLoading(false);}
  };

  const handleResolve=async(id)=>{
    setActionLoading(true);
    try{await API.patch(`/rides/${id}/resolve-dispute/`,{});fetchCourses();setSelected(null);showNotif("✓ Litige résolu");}
    catch(err){alert("Erreur résolution");}
    finally{setActionLoading(false);}
  };

  const countTab=(label)=>{
    if(label==="Toutes") return courses.length;
    if(label==="En cours") return stats.en_cours||0;
    if(label==="Terminées") return stats.terminees||0;
    if(label==="Annulées") return stats.annulees||0;
    if(label==="Litiges") return stats.litiges||0;
    return 0;
  };

  const tabColor=(tab)=>{
    if(tab==="En cours") return T.blue;
    if(tab==="Terminées") return T.greenD;
    if(tab==="Annulées") return T.red;
    if(tab==="Litiges") return T.amber;
    return T.greenD;
  };

  return (
    <div style={{flex:1,overflowY:"auto",background:T.bg,padding:"26px 28px",display:"flex",flexDirection:"column",gap:18,fontFamily:T.sans}}>
      <style>{CSS}</style>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:3,height:20,borderRadius:2,background:T.green}}/><span style={{fontFamily:T.disp,fontSize:17,fontWeight:800,color:T.t1,letterSpacing:-.2}}>Gestion des courses</span></div>
        <div style={{display:"flex",alignItems:"center",gap:8,background:T.bg1,border:`1px solid ${T.border}`,borderRadius:10,padding:"7px 14px"}}><svg viewBox="0 0 24 24" fill="none" stroke={T.t3} strokeWidth="2" width="13" height="13"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ID, conducteur, client..." style={{border:"none",outline:"none",background:"transparent",fontFamily:T.sans,fontSize:13,color:T.t1,width:200}}/></div>
      </div>
      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:12}}>
        {[{label:"En cours",val:countTab("En cours"),accent:T.blue},{label:"Terminées",val:countTab("Terminées"),accent:T.green},{label:"Annulées",val:countTab("Annulées"),accent:T.red},{label:"Litiges",val:countTab("Litiges"),accent:T.amber}].map((k,i)=><div key={i} onClick={()=>setActiveTab(TABS[i+1])} style={{background:T.bg1,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 18px",boxShadow:"0 2px 8px rgba(26,71,49,.06)",position:"relative",overflow:"hidden",cursor:"pointer",animation:`cr-fadeUp .4s ease ${i*65}ms both`,transition:"transform .2s, box-shadow .2s"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(26,71,49,.12)";}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 8px rgba(26,71,49,.06)";}}><div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${k.accent},${k.accent}44)`}}/><div style={{fontFamily:T.mono,fontSize:9,color:T.t3,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{k.label}</div><div style={{fontFamily:T.mono,fontSize:30,fontWeight:500,color:k.accent,lineHeight:1}}>{k.val}</div></div>)}
      </div>
      {/* Tabs */}
      <div style={{display:"flex",gap:0,borderBottom:`2px solid ${T.border}`}}>
        {TABS.map(tab=>{const active=activeTab===tab;return <button key={tab} className="cr-tab" onClick={()=>setActiveTab(tab)} style={{padding:"10px 20px",borderBottom:active?`2px solid ${tabColor(tab)}`:"2px solid transparent",marginBottom:-2,color:active?tabColor(tab):T.t3,fontWeight:active?700:400,fontFamily:T.sans,fontSize:13,display:"flex",alignItems:"center",gap:7}}>{tab}<span style={{fontFamily:T.mono,fontSize:10,background:active?`${tabColor(tab)}15`:"rgba(0,0,0,.04)",color:active?tabColor(tab):T.t3,border:active?`1px solid ${tabColor(tab)}33`:"1px solid transparent",borderRadius:20,padding:"1px 7px"}}>{countTab(tab)}</span></button>;})}
      </div>
      {/* Table */}
      <div style={{background:T.bg1,border:`1px solid ${T.border}`,borderRadius:16,boxShadow:"0 2px 12px rgba(26,71,49,.06)",overflow:"hidden",animation:"cr-fadeUp .45s ease .2s both"}}>
        {loading?<div style={{padding:48,textAlign:"center",color:T.t3}}>Chargement...</div>:courses.length===0?<div style={{padding:48,textAlign:"center",color:T.t3}}>Aucune course trouvée</div>:
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:"#fafbfc"}}>{["Course","Conducteur","Client","Trajet","Distance","Durée","Montant","Note","Paiement","Statut"].map(col=><th key={col} style={{padding:"11px 14px",textAlign:"left",fontSize:10,fontFamily:T.mono,color:T.t3,fontWeight:500,textTransform:"uppercase",letterSpacing:.9,borderBottom:`1.5px solid ${T.border2}`,whiteSpace:"nowrap"}}>{col}</th>)}</tr></thead>
          <tbody>{courses.map((c,i)=>{
            const sc=STATUT_CFG[c.statut]||STATUT_CFG.terminée;
            const pc=c.modePaiement?PAIEMENT_CFG[c.modePaiement]:null;
            return <tr key={c.id} className="cr-row" onClick={()=>setSelected(c)} style={{borderBottom:`1px solid ${T.border}`,animation:`cr-slideIn .4s ease ${i*50}ms both`}}>
              <td style={{padding:"12px 14px",verticalAlign:"middle"}}><div style={{fontFamily:T.mono,fontSize:12,fontWeight:600,color:T.t1}}>{c.id?.slice(0,8)}</div><div style={{fontFamily:T.mono,fontSize:10,color:T.t3,marginTop:2}}>{c.heure||"—"}</div></td>
              <td style={{padding:"12px 14px",verticalAlign:"middle"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Av ini={c.conducteurIni} nom={c.conducteur} size={28}/><div><div style={{fontFamily:T.sans,fontWeight:500,color:T.t1,whiteSpace:"nowrap",fontSize:12}}>{c.conducteur}</div><div style={{fontFamily:T.mono,fontSize:10,color:T.t3}}>{c.conducteurTel}</div></div></div></td>
              <td style={{padding:"12px 14px",verticalAlign:"middle"}}><div style={{whiteSpace:"nowrap",fontSize:12,color:T.t1}}>{c.client}</div><div style={{fontFamily:T.mono,fontSize:10,color:c.clientPaye?T.greenD:T.red,marginTop:2,fontWeight:600}}>{c.clientPaye?"✓ Payé":"✗ Non payé"}</div></td>
              <td style={{padding:"12px 14px",verticalAlign:"middle",maxWidth:150}}><div style={{fontSize:11,color:T.t2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}><span style={{color:T.greenD,fontWeight:600}}>▲</span> {c.depart}</div><div style={{fontSize:11,color:T.t2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:2}}><span style={{color:T.red,fontWeight:600}}>▼</span> {c.arrivee}</div></td>
              <td style={{padding:"12px 14px",verticalAlign:"middle"}}><span style={{fontFamily:T.mono,fontSize:12,color:T.t1}}>{c.distance}</span></td>
              <td style={{padding:"12px 14px",verticalAlign:"middle"}}><span style={{fontFamily:T.mono,fontSize:12,color:T.t2}}>{c.duree}</span></td>
              <td style={{padding:"12px 14px",verticalAlign:"middle"}}><span style={{fontFamily:T.mono,fontSize:13,fontWeight:600,color:T.greenD}}>{(c.montant||0).toLocaleString()} F</span></td>
              <td style={{padding:"12px 14px",verticalAlign:"middle"}}><Stars note={c.note}/></td>
              <td style={{padding:"12px 14px",verticalAlign:"middle"}}>{pc?<span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:600,background:pc.bg,color:pc.color,border:`1px solid ${pc.bd}`}}>{pc.icon} {pc.label}</span>:<span style={{fontFamily:T.mono,fontSize:11,color:T.t3}}>—</span>}</td>
              <td style={{padding:"12px 14px",verticalAlign:"middle"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Tag label={sc.label} bg={sc.bg} bd={sc.bd} color={sc.color} dot={sc.dot}/><div className="cr-arrow" style={{color:T.t3,opacity:0,transform:"translateX(-5px)",transition:"all .18s"}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="9 18 15 12 9 6"/></svg></div></div></td>
            </tr>;
          })}</tbody>
        </table></div>}
        <div style={{padding:"11px 16px",borderTop:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontFamily:T.mono,fontSize:11,color:T.t3}}>{courses.length} course{courses.length>1?"s":""} affichée{courses.length>1?"s":""}</span><div style={{display:"flex",gap:6}}>{["‹","1","2","3","›"].map((item,i)=><button key={i} style={{width:28,height:28,borderRadius:7,border:`1px solid ${T.border2}`,background:i===1?T.greenD:"transparent",color:i===1?"#fff":T.t2,fontFamily:T.mono,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{item}</button>)}</div></div>
      </div>
      {/* Drawer + Modal + Notification */}
      {selected && <CourseDrawer course={selected} onClose={()=>setSelected(null)} onCancelCourse={handleCancel} onResolveLitige={handleResolve} onOpenColis={(c)=>setColisFor(c)}/>}
      {colisFor && <ColisModal course={colisFor} onClose={()=>setColisFor(null)}/>}
      {notif && <div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:T.greenD,color:"#fff",borderRadius:10,padding:"11px 22px",fontFamily:T.sans,fontSize:13,fontWeight:500,boxShadow:"0 8px 24px rgba(26,71,49,.25)",zIndex:300,animation:"cr-fadeUp .3s ease both"}}>{notif}</div>}
    </div>
  );
}
