import React from 'react';
import { Loader2, Type, Layout, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LoadingState() {
  const { t } = useTranslation();

  const steps = [
    { icon: Type,    text: t('loading.step1') },
    { icon: Layout,  text: t('loading.step2') },
    { icon: Palette, text: t('loading.step3') },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '480px',
      height: '100%',
      backgroundColor: 'var(--color-bg-main)',
      borderRadius: 'var(--radius-card)',
      border: '1px solid var(--color-border)',
      padding: '3rem 2rem',
      boxShadow: 'var(--shadow-card)',
      textAlign: 'center'
    }}>
      {/* Spinner */}
      <div className="anim-spin" style={{ color: 'var(--color-primary)', marginBottom: '2rem', display: 'flex' }}>
        <Loader2 size={48} strokeWidth={2} />
      </div>

      <span className="script-label" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
        {t('loading.eyebrow')}
      </span>
      <h3 style={{
        fontSize: '1.375rem',
        fontWeight: 700,
        color: 'var(--color-text-dark)',
        marginBottom: '2.5rem',
        letterSpacing: '-0.02em'
      }}>
        {t('loading.title')}
      </h3>

      {/* Steps */}
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
        {steps.map(({ icon: Icon, text }, i) => (
          <li
            key={i}
            className={`anim-shimmer`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--color-text-body)',
              fontSize: '0.9375rem',
              fontWeight: 500,
              animationDelay: `${i * 0.5}s`
            }}
          >
            <span style={{
              backgroundColor: 'var(--color-bg-cream)',
              borderRadius: 'var(--radius-btn)',
              padding: '0.4rem',
              display: 'flex',
              color: 'var(--color-primary)'
            }}>
              <Icon size={16} strokeWidth={2.5} />
            </span>
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}
