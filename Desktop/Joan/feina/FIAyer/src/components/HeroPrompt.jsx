import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useTemplates } from './TemplateSelector';
import { useTranslation } from 'react-i18next';

export default function HeroPrompt({ onGo }) {
  const { t } = useTranslation();
  const templates = useTemplates();
  const [prompt, setPrompt] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onGo({ prompt, templateId: 'custom' });
  };

  const handleTemplateClick = (tpl) => {
    // Pass the full template setup
    onGo({ 
      prompt: tpl.preset ? tpl.preset.prompt : '', 
      templateId: tpl.id,
      style: tpl.preset?.style,
      audience: tpl.preset?.audience,
      colorTheme: tpl.preset?.colorTheme,
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 160px)', 
      padding: '4rem 2rem',
      backgroundColor: 'var(--color-bg-cream)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '800px',
        height: '400px',
        background: 'linear-gradient(180deg, rgba(62,134,193,0.06) 0%, rgba(247,240,235,0) 100%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{ maxWidth: '800px', width: '100%', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        
        <span className="script-label" style={{ fontSize: '1.75rem', marginBottom: '1rem', display: 'block' }}>
          {t('hero.inputPlaceholder')}
        </span>
        
        <h1 
          style={{
            fontFamily: 'var(--font-main)',
            fontSize: '3.5rem',
            fontWeight: 800,
            color: 'var(--color-text-dark)',
            lineHeight: 1.1,
            letterSpacing: '-0.04em',
            marginBottom: '2.5rem'
          }}
          dangerouslySetInnerHTML={{ __html: t('hero.title').replace('segons', '<span style="color: var(--color-primary)">segons</span>').replace('segundos', '<span style="color: var(--color-primary)">segundos</span>').replace('seconds', '<span style="color: var(--color-primary)">seconds</span>') }}
        />

        <form 
          onSubmit={handleSubmit}
          style={{
            position: 'relative',
            maxWidth: '680px',
            margin: '0 auto',
            marginBottom: '3rem',
            transform: focused ? 'scale(1.02)' : 'scale(1)',
            transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          <div style={{
            position: 'relative',
            backgroundColor: 'var(--color-bg-main)',
            borderRadius: '24px',
            boxShadow: focused
              ? '0 20px 40px rgba(62, 134, 193, 0.15)'
              : '0 10px 30px rgba(0, 0, 0, 0.08)',
            border: `2px solid ${focused ? 'var(--color-primary)' : 'rgba(62,134,193,0.25)'}`,
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ padding: '0 1.25rem', color: 'var(--color-primary)' }}>
              <Sparkles size={24} strokeWidth={2} />
            </div>
            
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={t('hero.inputPlaceholder')}
              style={{
                border: 'none',
                boxShadow: 'none',
                padding: '1.25rem 0',
                fontSize: '1.125rem',
                backgroundColor: 'transparent',
                flex: 1,
                outline: 'none',
              }}
            />
            
            <button
              type="submit"
              disabled={!prompt.trim()}
              style={{
                backgroundColor: prompt.trim() ? 'var(--color-primary)' : '#B0C8DE',
                color: '#fff',
                padding: '1rem 1.5rem',
                borderRadius: '16px',
                fontWeight: 700,
                fontSize: '1rem',
                marginLeft: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: prompt.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
              }}
            >
              {t('hero.button')} <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </form>

        {/* Hint when input is empty */}
        {!prompt.trim() && (
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-body)', marginTop: '-1.5rem', marginBottom: '2rem', opacity: 0.8 }}>
            ↑ {t('hero.inputHint')}
          </p>
        )}

        {/* Template Shortcuts */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-body)', marginBottom: '1.25rem' }}>
            {t('hero.orTemplate')}
          </p>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.875rem'
          }}>
            {templates.map((tpl) => {
              if (tpl.id === 'custom') return null; // No need for "custom" shortcut here
              const Icon = tpl.icon;
              return (
                <button
                  key={tpl.id}
                  onClick={() => handleTemplateClick(tpl)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: 'var(--color-bg-main)',
                    border: '1px solid var(--color-border)',
                    padding: '0.6rem 1rem',
                    borderRadius: '50px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--color-text-dark)',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = tpl.color;
                    e.currentTarget.style.color = tpl.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.color = 'var(--color-text-dark)';
                  }}
                >
                  <Icon size={16} color={tpl.color} strokeWidth={2.5} />
                  {tpl.label}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
