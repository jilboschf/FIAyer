import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'todoflyer_cookie_consent';

/**
 * Minimal GDPR cookie banner. Shows at the bottom until the user makes a choice.
 *
 * Consent is stored locally as one of:
 *   - "all"         → user accepted analytics + technical
 *   - "essentials"  → user only wants technical cookies
 *
 * Other parts of the app can read window.localStorage.getItem('todoflyer_cookie_consent')
 * before loading any optional analytics script.
 */
export default function CookieBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch (_) {
      // If storage is unavailable (private mode, etc.) we still show the banner
      // but we won't be able to remember the choice.
      setVisible(true);
    }

    // Allow other parts of the UI to reopen the banner by dispatching this event.
    const reopen = () => setVisible(true);
    window.addEventListener('todoflyer:reopen-cookie-banner', reopen);
    return () => window.removeEventListener('todoflyer:reopen-cookie-banner', reopen);
  }, []);

  const saveChoice = (choice) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch (_) { /* ignore */ }
    setVisible(false);
  };

  const openCookiesPage = (e) => {
    e?.preventDefault?.();
    window.location.hash = '#/legal/cookies';
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t('cookieBanner.title')}
      style={{
        position: 'fixed',
        left: '1rem',
        right: '1rem',
        bottom: '1rem',
        maxWidth: '640px',
        margin: '0 auto',
        backgroundColor: '#fff',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        boxShadow: '0 18px 40px -12px rgba(6, 26, 18, 0.25)',
        padding: '1.25rem 1.25rem',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}
    >
      <div>
        <p style={{
          fontWeight: 700,
          fontSize: '0.95rem',
          color: 'var(--color-text-dark)',
          marginBottom: '0.25rem'
        }}>
          {t('cookieBanner.title')}
        </p>
        <p style={{
          fontSize: '0.85rem',
          lineHeight: 1.55,
          color: 'var(--color-text-body)'
        }}>
          {t('cookieBanner.message')}{' '}
          <a
            href="#/legal/cookies"
            onClick={openCookiesPage}
            style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}
          >
            {t('cookieBanner.learnMore')}
          </a>
        </p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button
          onClick={() => saveChoice('essentials')}
          style={{
            background: 'transparent',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-dark)',
            padding: '0.55rem 1rem',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          {t('cookieBanner.essentials')}
        </button>
        <button
          onClick={() => saveChoice('all')}
          style={{
            background: 'var(--color-primary)',
            border: 'none',
            color: '#fff',
            padding: '0.55rem 1rem',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: '0 6px 14px -6px rgba(62,134,193,0.6)'
          }}
        >
          {t('cookieBanner.accept')}
        </button>
      </div>
    </div>
  );
}
