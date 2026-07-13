








import React, { useState, useEffect } from "react";
import API from "../../services/axios_instance";

const FONT_HREF = "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap";

const T = {
  bg:"#f0f2f5", bg1:"#ffffff", green:"#2ecc71", greenD:"#1a4731", greenPl:"rgba(46,204,113,0.10)", greenBd:"rgba(46,204,113,0.22)",
  red:"#e74c3c", redPl:"rgba(231,76,60,0.10)", redBd:"rgba(231,76,60,0.22)",
  amber:"#f0a500", amberPl:"rgba(240,165,0,0.10)", amberBd:"rgba(240,165,0,0.22)",
  blue:"#2980b9", t1:"#1a2332", t2:"#4a5568", t3:"#9aa3b0",
  border:"rgba(26,71,49,0.08)", border2:"rgba(26,71,49,0.14)",
  mono:"'DM Mono', monospace", sans:"'Inter', sans-serif", disp:"'Syne', sans-serif",
};

const STATUT_CFG = {
  "En Attente": { label:"En Attente", bg:T.amberPl, bd:T.amberBd, color:T.amber },
  "Validé":     { label:"Validé",     bg:T.greenPl, bd:T.greenBd, color:T.greenD },
  "Refusé":     { label:"Refusé",     bg:T.redPl,   bd:T.redBd,   color:T.red },
};

const AV_PAL = [{ bg:"rgba(46,204,113,.15)",c:T.greenD },{ bg:"rgba(41,128,185,.15)",c:T.blue },{ bg:"rgba(240,165,0,.15)",c:"#7a5200" },{ bg:"rgba(231,76,60,.15)",c:T.red }];
const avColor = (s) => AV_PAL[(s||"?").charCodeAt(0) % AV_PAL.length];

const CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  @keyframes val-fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes val-slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
  @keyframes val-drawerIn{from{opacity:0;transform:translateX(32px)}to{opacity:1;transform:translateX(0)}}
  @keyframes val-overlayIn{from{opacity:0}to{opacity:1}}
  .val-row{cursor:pointer;transition:background .15s}
  .val-row:hover{background:rgba(46,204,113,.03)}
  .val-tab{cursor:pointer;border:none;background:none;transition:all .18s;font-family:'Inter',sans-serif}
  .val-tab:hover{color:#1a4731!important}
  .val-btn{cursor:pointer;border:none;transition:all .18s;font-family:'Inter',sans-serif;font-weight:600}
  .val-btn:hover{filter:brightness(1.1);transform:scale(1.03)}
  .val-btn:disabled{opacity:.55;cursor:not-allowed;filter:none;transform:none}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{background:#d1d9d1;border-radius:4px}
`;

function Av({ nom, size=36 }){
  const ini=(nom||"??").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const p=avColor(ini);
  return <div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,background:p.bg,color:p.c,border:`1.5px solid ${p.c}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.35,fontWeight:700,fontFamily:T.mono}}>{ini}</div>;
}

function Tag({ label,bg,bd,color }){
  return <span style={{display:"inline-block",padding:"4px 12px",borderRadius:20,fontSize:11,fontWeight:600,background:bg,color,border:`1px solid ${bd}`}}>{label}</span>;
}

export default function DriversValidationPage(){
  const [drivers,setDrivers]=useState([]);
  const [stats,setStats]=useState({tous:0,en_attente:0,valides:0,refuses:0});
  const [loading,setLoading]=useState(true);
  const [activeTab,setActiveTab]=useState("Tous");
  const [search,setSearch]=useState("");
  const [selected,setSelected]=useState(null);
  const [rejectModal,setRejectModal]=useState({open:false,id:null,motif:""});
  const [actionLoading,setActionLoading]=useState(false);

  const TABS=["Tous","En Attente","Validé","Refusé"];

  const fetchDrivers=async()=>{
    setLoading(true);
    try{
      const params={};
      if(activeTab!=="Tous") params.status=activeTab;
      if(search) params.search=search;
      const {data}=await API.get("/admin/drivers/",{params});
      setDrivers(data.data||[]);
      if(data.stats) setStats(data.stats);
    }catch(err){
      console.error(err);
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{fetchDrivers();},[activeTab]);
  useEffect(()=>{const t=setTimeout(()=>fetchDrivers(),400);return ()=>clearTimeout(t);},[search]);

  const handleValidate=async(id,e)=>{
    if(e) e.stopPropagation();
    setActionLoading(true);
    try{
      await API.patch(`/admin/drivers/${id}/validate/`,{action:"validate"});
      fetchDrivers();
      if(selected?.id===id) setSelected(null);
    }catch(err){
      alert("Erreur validation");
    }finally{
      setActionLoading(false);
    }
  };

  const openRejectModal=(id,e)=>{
    if(e) e.stopPropagation();
    setRejectModal({open:true,id,motif:""});
  };

  const handleReject=async()=>{
    if(!rejectModal.motif.trim()) return;
    setActionLoading(true);
    try{
      await API.patch(`/admin/drivers/${rejectModal.id}/validate/`,{action:"reject",motif:rejectModal.motif});
      fetchDrivers();
      setRejectModal({open:false,id:null,motif:""});
      if(selected?.id===rejectModal.id) setSelected(null);
    }catch(err){
      alert("Erreur rejet");
    }finally{
      setActionLoading(false);
    }
  };

  const countTab=(label)=>{
    if(label==="Tous") return stats.tous||drivers.length;
    if(label==="En Attente") return stats.en_attente||0;
    if(label==="Validé") return stats.valides||0;
    if(label==="Refusé") return stats.refuses||0;
    return 0;
  };

  return (
    <div style={{flex:1,overflowY:"auto",background:T.bg,padding:"26px 28px",display:"flex",flexDirection:"column",gap:18}}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:3,height:18,borderRadius:2,background:T.green}}/>
          <span style={{fontFamily:T.disp,fontSize:16,fontWeight:800,color:T.t1}}>Validation des conducteurs</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,background:T.bg1,border:`1px solid ${T.border}`,borderRadius:10,padding:"7px 14px"}}>
          <svg viewBox="0 0 24 24" fill="none" stroke={T.t3} strokeWidth="2" width="13" height="13"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." style={{border:"none",outline:"none",background:"transparent",fontSize:13,color:T.t1,width:200}}/>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:`2px solid ${T.border}`}}>
        {TABS.map(tab=>{
          const active=activeTab===tab;
          return <button key={tab} className="val-tab" onClick={()=>setActiveTab(tab)}
            style={{padding:"10px 22px",borderBottom:active?`2px solid ${T.greenD}`:"2px solid transparent",marginBottom:-2,color:active?T.greenD:T.t3,fontWeight:active?700:400,fontSize:13,display:"flex",alignItems:"center",gap:7}}>
            {tab}
            <span style={{fontFamily:T.mono,fontSize:10,background:active?T.greenPl:"rgba(0,0,0,.05)",color:active?T.greenD:T.t3,borderRadius:20,padding:"1px 7px"}}>{countTab(tab)}</span>
          </button>;
        })}
      </div>

      {/* Table */}
      <div style={{background:T.bg1,border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden",animation:"val-fadeUp .45s ease both"}}>
        {loading?<div style={{padding:48,textAlign:"center",color:T.t3}}>Chargement...</div>:drivers.length===0?<div style={{padding:48,textAlign:"center",color:T.t3}}>Aucun conducteur trouvé</div>:
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:"#fafbfc"}}>
              {["Conducteur","Téléphone","Statut","Docs","Inscription","Action"].map(col=><th key={col} style={{padding:"12px 16px",textAlign:"left",fontSize:10,fontFamily:T.mono,color:T.t3,fontWeight:500,textTransform:"uppercase",letterSpacing:.9,borderBottom:`1.5px solid ${T.border2}`}}>{col}</th>)}
            </tr></thead>
            <tbody>
              {drivers.map((d,i)=>{
                const sc=STATUT_CFG[d.statut]||STATUT_CFG["En Attente"];
                return <tr key={d.id} className="val-row" onClick={()=>setSelected(d)} style={{borderBottom:`1px solid ${T.border}`,animation:`val-slideIn .4s ease both`,animationDelay:`${i*40}ms`}}>
                  <td style={{padding:"13px 16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <Av nom={d.nom||d.full_name} size={36}/>
                      <div>
                        <div style={{fontWeight:600,color:T.t1}}>{d.nom||d.full_name}</div>
                        <div style={{fontFamily:T.mono,fontSize:10,color:T.t3,marginTop:2}}>{d.ville||d.activity_zone||"—"}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{padding:"13px 16px",fontFamily:T.mono,fontSize:12,color:T.t2}}>{d.telephone||d.phone_number}</td>
                  <td style={{padding:"13px 16px"}}><Tag label={sc.label} bg={sc.bg} bd={sc.bd} color={sc.color}/></td>
                  <td style={{padding:"13px 16px",fontFamily:T.mono,fontSize:11,color:T.t3}}>{d.docs_count||"0/0"}</td>
                  <td style={{padding:"13px 16px",fontFamily:T.mono,fontSize:11,color:T.t3}}>{d.date_inscription||d.created_at?.slice(0,10)}</td>
                  <td style={{padding:"13px 16px"}}>
                    <div style={{display:"flex",gap:6}} onClick={e=>e.stopPropagation()}>
                      <button className="val-btn" onClick={(e)=>handleValidate(d.id,e)} disabled={actionLoading}
                        style={{padding:"6px 16px",borderRadius:7,background:T.greenD,color:"#fff",fontSize:12}}>✅ Valider</button>
                      <button className="val-btn" onClick={(e)=>openRejectModal(d.id,e)} disabled={actionLoading}
                        style={{padding:"6px 16px",borderRadius:7,background:T.redPl,color:T.red,border:`1.5px solid ${T.redBd}`,fontSize:12}}>❌ Refuser</button>
                    </div>
                  </td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>}
      </div>

      
      {/* Drawer */}
      {selected&&<>
        <div onClick={()=>setSelected(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.35)",zIndex:99,animation:"val-overlayIn .25s ease both"}}/>
        <div style={{position:"fixed",top:0,right:0,bottom:0,width:520,background:"#fff",zIndex:100,animation:"val-drawerIn .28s ease both",display:"flex",flexDirection:"column",boxShadow:"-8px 0 40px rgba(0,0,0,.15)",overflowY:"auto"}}>
          
          {/* Header */}
          <div style={{padding:"20px 24px",borderBottom:"1px solid #eee",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <Av nom={selected.nom||selected.full_name} size={44}/>
              <div>
                <div style={{fontWeight:700,fontSize:16,fontFamily:T.disp}}>{selected.nom||selected.full_name}</div>
                <div style={{fontSize:12,color:T.t3,fontFamily:T.mono}}>{selected.telephone||selected.phone_number}</div>
              </div>
            </div>
            <button onClick={()=>setSelected(null)} style={{width:32,height:32,borderRadius:8,border:"1px solid #ddd",background:"none",cursor:"pointer",fontSize:18,color:T.t2}}>✕</button>
          </div>

          {/* Infos */}
          <div style={{padding:24,flexShrink:0}}>
            <h4 style={{marginBottom:16,fontFamily:T.disp,fontSize:14,color:T.t1}}>Informations</h4>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24}}>
              {[
                {l:"Statut",v:<Tag label={(STATUT_CFG[selected.statut]||{}).label||selected.statut} bg={(STATUT_CFG[selected.statut]||{}).bg||"#eee"} bd={(STATUT_CFG[selected.statut]||{}).bd||"#ccc"} color={(STATUT_CFG[selected.statut]||{}).color||"#333"}/>},
                {l:"Inscription",v:selected.date_inscription||selected.created_at?.slice(0,10)},
                {l:"Ville",v:selected.ville||selected.activity_zone||"—"},
                {l:"Email",v:selected.email||"—"},
                {l:"Documents",v:selected.docs_count||"0/0"},
                {l:"Courses",v:selected.total_rides||0},
              ].map((r,i)=><div key={i} style={{background:"#f8faf8",borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontSize:9,textTransform:"uppercase",color:T.t3,fontFamily:T.mono,marginBottom:4}}>{r.l}</div>
                <div style={{fontSize:13,fontWeight:500,color:T.t1}}>{r.v}</div>
              </div>)}
            </div>
          </div>

          {/* Documents avec prévisualisation */}
          <div style={{padding:"0 24px 24px",flex:1}}>
            <h4 style={{marginBottom:16,fontFamily:T.disp,fontSize:14,color:T.t1}}>Documents du conducteur</h4>
            
            {/* Bouton pour charger les documents détaillés */}
            <button onClick={async()=>{
              try{
                const {data}=await API.get(`/admin/drivers/${selected.id}/`);
                if(data.data?.documents||data.data?.docs){
                  const docs=data.data.documents||data.data.docs;
                  // Convertir en tableau si c'est un objet
                  const docsArray=Array.isArray(docs)?docs:Object.values(docs);
                  setSelected(prev=>({...prev,_docs:docsArray}));
                }
              }catch(err){
                // Fallback: utiliser les docs déjà présents
                const docs=selected.docs||{};
                const docsArray=Array.isArray(docs)?docs:Object.values(docs);
                setSelected(prev=>({...prev,_docs:docsArray}));
              }
            }}
              style={{marginBottom:16,padding:"8px 16px",borderRadius:8,border:`1px solid ${T.green}`,background:T.greenPl,color:T.greenD,cursor:"pointer",fontFamily:T.sans,fontSize:12,fontWeight:600}}>
              📎 Charger les documents
            </button>

            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {(selected._docs||[]).length>0?(selected._docs||[]).map((doc,idx)=>{
                const docData=typeof doc==='object'?doc:{};
                const fileUrl=docData.file||docData.file_url||docData.url||'';
                const docType=docData.document_type||docData.type||'document';
                const docLabel=docData.document_type_display||docData.label||docType;
                const isImage=fileUrl&&/\.(jpg|jpeg|png|gif|webp)/i.test(fileUrl);
                const isPDF=fileUrl&&/\.pdf/i.test(fileUrl);
                
                return <div key={idx} style={{border:`1px solid ${T.border}`,borderRadius:12,padding:14,background:"#fafbfc"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:fileUrl?10:0}}>
                    <span style={{fontWeight:600,fontSize:13,color:T.t1,textTransform:"capitalize"}}>{docLabel}</span>
                    {fileUrl?(
                      <a href={fileUrl} target="_blank" rel="noopener noreferrer" 
                        style={{fontSize:11,color:T.green,textDecoration:"none",fontWeight:600,padding:"4px 10px",borderRadius:6,background:T.greenPl}}>
                        🔗 Ouvrir
                      </a>
                    ):<span style={{fontSize:10,color:T.t3}}>Non fourni</span>}
                  </div>
                  {fileUrl&&isImage&&<img src={fileUrl} alt={docLabel} style={{width:"100%",maxHeight:250,objectFit:"contain",borderRadius:8,marginTop:8,border:`1px solid ${T.border}`}}/>}
                  {fileUrl&&isPDF&&<iframe src={fileUrl} title={docLabel} style={{width:"100%",height:300,border:"none",borderRadius:8,marginTop:8}}/>}
                </div>;
              }):<div style={{textAlign:"center",color:T.t3,fontSize:13,padding:20}}>Cliquez sur "Charger les documents" pour voir les fichiers</div>}
            </div>
          </div>

          {/* Actions */}
          <div style={{padding:24,borderTop:"1px solid #eee",display:"flex",gap:10,flexShrink:0}}>
            <button className="val-btn" onClick={()=>handleValidate(selected.id)} disabled={actionLoading}
              style={{flex:1,padding:"12px",borderRadius:10,background:T.greenD,color:"#fff",fontSize:14}}>✅ Valider le dossier</button>
            <button className="val-btn" onClick={()=>openRejectModal(selected.id)} disabled={actionLoading}
              style={{flex:1,padding:"12px",borderRadius:10,background:T.redPl,color:T.red,border:`1.5px solid ${T.redBd}`,fontSize:14}}>❌ Refuser</button>
          </div>
        </div>
      </>}

      {/* Modal rejet */}
      {rejectModal.open&&<>
        <div onClick={()=>setRejectModal({open:false,id:null,motif:""})} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:199}}/>
        <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"#fff",borderRadius:16,padding:28,zIndex:200,minWidth:380}}>
          <h3 style={{marginBottom:16,fontFamily:T.disp}}>Motif du refus</h3>
          <textarea value={rejectModal.motif} onChange={e=>setRejectModal(m=>({...m,motif:e.target.value}))} placeholder="Expliquez pourquoi..."
            style={{width:"100%",height:100,border:`1px solid #ddd`,borderRadius:10,padding:12,fontSize:13,resize:"vertical",outline:"none"}}/>
          <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"flex-end"}}>
            <button onClick={()=>setRejectModal({open:false,id:null,motif:""})} style={{padding:"10px 20px",borderRadius:8,border:"1px solid #ddd",background:"none",cursor:"pointer"}}>Annuler</button>
            <button onClick={handleReject} disabled={actionLoading||!rejectModal.motif.trim()}
              style={{padding:"10px 20px",borderRadius:8,background:T.red,color:"#fff",border:"none",cursor:"pointer",fontWeight:600,opacity:!rejectModal.motif.trim()?.5:1}}>
              {actionLoading?"...":"Confirmer le refus"}
            </button>
          </div>
        </div>
      </>}
    </div>
  );
}