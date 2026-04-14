import React from 'react';
import { Mail, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AuthModal({ isOpen, onClose, onLogin }) {
  const { t } = useTranslation();

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
          <button
            onClick={() => onLogin('apple')}
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
              cursor: 'pointer',
              border: '1px solid #000000',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
             {t('auth.apple')}
          </button>
          
          <button
            onClick={() => onLogin('google')}
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
              cursor: 'pointer',
              border: '1px solid #dadce0',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            G {t('auth.google')}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-body)', padding: '0 1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>o</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
          </div>

          <button
            onClick={() => onLogin('email')}
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
            <Mail size={18} /> {t('auth.email')}
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
