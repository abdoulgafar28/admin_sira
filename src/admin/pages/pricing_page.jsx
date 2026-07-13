import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updatePricing } from "../../store/admin";
import { getPricing, updatePricing as updatePricingAPI } from "../../services/api";
import { toast } from "react-toastify";


/* ─── Google Fonts ──────────────────────────────────────────────────── */
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap";
if (!document.querySelector(`link[href="${FONT_LINK}"]`)) {
  const l = document.createElement("link"); l.rel = "stylesheet"; l.href = FONT_LINK;
  document.head.appendChild(l);
}

/* ─── Tokens ─────────────────────────────────────────────────────────── */
const T = {
  bg:"#f0f2f5", bg1:"#ffffff", bg2:"#f8faf8",
  green:"#2ecc71", greenD:"#1a4731",
  greenPl:"rgba(46,204,113,0.10)", greenBd:"rgba(46,204,113,0.22)",
  red:"#e74c3c", redPl:"rgba(231,76,60,0.10)", redBd:"rgba(231,76,60,0.22)",
  amber:"#f0a500", amberPl:"rgba(240,165,0,0.10)", amberBd:"rgba(240,165,0,0.22)",
  blue:"#2980b9", bluePl:"rgba(41,128,185,0.10)", blueBd:"rgba(41,128,185,0.22)",
  t1:"#1a2332", t2:"#4a5568", t3:"#9aa3b0",
  border:"rgba(26,71,49,0.08)", border2:"rgba(26,71,49,0.14)",
  mono:"'DM Mono', monospace", sans:"'Inter', sans-serif", disp:"'Syne', sans-serif",
};

/* ─── CSS ─────────────────────────────────────────────────────────────── */
const CSS = `
  @keyframes pr-fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pr-pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes pr-pop     { 0%{transform:scale(.94);opacity:0} 100%{transform:scale(1);opacity:1} }
  .pr-tab       { transition:all .18s; cursor:pointer; background:none; border:none; }
  .pr-tab:hover { color:${T.greenD} !important; }
  .pr-cat-card  { transition:all .2s; cursor:pointer; user-select:none; }
  .pr-cat-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(26,71,49,.12) !important; }
  .pr-input     { transition:border .18s, box-shadow .18s; }
  .pr-input:focus { outline:none; border-color:${T.green} !important; box-shadow:0 0 0 3px ${T.greenPl} !important; }
  .pr-btn-save  { transition:all .2s; cursor:pointer; border:none; }
  .pr-btn-save:hover { filter:brightness(1.08); transform:translateY(-1px); }
  .pr-btn-save:disabled { opacity:.55; cursor:not-allowed; transform:none; }
  .pr-toggle    { transition:all .2s; cursor:pointer; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:#d1d9d1; border-radius:4px; }
`;
if (!document.querySelector("#pr-css")) {
  const s = document.createElement("style"); s.id = "pr-css"; s.textContent = CSS;
  document.head.appendChild(s);
}

/* ─── Valeurs par défaut ──────────────────────────────────────────────── */
const DEFAULT_PRICING = {
  pricePerKmPickup:    150,
  pricePerKmDelivery:  200,
  baseFare:            500,
  minFare:             800,
  waitingTimeRate:     50,
  weightSlabs: [
    { label:"0 – 1 kg",      maxKg:1,    surcharge:0    },
    { label:"1 – 5 kg",      maxKg:5,    surcharge:200  },
    { label:"5 – 15 kg",     maxKg:15,   surcharge:500  },
    { label:"15 – 30 kg",    maxKg:30,   surcharge:1000 },
    { label:"+ 30 kg",       maxKg:999,  surcharge:2000 },
  ],
  packageNatures: [
    { id:"standard",  label:"Standard",          icon:"📦", multiplier:1.0,  compatible:["moto","tricycle","camionnette"] },
    { id:"fragile",   label:"Fragile",            icon:"🔮", multiplier:1.3,  compatible:["moto","tricycle","camionnette"] },
    { id:"vivant",    label:"Aliment / Vivant",   icon:"🥗", multiplier:1.2,  compatible:["moto","tricycle"]              },
    { id:"medical",   label:"Médical / Urgent",   icon:"💊", multiplier:1.5,  compatible:["moto","tricycle","camionnette"] },
    { id:"documents", label:"Documents",          icon:"📄", multiplier:1.0,  compatible:["moto","tricycle","camionnette"] },
    { id:"volumineux",label:"Volumineux",          icon:"📦", multiplier:1.4,  compatible:["tricycle","camionnette"]       },
    { id:"danger",    label:"Matière dangereuse", icon:"⚠️", multiplier:2.0,  compatible:["camionnette"]                  },
    { id:"bijoux",    label:"Bijoux / Valeur",    icon:"💎", multiplier:1.8,  compatible:["moto","tricycle","camionnette"] },
  ],
  valueSlabs: [
    { label:"< 5 000 F",       maxVal:5000,    surcharge:0    },
    { label:"5 000 – 25 000 F",maxVal:25000,   surcharge:200  },
    { label:"25 000 – 100 000",maxVal:100000,  surcharge:500  },
    { label:"> 100 000 F",     maxVal:Infinity,surcharge:1500 },
  ],
  vehicles: [
    { id:"moto",        label:"Moto",        icon:"🛵", maxWeight:15,  maxValue:500000,  baseSurcharge:0    },
    { id:"tricycle",    label:"Tricycle",     icon:"🛺", maxWeight:100, maxValue:1000000, baseSurcharge:300  },
    { id:"camionnette", label:"Camionnette",  icon:"🚚", maxWeight:500, maxValue:5000000, baseSurcharge:1000 },
  ],
};

/* ─── Helpers ─────────────────────────────────────────────────────────── */
function calcTarif(pricing, params) {
  const { kmPickup, kmDelivery, weightKg, nature, declaredValue, vehicle } = params;
  const nat = pricing.packageNatures.find(n => n.id === nature) || pricing.packageNatures[0];
  const veh = pricing.vehicles.find(v => v.id === vehicle)       || pricing.vehicles[0];
  const wSlab = pricing.weightSlabs.find(s => weightKg <= s.maxKg) || pricing.weightSlabs[pricing.weightSlabs.length-1];
  const vSlab = pricing.valueSlabs.find(s => declaredValue <= s.maxVal) || pricing.valueSlabs[pricing.valueSlabs.length-1];

  const distCost  = kmPickup * pricing.pricePerKmPickup + kmDelivery * pricing.pricePerKmDelivery;
  const base      = pricing.baseFare + veh.baseSurcharge;
  const subtotal  = (distCost + base + wSlab.surcharge + vSlab.surcharge) * nat.multiplier;
  return Math.max(subtotal, pricing.minFare);
}

/* ─── Atoms ──────────────────────────────────────────────────────────── */
function SH({ title, sub }) {
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:9 }}>
        <div style={{ width:3, height:15, borderRadius:2, background:T.green }}/>
        <span style={{ fontFamily:T.disp, fontSize:13, fontWeight:700, color:T.t1, letterSpacing:.3 }}>{title}</span>
      </div>
      {sub && <div style={{ fontFamily:T.sans, fontSize:12, color:T.t3, marginTop:4, paddingLeft:12 }}>{sub}</div>}
    </div>
  );
}

function Card({ children, style={}, delay=0 }) {
  return (
    <div style={{ background:T.bg1, border:`1px solid ${T.border}`, borderRadius:16, padding:"20px 22px", boxShadow:"0 2px 10px rgba(26,71,49,.06)", animation:`pr-fadeUp .5s ease ${delay}ms both`, ...style }}>
      {children}
    </div>
  );
}

function NumInput({ label, value, onChange, unit="F", min=0, sub }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontFamily:T.mono, fontSize:10, color:T.t3, textTransform:"uppercase", letterSpacing:.9, marginBottom:6 }}>{label}</label>
      <div style={{ display:"flex", alignItems:"center", gap:0 }}>
        <input
          type="number" min={min} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="pr-input"
          style={{ flex:1, height:38, padding:"0 12px", fontFamily:T.mono, fontSize:13, fontWeight:500, color:T.t1, background:T.bg, border:`1px solid ${T.border2}`, borderRadius:"8px 0 0 8px" }}
        />
        <div style={{ height:38, padding:"0 12px", display:"flex", alignItems:"center", background:T.greenPl, border:`1px solid ${T.greenBd}`, borderRadius:"0 8px 8px 0", fontFamily:T.mono, fontSize:11, color:T.greenD, fontWeight:600 }}>{unit}</div>
      </div>
      {sub && <div style={{ fontFamily:T.sans, fontSize:11, color:T.t3, marginTop:4 }}>{sub}</div>}
    </div>
  );
}

/* ─── Page principale ────────────────────────────────────────────────── */
export default function PricingPage() {
  const dispatch = useDispatch();
  const stored   = useSelector(s => s.pricing) ?? DEFAULT_PRICING;
  const [pricing,  setPricing]  = useState({ ...DEFAULT_PRICING, ...stored });
  const [tab,      setTab]      = useState("distance");
  const [saving,   setSaving]   = useState(false);
  const [fetching, setFetching] = useState(true);

  const [sim, setSim] = useState({ kmPickup:2, kmDelivery:5, weightKg:3, nature:"standard", declaredValue:10000, vehicle:"moto" });
  const simResult = calcTarif(pricing, sim);
  const simNat = pricing.packageNatures.find(n=>n.id===sim.nature);
  const simVeh = pricing.vehicles.find(v=>v.id===sim.vehicle);
  const isCompatible = simNat?.compatible.includes(sim.vehicle);

  // ✅ MODIFICATION 1 : useEffect connecté à l'API
  useEffect(() => {
    const load = async () => {
      try {
        const r = await getPricing();
        if (r?.data?.success && r.data.data) {
          setPricing(p => ({ ...p, ...r.data.data }));
        }
      } catch (err) {
        console.error("Erreur chargement tarifs:", err);
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);

  // ✅ MODIFICATION 2 : handleSave avec gestion de la réponse API
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updatePricingAPI(pricing);
      if (response?.data?.success) {
        dispatch(updatePricing(pricing));
        toast.success("✓ Grille tarifaire enregistrée");
      } else {
        toast.error(response?.data?.message || "Erreur lors de l'enregistrement");
      }
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const updateWeightSurcharge = (idx, val) => {
    const slabs = [...pricing.weightSlabs];
    slabs[idx] = { ...slabs[idx], surcharge: val };
    setPricing(p => ({ ...p, weightSlabs: slabs }));
  };

  const updateValueSurcharge = (idx, val) => {
    const slabs = [...pricing.valueSlabs];
    slabs[idx] = { ...slabs[idx], surcharge: val };
    setPricing(p => ({ ...p, valueSlabs: slabs }));
  };

  const updateNatureMultiplier = (id, val) => {
    setPricing(p => ({ ...p, packageNatures: p.packageNatures.map(n => n.id===id ? { ...n, multiplier:val } : n) }));
  };

  const toggleNatureVehicle = (natId, vehId) => {
    setPricing(p => ({
      ...p,
      packageNatures: p.packageNatures.map(n => {
        if (n.id !== natId) return n;
        const has = n.compatible.includes(vehId);
        return { ...n, compatible: has ? n.compatible.filter(v=>v!==vehId) : [...n.compatible, vehId] };
      }),
    }));
  };

  const updateVehicle = (id, field, val) => {
    setPricing(p => ({ ...p, vehicles: p.vehicles.map(v => v.id===id ? { ...v, [field]:val } : v) }));
  };

  const TABS = [
    { id:"distance",  label:"📍 Distance"     },
    { id:"poids",     label:"⚖️ Poids"         },
    { id:"nature",    label:"📦 Nature colis"  },
    { id:"valeur",    label:"💰 Valeur déclarée"},
    { id:"engins",    label:"🛵 Engins"         },
  ];

  if (fetching) {
    return (
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", background:T.bg, fontFamily:T.mono, color:T.t3 }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:28, marginBottom:10, animation:"pr-pulse 1.4s infinite" }}>⚙️</div>
          <div>Chargement des tarifs...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex:1, overflowY:"auto", background:T.bg, padding:"26px 28px", display:"flex", flexDirection:"column", gap:20, fontFamily:T.sans }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
            <div style={{ width:3, height:22, borderRadius:2, background:T.green }}/>
            <span style={{ fontFamily:T.disp, fontSize:18, fontWeight:800, color:T.t1, letterSpacing:-.2 }}>Paramétrage des tarifs</span>
          </div>
          <div style={{ fontFamily:T.sans, fontSize:13, color:T.t3, paddingLeft:13 }}>
            Grille tarifaire multi-critères : distance, poids, nature, valeur & compatibilité engin
          </div>
        </div>
        <button className="pr-btn-save" onClick={handleSave} disabled={saving} style={{
          display:"flex", alignItems:"center", gap:8, height:42, padding:"0 22px",
          background: saving ? T.t3 : T.greenD, color:"#fff", borderRadius:11,
          fontFamily:T.sans, fontSize:13, fontWeight:600,
          boxShadow:"0 4px 14px rgba(26,71,49,.22)",
        }}>
          {saving ? (
            <><span style={{ animation:"pr-pulse 1s infinite", fontSize:14 }}>⏳</span> Enregistrement...</>
          ) : (
            <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Enregistrer la grille</>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:0, borderBottom:`2px solid ${T.border}` }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} className="pr-tab" onClick={() => setTab(t.id)} style={{
              padding:"10px 20px",
              borderBottom: active ? `2px solid ${T.greenD}` : "2px solid transparent",
              marginBottom:-2, color: active ? T.greenD : T.t3,
              fontWeight: active ? 700 : 400, fontFamily:T.sans, fontSize:13,
            }}>{t.label}</button>
          );
        })}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1.3fr) minmax(0,1fr)", gap:20 }}>

        {/* ─── Panneau gauche : configuration ─── */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* ── DISTANCE ── */}
          {tab === "distance" && (
            <Card delay={0}>
              <SH title="Tarification à la distance" sub="Deux tronçons distincts : collecte du colis et livraison finale"/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div>
                  <div style={{ background:T.bluePl, border:`1px solid ${T.blueBd}`, borderRadius:10, padding:"10px 12px", marginBottom:12 }}>
                    <div style={{ fontFamily:T.mono, fontSize:10, color:T.blue, textTransform:"uppercase", letterSpacing:.8, marginBottom:3 }}>Tronçon 1 — Collecte</div>
                    <div style={{ fontFamily:T.sans, fontSize:11, color:T.t2 }}>Du point de départ du livreur jusqu'au colis</div>
                  </div>
                  <NumInput label="Prix / km (collecte)" value={pricing.pricePerKmPickup} onChange={v => setPricing(p=>({...p,pricePerKmPickup:v}))} sub="Facturation aller chercher le colis"/>
                </div>
                <div>
                  <div style={{ background:T.greenPl, border:`1px solid ${T.greenBd}`, borderRadius:10, padding:"10px 12px", marginBottom:12 }}>
                    <div style={{ fontFamily:T.mono, fontSize:10, color:T.greenD, textTransform:"uppercase", letterSpacing:.8, marginBottom:3 }}>Tronçon 2 — Livraison</div>
                    <div style={{ fontFamily:T.sans, fontSize:11, color:T.t2 }}>Du colis jusqu'à la destination finale</div>
                  </div>
                  <NumInput label="Prix / km (livraison)" value={pricing.pricePerKmDelivery} onChange={v => setPricing(p=>({...p,pricePerKmDelivery:v}))} sub="Facturation livraison destination"/>
                </div>
              </div>
              <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:16, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
                <NumInput label="Frais de base" value={pricing.baseFare} onChange={v => setPricing(p=>({...p,baseFare:v}))} sub="Frais fixes par course"/>
                <NumInput label="Tarif minimum" value={pricing.minFare} onChange={v => setPricing(p=>({...p,minFare:v}))} sub="Plancher absolu"/>
                <NumInput label="Attente (F/min)" value={pricing.waitingTimeRate} onChange={v => setPricing(p=>({...p,waitingTimeRate:v}))} sub="Temps d'attente au dépôt"/>
              </div>
            </Card>
          )}

          {/* ── POIDS ── */}
          {tab === "poids" && (
            <Card delay={0}>
              <SH title="Majorations par tranche de poids" sub="Supplément fixe ajouté au tarif de base selon le poids du colis"/>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ background:"#fafbfc" }}>
                    {["Tranche","Poids max","Majoration (F)"].map(h => (
                      <th key={h} style={{ padding:"9px 14px", textAlign:"left", fontSize:10, fontFamily:T.mono, color:T.t3, fontWeight:500, textTransform:"uppercase", letterSpacing:.8, borderBottom:`1.5px solid ${T.border2}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pricing.weightSlabs.map((slab, i) => (
                    <tr key={i} style={{ borderBottom:`1px solid ${T.border}`, animation:`pr-fadeUp .35s ease ${i*55}ms both` }}>
                      <td style={{ padding:"12px 14px", verticalAlign:"middle" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:28, height:28, borderRadius:7, background:T.amberPl, border:`1px solid ${T.amberBd}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⚖️</div>
                          <span style={{ fontFamily:T.sans, fontSize:13, fontWeight:500, color:T.t1 }}>{slab.label}</span>
                        </div>
                      </td>
                      <td style={{ padding:"12px 14px", verticalAlign:"middle" }}>
                        <span style={{ fontFamily:T.mono, fontSize:12, color:T.t3 }}>{slab.maxKg >= 999 ? "∞" : `≤ ${slab.maxKg} kg`}</span>
                      </td>
                      <td style={{ padding:"12px 14px", verticalAlign:"middle", width:160 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:0 }}>
                          <input type="number" min={0} value={slab.surcharge} onChange={e => updateWeightSurcharge(i, Number(e.target.value))} className="pr-input"
                            style={{ flex:1, height:36, padding:"0 10px", fontFamily:T.mono, fontSize:13, fontWeight:600, color:T.t1, background:T.bg, border:`1px solid ${T.border2}`, borderRadius:"7px 0 0 7px" }}
                          />
                          <div style={{ height:36, padding:"0 10px", display:"flex", alignItems:"center", background:T.amberPl, border:`1px solid ${T.amberBd}`, borderRadius:"0 7px 7px 0", fontFamily:T.mono, fontSize:10, color:T.amber, fontWeight:600 }}>FCFA</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* ── NATURE ── */}
          {tab === "nature" && (
            <Card delay={0}>
              <SH title="Nature du colis — multiplicateurs & compatibilité engin" sub="Le multiplicateur s'applique sur le tarif calculé. Cochez les engins autorisés pour chaque type."/>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {pricing.packageNatures.map((nat, i) => (
                  <div key={nat.id} style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:12, padding:"14px 16px", animation:`pr-fadeUp .35s ease ${i*50}ms both` }}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, flex:1 }}>
                        <div style={{ width:38, height:38, borderRadius:9, background:T.bg1, border:`1px solid ${T.border2}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{nat.icon}</div>
                        <div>
                          <div style={{ fontFamily:T.sans, fontSize:13, fontWeight:600, color:T.t1 }}>{nat.label}</div>
                          <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap" }}>
                            {pricing.vehicles.map(veh => {
                              const ok = nat.compatible.includes(veh.id);
                              return (
                                <button key={veh.id} className="pr-toggle" onClick={() => toggleNatureVehicle(nat.id, veh.id)} style={{
                                  display:"flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:500, fontFamily:T.sans,
                                  background: ok ? T.greenPl : T.redPl,
                                  color:      ok ? T.greenD  : T.red,
                                  border:     `1px solid ${ok ? T.greenBd : T.redBd}`,
                                  cursor:"pointer",
                                }}>
                                  <span>{veh.icon}</span>
                                  {veh.label}
                                  <span style={{ fontWeight:700 }}>{ok ? " ✓" : " ✗"}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div style={{ flexShrink:0 }}>
                        <div style={{ fontFamily:T.mono, fontSize:9, color:T.t3, textTransform:"uppercase", letterSpacing:.8, marginBottom:5, textAlign:"right" }}>Multiplicateur</div>
                        <div style={{ display:"flex", alignItems:"center", gap:0 }}>
                          <input type="number" min={0.5} max={5} step={0.05} value={nat.multiplier}
                            onChange={e => updateNatureMultiplier(nat.id, Number(e.target.value))}
                            className="pr-input"
                            style={{ width:70, height:36, padding:"0 10px", fontFamily:T.mono, fontSize:14, fontWeight:700, color: nat.multiplier > 1.5 ? T.red : nat.multiplier > 1 ? T.amber : T.greenD, background:T.bg1, border:`1px solid ${T.border2}`, borderRadius:"7px 0 0 7px", textAlign:"center" }}
                          />
                          <div style={{ height:36, padding:"0 9px", display:"flex", alignItems:"center", background:T.greenPl, border:`1px solid ${T.greenBd}`, borderRadius:"0 7px 7px 0", fontFamily:T.mono, fontSize:10, color:T.greenD, fontWeight:600 }}>×</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ── VALEUR ── */}
          {tab === "valeur" && (
            <Card delay={0}>
              <SH title="Majorations selon valeur déclarée" sub="Supplément pour assurance & précaution selon la valeur du colis"/>
              <div style={{ background:T.bluePl, border:`1px solid ${T.blueBd}`, borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
                <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                  <span style={{ fontSize:14, flexShrink:0 }}>ℹ️</span>
                  <div style={{ fontFamily:T.sans, fontSize:12, color:T.t2 }}>
                    La majoration valeur s'additionne au tarif de base. Elle couvre le risque de perte ou dommage sur les colis de haute valeur.
                    Pour les colis <strong>Bijoux / Valeur</strong>, le multiplicateur nature s'applique également.
                  </div>
                </div>
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ background:"#fafbfc" }}>
                    {["Tranche","Majoration (F)"].map(h => (
                      <th key={h} style={{ padding:"9px 14px", textAlign:"left", fontSize:10, fontFamily:T.mono, color:T.t3, fontWeight:500, textTransform:"uppercase", letterSpacing:.8, borderBottom:`1.5px solid ${T.border2}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pricing.valueSlabs.map((slab, i) => (
                    <tr key={i} style={{ borderBottom:`1px solid ${T.border}`, animation:`pr-fadeUp .35s ease ${i*60}ms both` }}>
                      <td style={{ padding:"12px 14px", verticalAlign:"middle" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:28, height:28, borderRadius:7, background:"rgba(255,215,0,.15)", border:"1px solid rgba(255,215,0,.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>💰</div>
                          <span style={{ fontFamily:T.sans, fontSize:13, fontWeight:500, color:T.t1 }}>{slab.label}</span>
                        </div>
                      </td>
                      <td style={{ padding:"12px 14px", verticalAlign:"middle", width:160 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:0 }}>
                          <input type="number" min={0} value={slab.surcharge} onChange={e => updateValueSurcharge(i, Number(e.target.value))} className="pr-input"
                            style={{ flex:1, height:36, padding:"0 10px", fontFamily:T.mono, fontSize:13, fontWeight:600, color:T.t1, background:T.bg, border:`1px solid ${T.border2}`, borderRadius:"7px 0 0 7px" }}
                          />
                          <div style={{ height:36, padding:"0 10px", display:"flex", alignItems:"center", background:"rgba(255,215,0,.15)", border:"1px solid rgba(255,215,0,.3)", borderRadius:"0 7px 7px 0", fontFamily:T.mono, fontSize:10, color:"#7a6500", fontWeight:600 }}>FCFA</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* ── ENGINS ── */}
          {tab === "engins" && (
            <Card delay={0}>
              <SH title="Types d'engins & capacités" sub="Définissez les limites et frais supplémentaires par type de véhicule"/>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {pricing.vehicles.map((veh, i) => (
                  <div key={veh.id} style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:14, padding:"16px 18px", animation:`pr-fadeUp .35s ease ${i*80}ms both` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                      <div style={{ width:44, height:44, borderRadius:10, background:T.greenPl, border:`1px solid ${T.greenBd}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{veh.icon}</div>
                      <div>
                        <div style={{ fontFamily:T.disp, fontSize:15, fontWeight:700, color:T.t1 }}>{veh.label}</div>
                        <div style={{ fontFamily:T.mono, fontSize:10, color:T.t3 }}>ID : {veh.id}</div>
                      </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
                      <div>
                        <label style={{ display:"block", fontFamily:T.mono, fontSize:10, color:T.t3, textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>Poids max (kg)</label>
                        <input type="number" min={1} value={veh.maxWeight} onChange={e => updateVehicle(veh.id,"maxWeight",Number(e.target.value))} className="pr-input"
                          style={{ width:"100%", height:36, padding:"0 10px", fontFamily:T.mono, fontSize:13, fontWeight:600, color:T.t1, background:T.bg1, border:`1px solid ${T.border2}`, borderRadius:8 }}
                        />
                      </div>
                      <div>
                        <label style={{ display:"block", fontFamily:T.mono, fontSize:10, color:T.t3, textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>Valeur max (F)</label>
                        <input type="number" min={0} value={veh.maxValue} onChange={e => updateVehicle(veh.id,"maxValue",Number(e.target.value))} className="pr-input"
                          style={{ width:"100%", height:36, padding:"0 10px", fontFamily:T.mono, fontSize:13, fontWeight:600, color:T.t1, background:T.bg1, border:`1px solid ${T.border2}`, borderRadius:8 }}
                        />
                      </div>
                      <div>
                        <label style={{ display:"block", fontFamily:T.mono, fontSize:10, color:T.t3, textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>Supplément base (F)</label>
                        <input type="number" min={0} value={veh.baseSurcharge} onChange={e => updateVehicle(veh.id,"baseSurcharge",Number(e.target.value))} className="pr-input"
                          style={{ width:"100%", height:36, padding:"0 10px", fontFamily:T.mono, fontSize:13, fontWeight:600, color:T.t1, background:T.bg1, border:`1px solid ${T.border2}`, borderRadius:8 }}
                        />
                      </div>
                    </div>
                    <div style={{ marginTop:12, borderTop:`1px solid ${T.border}`, paddingTop:10 }}>
                      <div style={{ fontFamily:T.mono, fontSize:9, color:T.t3, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>Colis compatibles</div>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {pricing.packageNatures.map(nat => {
                          const ok = nat.compatible.includes(veh.id);
                          return ok ? (
                            <span key={nat.id} style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:500, fontFamily:T.sans, background:T.greenPl, color:T.greenD, border:`1px solid ${T.greenBd}` }}>
                              {nat.icon} {nat.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* ─── Simulateur (colonne droite) ─── */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          <Card delay={100} style={{ position:"sticky", top:0 }}>
            <SH title="🧮 Simulateur de tarif" sub="Testez la grille en temps réel"/>

            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:16 }}>
              <div>
                <div style={{ fontFamily:T.mono, fontSize:10, color:T.t3, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>Engin</div>
                <div style={{ display:"flex", gap:8 }}>
                  {pricing.vehicles.map(veh => (
                    <button key={veh.id} className="pr-cat-card" onClick={() => setSim(s=>({...s,vehicle:veh.id}))} style={{
                      flex:1, padding:"10px 8px", borderRadius:10, textAlign:"center",
                      background: sim.vehicle===veh.id ? T.greenPl : T.bg,
                      border:`1.5px solid ${sim.vehicle===veh.id ? T.green : T.border}`,
                      cursor:"pointer",
                    }}>
                      <div style={{ fontSize:20, marginBottom:3 }}>{veh.icon}</div>
                      <div style={{ fontFamily:T.sans, fontSize:11, fontWeight:sim.vehicle===veh.id?700:400, color:sim.vehicle===veh.id?T.greenD:T.t2 }}>{veh.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div>
                  <label style={{ display:"block", fontFamily:T.mono, fontSize:10, color:T.t3, textTransform:"uppercase", letterSpacing:.8, marginBottom:5 }}>km collecte</label>
                  <input type="number" min={0} step={0.5} value={sim.kmPickup} onChange={e=>setSim(s=>({...s,kmPickup:Number(e.target.value)}))} className="pr-input"
                    style={{ width:"100%", height:36, padding:"0 10px", fontFamily:T.mono, fontSize:13, fontWeight:500, color:T.blue, background:T.bluePl, border:`1px solid ${T.blueBd}`, borderRadius:8 }}
                  />
                </div>
                <div>
                  <label style={{ display:"block", fontFamily:T.mono, fontSize:10, color:T.t3, textTransform:"uppercase", letterSpacing:.8, marginBottom:5 }}>km livraison</label>
                  <input type="number" min={0} step={0.5} value={sim.kmDelivery} onChange={e=>setSim(s=>({...s,kmDelivery:Number(e.target.value)}))} className="pr-input"
                    style={{ width:"100%", height:36, padding:"0 10px", fontFamily:T.mono, fontSize:13, fontWeight:500, color:T.greenD, background:T.greenPl, border:`1px solid ${T.greenBd}`, borderRadius:8 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display:"block", fontFamily:T.mono, fontSize:10, color:T.t3, textTransform:"uppercase", letterSpacing:.8, marginBottom:5 }}>Poids (kg)</label>
                <input type="range" min={0.1} max={30} step={0.5} value={sim.weightKg} onChange={e=>setSim(s=>({...s,weightKg:Number(e.target.value)}))}
                  style={{ width:"100%", accentColor:T.green }}
                />
                <div style={{ display:"flex", justifyContent:"space-between", fontFamily:T.mono, fontSize:10, color:T.t3, marginTop:3 }}>
                  <span>0.1 kg</span>
                  <span style={{ color:T.amber, fontWeight:600 }}>{sim.weightKg} kg</span>
                  <span>30 kg</span>
                </div>
              </div>

              <div>
                <div style={{ fontFamily:T.mono, fontSize:10, color:T.t3, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>Nature</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  {pricing.packageNatures.map(nat => {
                    const compat = nat.compatible.includes(sim.vehicle);
                    return (
                      <button key={nat.id} className="pr-cat-card" onClick={() => setSim(s=>({...s,nature:nat.id}))} disabled={!compat} style={{
                        display:"flex", alignItems:"center", gap:7, padding:"8px 10px", borderRadius:9, textAlign:"left",
                        background: sim.nature===nat.id ? T.greenPl : !compat ? "rgba(0,0,0,.03)" : T.bg,
                        border:`1.5px solid ${sim.nature===nat.id ? T.green : !compat ? T.border : T.border2}`,
                        opacity: compat ? 1 : .38, cursor:compat?"pointer":"not-allowed",
                      }}>
                        <span style={{ fontSize:15 }}>{nat.icon}</span>
                        <div>
                          <div style={{ fontFamily:T.sans, fontSize:11, fontWeight:sim.nature===nat.id?700:400, color:sim.nature===nat.id?T.greenD:T.t1 }}>{nat.label}</div>
                          <div style={{ fontFamily:T.mono, fontSize:9, color: nat.multiplier>1.5?T.red:nat.multiplier>1?T.amber:T.greenD }}>×{nat.multiplier.toFixed(2)}</div>
                        </div>
                        {!compat && <span style={{ marginLeft:"auto", fontSize:9, color:T.red, fontFamily:T.mono }}>✗</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display:"block", fontFamily:T.mono, fontSize:10, color:T.t3, textTransform:"uppercase", letterSpacing:.8, marginBottom:5 }}>Valeur déclarée (F)</label>
                <input type="number" min={0} step={1000} value={sim.declaredValue} onChange={e=>setSim(s=>({...s,declaredValue:Number(e.target.value)}))} className="pr-input"
                  style={{ width:"100%", height:36, padding:"0 10px", fontFamily:T.mono, fontSize:13, fontWeight:500, color:T.t1, background:T.bg, border:`1px solid ${T.border2}`, borderRadius:8 }}
                />
              </div>
            </div>

            <div style={{
              background: isCompatible ? `linear-gradient(135deg, ${T.greenD}, #2a6048)` : `linear-gradient(135deg, ${T.red}, #c0392b)`,
              borderRadius:12, padding:"18px 20px",
              animation:"pr-pop .3s ease both",
            }}>
              {!isCompatible ? (
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:22, marginBottom:6 }}>⚠️</div>
                  <div style={{ fontFamily:T.disp, fontSize:14, fontWeight:700, color:"#fff" }}>Combinaison incompatible</div>
                  <div style={{ fontFamily:T.sans, fontSize:12, color:"rgba(255,255,255,.7)", marginTop:4 }}>
                    {simNat?.label} n'est pas transportable par {simVeh?.label}
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                    <div>
                      <div style={{ fontFamily:T.mono, fontSize:10, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Tarif estimé</div>
                      <div style={{ fontFamily:T.mono, fontSize:32, fontWeight:700, color:"#fff", lineHeight:1 }}>{Math.round(simResult).toLocaleString()} F</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:T.mono, fontSize:10, color:"rgba(255,255,255,.6)", marginBottom:2 }}>{simNat?.icon} {simNat?.label}</div>
                      <div style={{ fontFamily:T.mono, fontSize:10, color:"rgba(255,255,255,.6)" }}>{simVeh?.icon} {simVeh?.label}</div>
                    </div>
                  </div>
                  <div style={{ borderTop:"1px solid rgba(255,255,255,.15)", paddingTop:10, display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                    {[
                      { label:`Collecte (${sim.kmPickup}km)`,     val:`${(sim.kmPickup*pricing.pricePerKmPickup).toLocaleString()} F`  },
                      { label:`Livraison (${sim.kmDelivery}km)`,  val:`${(sim.kmDelivery*pricing.pricePerKmDelivery).toLocaleString()} F`},
                      { label:`Poids (${sim.weightKg}kg)`,        val:`${(pricing.weightSlabs.find(s=>sim.weightKg<=s.maxKg)||pricing.weightSlabs[pricing.weightSlabs.length-1]).surcharge.toLocaleString()} F` },
                      { label:`Multiplicateur`,                   val:`×${simNat?.multiplier.toFixed(2)}`                               },
                    ].map((item,i) => (
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ fontFamily:T.sans, fontSize:11, color:"rgba(255,255,255,.65)" }}>{item.label}</span>
                        <span style={{ fontFamily:T.mono, fontSize:11, fontWeight:600, color:"rgba(255,255,255,.9)" }}>{item.val}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card delay={200}>
            <SH title="Formule de calcul"/>
            <div style={{ background:T.bg, borderRadius:10, padding:"14px 16px", fontFamily:T.mono, fontSize:11, color:T.t2, lineHeight:2 }}>
              <div><span style={{ color:T.greenD, fontWeight:600 }}>Tarif</span> = (</div>
              <div style={{ paddingLeft:16 }}>
                <span style={{ color:T.blue }}>km_collecte × prix_collecte</span><br/>
                + <span style={{ color:T.green }}>km_livraison × prix_livraison</span><br/>
                + <span style={{ color:T.t1 }}>frais_base</span><br/>
                + <span style={{ color:T.t1 }}>supplément_engin</span><br/>
                + <span style={{ color:T.amber }}>majoration_poids</span><br/>
                + <span style={{ color:"#7a6500" }}>majoration_valeur</span><br/>
              </div>
              <div>) × <span style={{ color:T.red }}>multiplicateur_nature</span></div>
              <div style={{ marginTop:8, color:T.t3 }}>→ max(résultat, <span style={{ color:T.greenD }}>tarif_minimum</span>)</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}