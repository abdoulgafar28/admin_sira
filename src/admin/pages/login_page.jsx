// src/admin/pages/login_page.jsx — VERSION FINALE CORRIGÉE
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../services/axios_instance';
import { saveTokens } from '../../services/axios_instance';
import { loginAdmin, registerAdmin, verifyAdmin2FA  } from '../../services/api';

/* ─── Google Fonts ────────────────────────────────────────────────── */
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap';

/* ─── Inline styles ───────────────────────────────────────────────── */
const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --green:      #2ecc71;
    --greenD:     #1a4731;
    --greenM:     #27ae60;
    --greenDark:  #0d2a1e;
    --greenDeep:  #071810;
    --accent:     #2ecc71;
    --accent2:    #5dd98b;
    --glass:      rgba(255,255,255,0.05);
    --glass-b:    rgba(255,255,255,0.09);
    --border:     rgba(46,204,113,0.15);
    --border2:    rgba(46,204,113,0.28);
    --text:       #f0f4f0;
    --text-muted: rgba(240,244,240,0.52);
  }

  .ta-root {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, var(--greenDeep) 0%, var(--greenDark) 45%, #0c2218 100%);
    font-family: 'Inter', sans-serif;
    position: relative; overflow: hidden; padding: 40px 20px;
  }
  .ta-orb { position:absolute; border-radius:50%; filter:blur(90px); pointer-events:none; }
  .ta-orb1 { width:500px; height:500px; background:rgba(46,204,113,.10); top:-140px; right:-80px; }
  .ta-orb2 { width:350px; height:350px; background:rgba(26,71,49,.55);   bottom:-100px; left:-80px; }
  .ta-orb3 { width:250px; height:250px; background:rgba(46,204,113,.07); top:55%; right:18%; }
  .ta-root::before {
    content:''; position:absolute; inset:0; pointer-events:none;
    background-image: linear-gradient(rgba(46,204,113,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(46,204,113,.04) 1px, transparent 1px);
    background-size: 44px 44px;
  }
  .ta-card {
    position:relative; z-index:2; width:100%; max-width:940px; display:flex;
    border-radius:22px; overflow:hidden; border:1px solid var(--border);
    background:rgba(7,24,16,.72); backdrop-filter:blur(24px);
    box-shadow: 0 32px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(46,204,113,.08) inset;
  }
  .ta-left {
    width:42%; flex-shrink:0; padding:52px 44px;
    display:flex; flex-direction:column; justify-content:space-between;
    border-right:1px solid var(--border);
    background: linear-gradient(160deg, rgba(46,204,113,.06) 0%, transparent 60%);
  }
  .ta-logo-row  { display:flex; align-items:center; gap:12px; }
  .ta-logo-mark {
    width:42px; height:42px; border-radius:11px;
    background:linear-gradient(135deg, var(--greenD), var(--greenM));
    display:flex; align-items:center; justify-content:center;
    box-shadow: 0 0 20px rgba(46,204,113,.3);
  }
  .ta-logo-mark svg { width:22px; height:22px; fill:none; stroke:#fff; stroke-width:2; }
  .ta-logo-name { font-family:'Syne',sans-serif; font-weight:700; font-size:16px; color:var(--text); letter-spacing:-.2px; }
  .ta-logo-sub  { font-family:'DM Mono',monospace; font-size:9px; color:var(--text-muted); letter-spacing:2px; text-transform:uppercase; margin-top:2px; }
  .ta-hero { flex:1; display:flex; flex-direction:column; justify-content:center; padding:40px 0; }
  .ta-eyebrow {
    display:inline-flex; align-items:center; gap:8px;
    font-family:'DM Mono',monospace; font-size:10px; letter-spacing:2.5px; text-transform:uppercase;
    color:var(--accent); background:rgba(46,204,113,.08); border:1px solid var(--border);
    padding:4px 12px; border-radius:20px; margin-bottom:22px; width:fit-content;
  }
  .ta-eyebrow-dot { width:6px; height:6px; border-radius:50%; background:var(--accent); animation:ta-pulse 2s ease-in-out infinite; }
  .ta-title { font-family:'Syne',sans-serif; font-size:40px; line-height:1.1; color:var(--text); margin-bottom:20px; font-weight:800; }
  .ta-title span { color:var(--accent); text-shadow: 0 0 30px rgba(46,204,113,.4); }
  .ta-desc { font-size:14px; line-height:1.75; color:var(--text-muted); max-width:240px; }
  .ta-features { display:flex; flex-direction:column; gap:12px; margin-top:8px; }
  .ta-feat { display:flex; align-items:center; gap:12px; }
  .ta-feat-icon { width:26px; height:26px; border-radius:7px; flex-shrink:0; background:rgba(46,204,113,.1); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:12px; }
  .ta-feat-text { font-size:12.5px; color:var(--text-muted); }
  .ta-status { display:flex; align-items:center; margin-top:auto; padding-top:20px; font-family:'DM Mono',monospace; font-size:10px; color:var(--text-muted); }
  .ta-pulse { width:8px; height:8px; border-radius:50%; background:var(--accent); margin-right:8px; box-shadow: 0 0 8px var(--accent); animation:ta-pulse 2s ease-in-out infinite; }
  @keyframes ta-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  .ta-right { flex:1; padding:50px 46px; display:flex; flex-direction:column; justify-content:center; }
  .ta-form-title { font-family:'Syne',sans-serif; font-size:22px; font-weight:700; color:var(--text); margin-bottom:6px; }
  .ta-form-sub   { font-family:'Inter',sans-serif; font-size:13px; color:var(--text-muted); margin-bottom:28px; }
  .ta-tabs { display:flex; gap:0; border-bottom:1px solid var(--border); margin-bottom:28px; }
  .ta-tab { padding:10px 22px; font-size:13px; font-weight:500; background:transparent; border:none; border-bottom:2px solid transparent; margin-bottom:-1px; cursor:pointer; color:var(--text-muted); transition:all .22s; font-family:'Inter',sans-serif; }
  .ta-tab.active { border-bottom-color:var(--accent); color:var(--accent); font-weight:600; }
  .ta-tab:hover:not(.active) { color:var(--text); }
  .ta-field { margin-bottom:16px; position:relative; }
  .ta-field label { display:block; font-family:'DM Mono',monospace; font-size:10px; letter-spacing:1.2px; text-transform:uppercase; color:var(--text-muted); margin-bottom:7px; font-weight:500; }
  .ta-field input, .ta-field select { width:100%; padding:12px 16px 12px 42px; background:rgba(46,204,113,.05); border:1px solid var(--border); border-radius:10px; color:var(--text); font-size:13.5px; font-family:'Inter',sans-serif; outline:none; transition:all .22s; -webkit-appearance:none; }
  .ta-field select { cursor:pointer; }
  .ta-field input::placeholder { color:rgba(240,244,240,.22); }
  .ta-field input:focus, .ta-field select:focus { border-color:var(--accent); background:rgba(46,204,113,.09); box-shadow:0 0 0 3px rgba(46,204,113,.12); }
  .ta-field-icon { position:absolute; left:13px; top:50%; transform:translateY(50%); color:rgba(46,204,113,.5); pointer-events:none; }
  .ta-field-icon svg { width:15px; height:15px; fill:none; stroke:currentColor; stroke-width:1.9; }
  .ta-eye-btn { position:absolute; right:12px; top:50%; transform:translateY(50%); background:none; border:none; cursor:pointer; color:var(--text-muted); padding:2px; transition:color .2s; }
  .ta-eye-btn:hover { color:var(--accent); }
  .ta-eye-btn svg { width:15px; height:15px; fill:none; stroke:currentColor; stroke-width:1.9; }
  .ta-row { display:flex; justify-content:space-between; align-items:center; margin:4px 0 24px; }
  .ta-remember { display:flex; align-items:center; gap:8px; cursor:pointer; }
  .ta-check { width:16px; height:16px; border-radius:4px; border:1px solid var(--border2); background:var(--glass); display:flex; align-items:center; justify-content:center; transition:all .2s; flex-shrink:0; }
  .ta-check.on { background:var(--greenD); border-color:var(--accent); box-shadow:0 0 8px rgba(46,204,113,.3); }
  .ta-check svg { width:10px; height:10px; stroke:white; stroke-width:2.5; fill:none; }
  .ta-remember span { font-size:12px; color:var(--text-muted); }
  .ta-forgot { font-size:12px; color:var(--accent); background:none; border:none; cursor:pointer; font-family:'Inter',sans-serif; }
  .ta-forgot:hover { text-decoration:underline; }
  .ta-btn { width:100%; padding:14px; background:linear-gradient(135deg, var(--greenD) 0%, var(--greenM) 100%); border:none; border-radius:10px; font-size:14px; font-weight:600; font-family:'Inter',sans-serif; color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:transform .2s, box-shadow .2s, opacity .2s; box-shadow: 0 4px 18px rgba(46,204,113,.22); letter-spacing:.2px; }
  .ta-btn:hover   { transform:translateY(-2px); box-shadow:0 8px 28px rgba(46,204,113,.32); }
  .ta-btn:active  { transform:translateY(0); }
  .ta-btn:disabled{ opacity:.55; cursor:not-allowed; transform:none; box-shadow:none; }
  .ta-btn svg { width:15px; height:15px; fill:none; stroke:currentColor; stroke-width:2.2; }
  .ta-spinner { width:18px; height:18px; border:2px solid rgba(255,255,255,.25); border-top-color:#fff; border-radius:50%; animation:ta-spin .7s linear infinite; }
  @keyframes ta-spin { to { transform:rotate(360deg); } }
  .ta-sep { display:flex; align-items:center; gap:14px; margin:20px 0; }
  .ta-sep-line { flex:1; height:1px; background:var(--border); }
  .ta-sep-label { font-family:'DM Mono',monospace; font-size:10px; color:var(--text-muted); letter-spacing:1.5px; text-transform:uppercase; }
  .ta-socials { display:flex; gap:10px; }
  .ta-soc-btn { flex:1; padding:11px; background:rgba(46,204,113,.05); border:1px solid var(--border); border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; color:var(--text-muted); font-size:12.5px; font-family:'Inter',sans-serif; transition:all .2s; }
  .ta-soc-btn:hover { background:rgba(46,204,113,.1); color:var(--text); border-color:var(--accent); }
  .ta-error   { background:rgba(231,76,60,.1);  border:1px solid rgba(231,76,60,.25);  border-radius:9px; padding:11px 14px; margin-bottom:16px; font-size:13px; color:#f09595; font-family:'Inter',sans-serif; }
  .ta-success { background:rgba(46,204,113,.1); border:1px solid rgba(46,204,113,.25); border-radius:9px; padding:11px 14px; margin-bottom:16px; font-size:13px; color:var(--accent); font-family:'Inter',sans-serif; }
  .ta-switch { text-align:center; margin-top:22px; font-size:13px; color:var(--text-muted); font-family:'Inter',sans-serif; }
  .ta-switch button { color:var(--accent); background:none; border:none; cursor:pointer; font-size:13px; font-weight:600; font-family:'Inter',sans-serif; }
  .ta-switch button:hover { text-decoration:underline; }
  
  .ta-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.72); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; z-index:1000; animation:ta-fadeIn .28s ease; }
  .ta-modal { background:linear-gradient(160deg, #0d2a1e 0%, #071810 100%); border-radius:22px; max-width:490px; width:90%; padding:34px; border:1px solid rgba(46,204,113,0.15); box-shadow:0 30px 60px rgba(0,0,0,.6); animation:ta-slideUp .28s ease; }
  @keyframes ta-fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes ta-slideUp { from{transform:translateY(28px);opacity:0} to{transform:translateY(0);opacity:1} }
  
  @media (max-width:680px) {
    .ta-left  { display:none; }
    .ta-right { padding:36px 26px; }
    .ta-card  { border-radius:18px; }
  }
`;

/* ─── Icônes SVG ──────────────────────────────────────────────────── */
const IconMail     = () => (<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>);
const IconLock     = () => (<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const IconBuilding = () => (<svg viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="12" y2="15"/></svg>);
const IconShield   = () => (<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>);
const IconLayers   = () => (<svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>);
const IconArrow    = () => (<svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>);
const IconAddUser  = () => (<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>);
const IconEyeOpen  = () => (<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>);
const IconEyeClosed= () => (<svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>);
const IconCheck    = () => (<svg viewBox="0 0 12 10"><polyline points="1,5 4,8 11,1"/></svg>);

/* ─── Atoms ───────────────────────────────────────────────────────── */
const FieldInput = ({ label, type='text', value, onChange, placeholder, icon, onToggleEye, showEye, eyeOpen }) => (
  <div className="ta-field">
    <label>{label}</label>
    <div className="ta-field-icon">{icon}</div>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoComplete="off"/>
    {showEye && (
      <button className="ta-eye-btn" type="button" onClick={onToggleEye}>
        {eyeOpen ? <IconEyeClosed/> : <IconEyeOpen/>}
      </button>
    )}
  </div>
);

const Msg = ({ type, text }) => text ? <div className={type==='error'?'ta-error':'ta-success'}>{text}</div> : null;

/* ─── Modal 2FA (définie EN DEHORS de LoginPage) ──────────────────── */
const TwoFAModal = ({ open, email, onSuccess, onCancel }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (open && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    pastedData.split('').forEach((char, i) => { if (i < 6) newCode[i] = char; });
    setCode(newCode);
    const nextIndex = Math.min(pastedData.length, 5);
    if (inputRefs.current[nextIndex]) inputRefs.current[nextIndex].focus();
  };

  const handleVerify = async () => {
    const finalCode = code.join('');
    if (finalCode.length !== 6) {
      setError('Veuillez saisir les 6 chiffres du code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await verifyAdmin2FA(email, finalCode);
      const data = response.data;
      if (data.success) {
        saveTokens(data.data.access, data.data.refresh);
        onSuccess();
      } else {
        setError(data.message || 'Code incorrect.');
      }
    } catch (err) {
      setError(err.response?.data?.errors?.detail || err.response?.data?.detail || 'Code invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  const maskedEmail = email.replace(/(.{2}).*(@.*)/, '$1***$2');

  return (
    <div className="ta-modal-overlay" onClick={onCancel}>
      <div className="ta-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, color: '#f0f4f0', marginBottom: 8, fontWeight: 700 }}>
          Vérification en deux étapes
        </h3>
        <p style={{ fontSize: 13, color: 'rgba(240,244,240,0.52)', lineHeight: 1.6 }}>
          Un code à 6 chiffres a été envoyé à<br/>
          <strong style={{ color: '#2ecc71', fontFamily: "'DM Mono', monospace" }}>{maskedEmail}</strong>
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '24px 0' }} onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              style={{
                width: 46, height: 56, borderRadius: 12,
                border: digit ? '1.5px solid #2ecc71' : '1.5px solid rgba(46,204,113,0.2)',
                background: digit ? 'rgba(46,204,113,0.1)' : 'rgba(46,204,113,0.04)',
                color: '#f0f4f0', fontSize: 24, fontWeight: 600,
                fontFamily: "'DM Mono', monospace", textAlign: 'center',
                outline: 'none', transition: 'all 0.2s',
                boxShadow: digit ? '0 0 12px rgba(46,204,113,0.3)' : 'none',
              }}
            />
          ))}
        </div>

        {error && (
          <div style={{
            background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.25)',
            borderRadius: 9, padding: '10px 14px', marginBottom: 16,
            fontSize: 13, color: '#f09595', fontFamily: "'Inter', sans-serif",
          }}>{error}</div>
        )}

        <button onClick={handleVerify} disabled={loading || code.join('').length !== 6}
          style={{
            width: '100%', padding: '14px',
            background: 'linear-gradient(135deg, #1a4731 0%, #27ae60 100%)',
            border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
            fontFamily: "'Inter', sans-serif", color: '#fff', cursor: 'pointer',
            transition: 'all .2s', boxShadow: '0 4px 18px rgba(46,204,113,.22)',
            opacity: loading ? 0.55 : 1,
          }}>
          {loading ? (
            <div style={{
              width: 18, height: 18, border: '2px solid rgba(255,255,255,.25)',
              borderTopColor: '#fff', borderRadius: '50%',
              animation: 'ta-spin .7s linear infinite',
            }}/>
          ) : 'Vérifier le code'}
        </button>

        <div style={{ marginTop: 18, fontSize: 12, color: 'rgba(240,244,240,0.4)' }}>
          Code valable 10 minutes ·{' '}
          <button onClick={onCancel} style={{
            color: '#2ecc71', background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 12,
          }}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════
   PAGE PRINCIPALE
   ════════════════════════════════════════════════════════════════════ */
function LoginPage() {
  const navigate = useNavigate();

  const [mode,       setMode]       = useState('login');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [msg,        setMsg]        = useState({ type:'', text:'' });

  const [twoFAOpen,  setTwoFAOpen]  = useState(false);
  const [twoFAEmail, setTwoFAEmail] = useState('');

  const [reg,        setReg]        = useState({ companyName:'', email:'', password:'', confirm:'' });
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [regMsg,     setRegMsg]     = useState({ type:'', text:'' });

  // Charger les Google Fonts une seule fois
  useEffect(() => {
    const id = 'sira-fonts';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

  // Email mémorisé
  useEffect(() => {
    const saved = localStorage.getItem('rememberedEmail');
    if (saved) { setEmail(saved); setRememberMe(true); }
  }, []);

  
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setMsg({ type:'error', text:'Veuillez remplir tous les champs.' });
      return;
    }
    setLoading(true);
    setMsg({ type:'', text:'' });
    try {
      const response = await loginAdmin({ email, password });
      const data = response.data;
      
      if (data.needs_2fa) {
        // 2FA requis → ouvrir la modal
        setTwoFAEmail(data.data.email);
        setTwoFAOpen(true);
        if (rememberMe) localStorage.setItem('rememberedEmail', email);
      } else {
        // Connexion directe
        saveTokens(data.data.access, data.data.refresh);
        if (rememberMe) localStorage.setItem('rememberedEmail', email);
        else localStorage.removeItem('rememberedEmail');
        toast.success(data.message || `Bienvenue ${data.data.user.full_name} 👋`);
        navigate('/dashboard');
      }
    } catch (err) {
      setMsg({ type:'error', text: err.response?.data?.detail || 'Identifiants incorrects.' });
    } finally {
      setLoading(false);
    }
  };





  const handleRegister = async (e) => {
    e.preventDefault();
    if (!reg.companyName || !reg.email || !reg.password || !reg.confirm) {
      setRegMsg({ type:'error', text:'Tous les champs sont obligatoires.' });
      return;
    }
    if (reg.password !== reg.confirm) {
      setRegMsg({ type:'error', text:'Les mots de passe ne correspondent pas.' });
      return;
    }
    if (reg.password.length < 8) {
      setRegMsg({ type:'error', text:'Mot de passe trop court (min. 8 caractères).' });
      return;
    }
    setLoading(true);
    setRegMsg({ type:'', text:'' });
    try {
      const { data } = await API.post('/admin/auth/register/', {
        company_name: reg.companyName,
        email: reg.email,
        password: reg.password,
        confirm_password: reg.confirm,
      });
      if (data.success) {
        toast.success(data.message);
        setMode('login');
        setEmail(reg.email);
        setMsg({ type:'success', text:'Compte créé avec succès ! Connectez-vous ci-dessous.' });
        setReg({ companyName:'', email:'', password:'', confirm:'' });
      } else {
        setRegMsg({ type:'error', text: data.message || "Erreur lors de l'inscription." });
      }
    } catch (err) {
      const errorData = err.response?.data;
      setRegMsg({ type:'error', text: errorData ? Object.values(errorData).flat().join(' — ') : "Erreur lors de la création du compte." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="ta-root">
        <div className="ta-orb ta-orb1"/>
        <div className="ta-orb ta-orb2"/>
        <div className="ta-orb ta-orb3"/>

        <div className="ta-card">
          <div className="ta-left">
            <div className="ta-logo-row">
              <img 
                src="/sira__logo.png" 
                alt="SiRA" 
                style={{ height: 42, width: 'auto', borderRadius: 11 }}
              />
              <div>
                <div className="ta-logo-name">SiRA<span style={{ color:'var(--accent)' }}>.</span></div>
                <div className="ta-logo-sub">OPS Center</div>
              </div>
            </div>
            <div className="ta-hero">
              <div className="ta-eyebrow"><div className="ta-eyebrow-dot"/>Panneau de contrôle</div>
              <h1 className="ta-title">Gérez vos courses avec<br/><span>précision</span></h1>
              <p className="ta-desc">Plateforme de pilotage complète pour les opérateurs de livraison modernes.</p>
            </div>
            <div className="ta-features">
              {[
                { icon:'🛵', text:'Suivi temps réel des conducteurs' },
                { icon:'🔍', text:'Détection de fraude intelligente' },
                { icon:'📦', text:'Gestion des colis multi-critères' },
                { icon:'📊', text:'Tableaux de bord analytiques' },
              ].map((f, i) => (
                <div className="ta-feat" key={i}>
                  <div className="ta-feat-icon">{f.icon}</div>
                  <span className="ta-feat-text">{f.text}</span>
                </div>
              ))}
            </div>
            <div className="ta-status"><div className="ta-pulse"/>Système opérationnel · v2.0.0</div>
          </div>

          <div className="ta-right">
            <div className="ta-form-title">{mode === 'login' ? 'Bon retour 👋' : 'Créer votre espace'}</div>
            <div className="ta-form-sub">{mode === 'login' ? 'Connectez-vous à votre tableau de bord administrateur' : 'Inscrivez votre entreprise sur la plateforme SiRA'}</div>

            <div className="ta-tabs">
              <button className={`ta-tab${mode==='login'?' active':''}`} onClick={() => { setMode('login'); setMsg({ type:'', text:'' }); }}>Connexion</button>
              <button className={`ta-tab${mode==='register'?' active':''}`} onClick={() => { setMode('register'); setRegMsg({ type:'', text:'' }); }}>Inscription</button>
            </div>

            {mode === 'login' && (
              <form onSubmit={handleLogin}>
                <Msg {...msg}/>
                <FieldInput label="Adresse e-mail" type="email" value={email} onChange={setEmail} placeholder="vous@entreprise.com" icon={<IconMail/>}/>
                <FieldInput label="Mot de passe" type={showPwd ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="••••••••••" icon={<IconLock/>} showEye eyeOpen={showPwd} onToggleEye={() => setShowPwd(v => !v)}/>
                <div className="ta-row">
                  <label className="ta-remember" onClick={() => setRememberMe(v => !v)}>
                    <div className={`ta-check${rememberMe ? ' on' : ''}`}><IconCheck/></div>
                    <span>Se souvenir de moi</span>
                  </label>
                  
                  <button 
                    type="button" 
                    className="ta-forgot" 
                    onClick={() => navigate('/forgotpassword')}
                  >
                    Mot de passe oublié ?
                  </button>



                </div>
                <button type="submit" className="ta-btn" disabled={loading}>
                  {loading ? <div className="ta-spinner"/> : <>Se connecter <IconArrow/></>}
                </button>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={handleRegister}>
                <Msg {...regMsg}/>
                <FieldInput label="Nom de l'entreprise" value={reg.companyName} onChange={v => setReg(r => ({ ...r, companyName:v }))} placeholder="Ma Société SARL" icon={<IconBuilding/>}/>
                <FieldInput label="E-mail professionnel" type="email" value={reg.email} onChange={v => setReg(r => ({ ...r, email:v }))} placeholder="contact@entreprise.com" icon={<IconMail/>}/>
                <FieldInput label="Mot de passe" type={showRegPwd ? 'text' : 'password'} value={reg.password} onChange={v => setReg(r => ({ ...r, password:v }))} placeholder="Min. 8 caractères" icon={<IconLock/>} showEye eyeOpen={showRegPwd} onToggleEye={() => setShowRegPwd(v => !v)}/>
                <FieldInput label="Confirmer le mot de passe" type="password" value={reg.confirm} onChange={v => setReg(r => ({ ...r, confirm:v }))} placeholder="Répétez le mot de passe" icon={<IconShield/>}/>
                <button type="submit" className="ta-btn" disabled={loading} style={{ marginTop:6 }}>
                  {loading ? <div className="ta-spinner"/> : <>Créer mon entreprise <IconAddUser/></>}
                </button>
                <div className="ta-switch">Déjà un compte ? <button type="button" onClick={() => setMode('login')}>Se connecter</button></div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Modal 2FA — EN DEHORS de tout, au niveau racine */}
      <TwoFAModal
        open={twoFAOpen}
        email={twoFAEmail}
        onSuccess={() => { setTwoFAOpen(false); navigate('/dashboard'); }}
        onCancel={() => setTwoFAOpen(false)}
      />
    </>
  );
}

export default LoginPage;