import React from 'react';
import { Layers, CreditCard, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Header({ isLoggedIn, credits, onLoginClick, onLogout, onOpenPricing }) {
  const { t, i18n } = useTranslation();
  
  const toggleLanguage = () => {
    const langs = ['ca', 'es', 'en'];
    const nextLang = langs[(langs.indexOf(i18n.language.split('-')[0]) + 1) % langs.length] || 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <header className="todoflyer-header" style={{
      backgroundColor: 'var(--color-bg-main)',
      borderBottom: '1px solid var(--color-border)',
      padding: '1rem 2.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 20,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <div style={{
          backgroundColor: 'var(--color-primary)',
          color: '#fff',
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-btn)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Layers size={18} strokeWidth={2.5} />
        </div>
        <span translate="no" className="notranslate" style={{
          fontFamily: 'var(--font-main)',
          fontWeight: 800,
          fontSize: '1.25rem',
          letterSpacing: '-0.03em'
        }}>
          <span style={{ color: 'var(--color-text-dark)' }}>F</span><span style={{ color: 'var(--color-primary)' }}>IA</span><span style={{ color: 'var(--color-text-dark)' }}>yer</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="todoflyer-header-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        
        <button 
          onClick={toggleLanguage}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: 'none', border: '1px solid var(--color-border)', cursor: 'pointer',
            color: 'var(--color-text-body)', padding: '0.4rem 0.75rem', borderRadius: '50px',
            fontWeight: 600, fontSize: '0.8125rem', letterSpacing: '0.05em', textTransform: 'uppercase'
          }}
        >
          <Globe size={14} /> {i18n.language.split('-')[0] || t('header.lang')}
        </button>

        <button className="todoflyer-header-help" style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--color-text-body)',
          fontWeight: 500,
          fontSize: '0.875rem',
          letterSpacing: '0.01em'
        }}>
          {t('header.help')}
        </button>

        {isLoggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginLeft: '0.5rem' }}>
            
            <button 
              onClick={onOpenPricing}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(62,134,193,0.1)', border: '1px solid rgba(62,134,193,0.2)',
                padding: '0.4rem 0.875rem', borderRadius: '50px',
                color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.8125rem',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(62,134,193,0.15)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(62,134,193,0.1)'}
            >
              <CreditCard size={15} strokeWidth={2.5} />
              {credits} {t('header.credits')}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button 
                onClick={onLogout}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-body)',
                fontWeight: 600,
                fontSize: '0.8125rem',
                textDecoration: 'underline'
              }}
            >
              {t('header.logout')}
            </button>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: 'var(--shadow-btn)'
            }}>
              M
            </div>
            </div>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="todoflyer-header-login"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              padding: '0.625rem 1.375rem',
              borderRadius: 'var(--radius-btn)',
              fontWeight: 600,
              fontSize: '0.875rem',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              boxShadow: 'var(--shadow-btn)',
              border: 'none',
              cursor: 'pointer',
              marginLeft: '0.5rem'
            }}
          >
            {t('header.login')}
          </button>
        )}
      </nav>
    </header>
  );
}
