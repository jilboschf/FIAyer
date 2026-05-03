import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

/**
 * Renders a legal page: "terms" | "privacy" | "cookies".
 * All content is driven by i18n so it stays in sync with the UI language.
 */
export default function Legal({ page = 'terms' }) {
  const { t } = useTranslation();

  const slug = ['terms', 'privacy', 'cookies'].includes(page) ? page : 'terms';
  const title = t(`legal.${slug}.title`);
  const intro = t(`legal.${slug}.intro`);
  const sections = t(`legal.${slug}.sections`, { returnObjects: true });
  const sectionList = Array.isArray(sections) ? sections : [];

  const goHome = (e) => {
    e?.preventDefault?.();
    // Clear the hash so the main app renders again.
    window.history.pushState({}, document.title, window.location.pathname + window.location.search);
    window.dispatchEvent(new Event('hashchange'));
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--color-bg-cream)'
    }}>
      {/* Slim top bar with back button */}
      <header style={{
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
        <a
          href="#"
          onClick={goHome}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--color-text-dark)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.875rem'
          }}
        >
          <ArrowLeft size={16} />
          {t('legal.backToApp')}
        </a>
        <span translate="no" className="notranslate" style={{
          fontWeight: 800,
          fontSize: '1.125rem',
          letterSpacing: '-0.03em'
        }}>
          <span style={{ color: 'var(--color-text-dark)' }}>F</span>
          <span style={{ color: 'var(--color-primary)' }}>IA</span>
          <span style={{ color: 'var(--color-text-dark)' }}>yer</span>
        </span>
      </header>

      <main style={{
        flex: 1,
        maxWidth: '820px',
        width: '100%',
        margin: '0 auto',
        padding: '3rem 1.5rem 4rem',
        color: 'var(--color-text-dark)'
      }}>
        <p style={{
          fontSize: '0.8rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-text-body)',
          marginBottom: '0.5rem',
          fontWeight: 600
        }}>
          {t('legal.lastUpdated')}
        </p>
        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          marginBottom: '1.25rem',
          lineHeight: 1.15
        }}>
          {title}
        </h1>
        <p style={{
          fontSize: '1rem',
          lineHeight: 1.6,
          color: 'var(--color-text-body)',
          marginBottom: '2.5rem'
        }}>
          {intro}
        </p>

        {sectionList.map((s, i) => (
          <section key={i} style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              marginBottom: '0.5rem',
              color: 'var(--color-text-dark)'
            }}>
              {s.title}
            </h2>
            <p style={{
              fontSize: '0.9375rem',
              lineHeight: 1.65,
              color: 'var(--color-text-body)',
              whiteSpace: 'pre-wrap'
            }}>
              {s.body}
            </p>
          </section>
        ))}

        <section style={{
          marginTop: '3rem',
          padding: '1.5rem',
          backgroundColor: 'var(--color-bg-main)',
          borderRadius: 'var(--radius-card, 14px)',
          border: '1px solid var(--color-border)'
        }}>
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-body)', marginBottom: '0.25rem' }}>
            {t('legal.contactIntro')}
          </p>
          <a
            href={`mailto:${t('legal.contactEmail')}`}
            style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1rem' }}
          >
            {t('legal.contactEmail')}
          </a>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-body)', marginTop: '0.75rem' }}>
            {t('legal.holder')}
          </p>
        </section>
      </main>
    </div>
  );
}
