import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { forgotPassword, resetPassword } from '../../services/api';

// Réutiliser les mêmes constantes CSS et icônes que LoginPage
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap';

const css = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --green:#2ecc71;--greenD:#1a4731;--greenM:#27ae60;--greenDark:#0d2a1e;--greenDeep:#071810;
    --accent:#2ecc71;--border:rgba(46,204,113,0.15);--text:#f0f4f0;--text-muted:rgba(240,244,240,0.52);
  }
  .ta-root{
    min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:linear-gradient(135deg,#071810 0%,#0d2a1e 45%,#0c2218 100%);
    font-family:'Inter',sans-serif;position:relative;overflow:hidden;padding:40px 20px;
  }
  .ta-card{
    position:relative;z-index:2;width:100%;max-width:460px;
    border-radius:22px;overflow:hidden;border:1px solid rgba(46,204,113,0.15);
    background:rgba(7,24,16,.72);backdrop-filter:blur(24px);
    box-shadow:0 32px 80px rgba(0,0,0,.5);padding:48px 40px;
  }
  .ta-icon-circle{
    width:64px;height:64px;border-radius:50%;
    background:linear-gradient(135deg,#1a4731,#27ae60);
    display:flex;align-items:center;justify-content:center;margin:0 auto 24px;
    box-shadow:0 0 24px rgba(46,204,113,.3);
  }
  .ta-title{
    font-family:'Syne',sans-serif;font-size:22px;font-weight:700;
    color:#f0f4f0;text-align:center;margin-bottom:8px;
  }
  .ta-sub{
    font-size:13px;color:rgba(240,244,240,0.52);text-align:center;margin-bottom:28px;line-height:1.6;
  }
  .ta-field{margin-bottom:16px;position:relative}
  .ta-field label{
    display:block;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:1.2px;
    text-transform:uppercase;color:rgba(240,244,240,0.52);margin-bottom:7px;font-weight:500;
  }
  .ta-field input{
    width:100%;padding:12px 16px;background:rgba(46,204,113,.05);
    border:1px solid rgba(46,204,113,0.15);border-radius:10px;color:#f0f4f0;
    font-size:13.5px;font-family:'Inter',sans-serif;outline:none;transition:all .22s;
  }
  .ta-field input:focus{border-color:#2ecc71;background:rgba(46,204,113,.09);box-shadow:0 0 0 3px rgba(46,204,113,.12)}
  .ta-btn{
    width:100%;padding:14px;background:linear-gradient(135deg,#1a4731,#27ae60);
    border:none;border-radius:10px;font-size:14px;font-weight:600;font-family:'Inter',sans-serif;
    color:#fff;cursor:pointer;transition:transform .2s,box-shadow .2s,opacity .2s;
    box-shadow:0 4px 18px rgba(46,204,113,.22);
  }
  .ta-btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(46,204,113,.32)}
  .ta-btn:disabled{opacity:.55;cursor:not-allowed;transform:none;box-shadow:none}
  .ta-error{
    background:rgba(231,76,60,.1);border:1px solid rgba(231,76,60,.25);
    border-radius:9px;padding:11px 14px;margin-bottom:16px;font-size:13px;color:#f09595;
  }
  .ta-success{
    background:rgba(46,204,113,.1);border:1px solid rgba(46,204,113,.25);
    border-radius:9px;padding:11px 14px;margin-bottom:16px;font-size:13px;color:#2ecc71;
  }
  .ta-link{
    text-align:center;margin-top:22px;font-size:13px;color:rgba(240,244,240,0.52);
  }
  .ta-link a{color:#2ecc71;text-decoration:none;font-weight:600}
  .ta-link a:hover{text-decoration:underline}
  .ta-spinner{
    width:18px;height:18px;border:2px solid rgba(255,255,255,.25);
    border-top-color:#fff;border-radius:50%;animation:ta-spin .7s linear infinite;margin:0 auto;
  }
  @keyframes ta-spin{to{transform:rotate(360deg)}}
`;

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  // Forcer le mode reset si token présent dans l'URL
  const isResetMode = !!token;

  
  // Mode "reset" si on a un token dans l'URL
  
  
  // État "mot de passe oublié"
  const [email, setEmail] = useState(emailParam || '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  // État "réinitialisation"
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Charger les Google Fonts
  useEffect(() => {
    const id = 'sira-fonts';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id; link.rel = 'stylesheet'; link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setMsg({ type: 'error', text: 'Veuillez saisir votre adresse email.' });
      return;
    }
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const response = await forgotPassword(email);
      setMsg({ 
        type: 'success', 
        text: response.data.message || 'Un lien de réinitialisation a été envoyé à votre adresse email.' 
      });
    } catch (err) {
      setMsg({ type: 'error', text: 'Erreur lors de l\'envoi. Réessayez.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setMsg({ type: 'error', text: 'Tous les champs sont obligatoires.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    if (newPassword.length < 8) {
      setMsg({ type: 'error', text: 'Mot de passe trop court (min. 8 caractères).' });
      return;
    }
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const response = await resetPassword(token, emailParam, newPassword, confirmPassword);
      setMsg({ type: 'success', text: response.data.message });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.errors?.detail || 'Lien invalide ou expiré.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="ta-root">
        <div className="ta-card">
          <div className="ta-icon-circle">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              <circle cx="12" cy="16" r="1"/>
            </svg>
          </div>

          {!isResetMode ? (
            <>
              <h2 className="ta-title">Mot de passe oublié ?</h2>
              <p className="ta-sub">
                Saisissez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
              <form onSubmit={handleForgotPassword}>
                {msg.text && <div className={msg.type === 'error' ? 'ta-error' : 'ta-success'}>{msg.text}</div>}
                <div className="ta-field">
                  <label>Adresse email</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="vous@entreprise.com" 
                  />
                </div>
                <button type="submit" className="ta-btn" disabled={loading}>
                  {loading ? <div className="ta-spinner"/> : 'Envoyer le lien'}
                </button>
                <div className="ta-link">
                  <Link to="/login">← Retour à la connexion</Link>
                </div>
              </form>
            </>
          ) : (
            <>
              <h2 className="ta-title">Nouveau mot de passe</h2>
              <p className="ta-sub">
                Choisissez un nouveau mot de passe pour <strong style={{ color: '#2ecc71' }}>{emailParam}</strong>
              </p>
              <form onSubmit={handleResetPassword}>
                {msg.text && <div className={msg.type === 'error' ? 'ta-error' : 'ta-success'}>{msg.text}</div>}
                <div className="ta-field">
                  <label>Nouveau mot de passe</label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    placeholder="Min. 8 caractères" 
                  />
                </div>
                <div className="ta-field">
                  <label>Confirmer le mot de passe</label>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    placeholder="Répétez le mot de passe" 
                  />
                </div>
                <button type="submit" className="ta-btn" disabled={loading}>
                  {loading ? <div className="ta-spinner"/> : 'Réinitialiser'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default ForgotPasswordPage;