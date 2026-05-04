import React, { useMemo, useState } from 'react';
import { Mail, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from "../lib/supabaseClient";

// Feature flags for OAuth providers. Both default to OFF until the provider
// is actually configured inside Supabase → Authentication → Providers.
// Flip the flag in `.env` (and on Vercel) once the provider works end-to-end:
//   VITE_AUTH_APPLE_ENABLED=true
//   VITE_AUTH_GOOGLE_ENABLED=true
const APPLE_ENABLED = import.meta.env.VITE_AUTH_APPLE_ENABLED === 'true';
const GOOGLE_ENABLED = import.meta.env.VITE_AUTH_GOOGLE_ENABLED === 'true';
const ANY_OAUTH_ENABLED = APPLE_ENABLED || GOOGLE_ENABLED;
const DEFAULT_APP_URL = 'https://fiayer-project-oficial-fia-yer.vercel.app';
const APP_URL = import.meta.env.VITE_APP_URL || ((typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)) ? DEFAULT_APP_URL : window.location.origin);

export default function AuthModal({ isOpen, onClose, onLogin }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('magic'); // 'magic' | 'password'
  const [isSignup, setIsSignup] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');
  const [oauthLoading, setOauthLoading] = useState(null); // 'apple' | 'google' | null

  const canSend = useMemo(() => email.trim().includes('@') && status !== 'sending', [email, status]);
  const canPassword = useMemo(() => email.trim().includes('@') && password.length >= 8 && status !== 'sending', [email, password, status]);

  const sendMagicLink = async () => {
    setStatus('sending');
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: APP_URL },
      });
      if (error) throw error;
      setStatus('sent');
    } catch (e) {
      setStatus('error');
      setErrorMsg(e?.message || t('auth.genericError'));
    }
  };

  const handlePasswordAuth = async () => {
    setStatus('sending');
    setErrorMsg('');
    try {
      const emailAddress = email.trim();
      let result;
      if (isSignup) {
        result = await supabase.auth.signUp({ email: emailAddress, password });
      } else {
        result = await supabase.auth.signInWithPassword({ email: emailAddress, password });
      }
      if (result.error) throw result.error;
      setStatus('sent');
    } catch (e) {
      setStatus('error');
      setErrorMsg(e?.message || t('auth.genericError'));
    }
  };

  const signInWithOAuth = async (provider) => {
    setOauthLoading(provider);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: APP_URL },
      });
      if (error) throw error;
      // Supabase redirects the user away; nothing else to do here.
    } catch (e) {
      setOauthLoading(null);
      setStatus('error');
      setErrorMsg(e?.message || t('auth.genericError'));
    }
  };

  const loginWithTestAdmin = async () => {
    setStatus('sending');
    setErrorMsg('');
    const testEmail = 'admin@todoflyer.test';
    const testPassword = 'Admin1234';

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (signInError) {
        const isMissingUser = /user not found|invalid login credentials|password is invalid/i.test(signInError.message);
        if (isMissingUser) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
          });
          if (signUpError) throw signUpError;
          setStatus('sent');
          onClose?.();
          return;
        }
        throw signInError;
      }

      setStatus('sent');
      onClose?.();
    } catch (e) {
      setStatus('error');
      setErrorMsg(e?.message || t('auth.genericError'));
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(6, 26, 18, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '440px',
        padding: '2.5rem',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-body)',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-cream)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <X size={20} />
        </button>

        {/* Modal content */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'rgba(62, 134, 193, 0.1)',
            color: 'var(--color-primary)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <Sparkles size={24} strokeWidth={2.5} />
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--color-text-dark)',
            letterSpacing: '-0.02em',
            marginBottom: '0.75rem'
          }}>
            {t('auth.title')}
          </h2>
          <p
            style={{ fontSize: '0.925rem', color: 'var(--color-text-body)', lineHeight: 1.5 }}
            dangerouslySetInnerHTML={{ __html: t('auth.desc').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        </div>

        {/* Auth options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {APPLE_ENABLED && (
            <button
              onClick={() => signInWithOAuth('apple')}
              disabled={oauthLoading !== null}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                backgroundColor: '#000000',
                color: '#ffffff',
                padding: '0.875rem',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.9375rem',
                cursor: oauthLoading ? 'not-allowed' : 'pointer',
                opacity: oauthLoading && oauthLoading !== 'apple' ? 0.6 : 1,
                border: '1px solid #000000',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => { if (!oauthLoading) e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={e => { if (!oauthLoading) e.currentTarget.style.opacity = '1'; }}
            >
              {oauthLoading === 'apple' ? t('auth.sending') : t('auth.apple')}
            </button>
          )}

          {GOOGLE_ENABLED && (
            <button
              onClick={() => signInWithOAuth('google')}
              disabled={oauthLoading !== null}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                backgroundColor: '#ffffff',
                color: '#3c4043',
                padding: '0.875rem',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.9375rem',
                cursor: oauthLoading ? 'not-allowed' : 'pointer',
                opacity: oauthLoading && oauthLoading !== 'google' ? 0.6 : 1,
                border: '1px solid #dadce0',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={e => { if (!oauthLoading) e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
              onMouseLeave={e => { if (!oauthLoading) e.currentTarget.style.backgroundColor = '#ffffff'; }}
            >
              G {oauthLoading === 'google' ? t('auth.sending') : t('auth.google')}
            </button>
          )}

          <button
            onClick={loginWithTestAdmin}
            disabled={status === 'sending' || oauthLoading !== null}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              backgroundColor: '#0f766e',
              color: '#ffffff',
              padding: '0.875rem',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.9375rem',
              cursor: status === 'sending' || oauthLoading ? 'not-allowed' : 'pointer',
              border: '1px solid transparent',
              transition: 'opacity 0.2s',
              opacity: status === 'sending' || oauthLoading ? 0.6 : 1,
            }}
          >
            {status === 'sending' ? t('auth.sending') : 'Entrar amb compte de prova'}
          </button>

          {ANY_OAUTH_ENABLED && (
            <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-body)', padding: '0 1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>o</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.8rem' }}>{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              style={{ width: '100%' }}
              autoComplete="email"
            />
            <button
              onClick={sendMagicLink}
              disabled={!canSend}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                backgroundColor: canSend ? 'var(--color-primary)' : '#B0C8DE',
                color: '#ffffff',
                padding: '0.875rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.9375rem',
                cursor: canSend ? 'pointer' : 'not-allowed',
              }}
            >
              <Mail size={18} /> {status === 'sending' ? t('auth.sending') : t('auth.sendMagic')}
            </button>
            {status === 'sent' && (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-body)' }}>
                {t('auth.sentCheckEmail')}
              </p>
            )}
            {status === 'error' && (
              <p style={{ fontSize: '0.85rem', color: '#b91c1c' }}>{errorMsg}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setAuthMode(authMode === 'magic' ? 'password' : 'magic');
              setStatus('idle');
              setErrorMsg('');
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              backgroundColor: 'transparent',
              color: 'var(--color-text-dark)',
              padding: '0.875rem',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.9375rem',
              cursor: 'pointer',
              border: '1.5px solid var(--color-border)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
               e.currentTarget.style.borderColor = 'var(--color-text-dark)';
            }}
            onMouseLeave={e => {
               e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            <Mail size={18} /> {authMode === 'magic' ? 'Accés amb contrasenya' : 'Tornar a enllaç màgic'}
          </button>

          {authMode === 'password' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.8rem' }}>Contrasenya</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Escriu una contrasenya (min. 8 caràcters)"
                style={{ width: '100%' }}
                autoComplete="current-password"
              />
              <button
                onClick={handlePasswordAuth}
                disabled={!canPassword}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  backgroundColor: canPassword ? 'var(--color-primary)' : '#B0C8DE',
                  color: '#ffffff',
                  padding: '0.875rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  cursor: canPassword ? 'pointer' : 'not-allowed',
                }}
              >
                {isSignup ? 'Crear compte' : 'Iniciar sessió'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setStatus('idle');
                  setErrorMsg('');
                }}
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-dark)',
                  padding: '0.875rem',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  border: '1.5px solid var(--color-border)',
                  transition: 'all 0.2s',
                }}
              >
                {isSignup ? 'Ja tens compte? Inicia sessió' : 'Crear un compte nou'}
              </button>
            </div>
          )}

          <button
            onClick={() => onLogin?.('email')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              backgroundColor: 'transparent',
              color: 'var(--color-text-dark)',
              padding: '0.875rem',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.9375rem',
              cursor: 'pointer',
              border: '1.5px solid var(--color-border)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
               e.currentTarget.style.borderColor = 'var(--color-text-dark)';
            }}
            onMouseLeave={e => {
               e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            <Mail size={18} /> {t('auth.haveSession')}
          </button>
        </div>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#8898aa' }}>
          {t('auth.terms')}
        </p>

      </div>

      {/* Required keyframes for modal open animation since index.css doesn't have slideUp yet */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
