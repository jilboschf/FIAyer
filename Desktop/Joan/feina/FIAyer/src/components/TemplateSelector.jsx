import React from 'react';
import {
  GraduationCap,
  Megaphone,
  CreditCard,
  Layout,
  BookOpen,
  Printer
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

/* ─── Template metadata that is NOT translatable ──────────────────────
   Only icons, ids, colors and non-text preset values live here.
   Labels, descriptions and seed prompts come from i18n at render-time. */
const TEMPLATE_META = [
  {
    id: 'tesis',
    icon: GraduationCap,
    color: '#3E86C1',
    preset: { style: 'modern',    audience: 'students',  colorTheme: 'brand'   },
  },
  {
    id: 'flyer_univ',
    icon: Megaphone,
    color: '#E84C3D',
    preset: { style: 'creative',  audience: 'students',  colorTheme: 'vibrant' },
  },
  {
    id: 'tarjetas',
    icon: CreditCard,
    color: '#1F2937',
    preset: { style: 'corporate', audience: 'companies', colorTheme: 'brand'   },
  },
  {
    id: 'cartel_a3',
    icon: Layout,
    color: '#7C3AED',
    preset: { style: 'creative',  audience: 'general',   colorTheme: 'vibrant' },
  },
  {
    id: 'diptico',
    icon: BookOpen,
    color: '#059669',
    preset: { style: 'elegant',   audience: 'companies', colorTheme: 'pastel'  },
  },
  {
    id: 'custom',
    icon: Printer,
    color: '#6B7280',
    preset: null, // custom has no seed prompt
  },
];

/* ─── Hook: returns templates with translated strings ─── */
export function useTemplates() {
  const { t } = useTranslation();
  return TEMPLATE_META.map((m) => ({
    ...m,
    label: t(`templates.${m.id}.label`),
    description: t(`templates.${m.id}.description`),
    preset: m.preset
      ? { ...m.preset, prompt: t(`templates.${m.id}.prompt`) }
      : null,
  }));
}

export default function TemplateSelector({ selectedId, onSelect }) {
  const { t } = useTranslation();
  const templates = useTemplates();

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <label style={{ marginBottom: '0.75rem' }}>{t('templates.selectorLabel')}</label>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.625rem',
      }}>
        {templates.map(({ id, icon: Icon, label, description, color }) => {
          const isActive = selectedId === id;
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              type="button"
              title={description}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.75rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: isActive
                  ? `2px solid ${color}`
                  : '1.5px solid var(--color-border)',
                backgroundColor: isActive ? `${color}12` : 'var(--color-bg-main)',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                textAlign: 'center',
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.borderColor = color;
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              <span style={{
                backgroundColor: isActive ? color : 'var(--color-bg-cream)',
                color: isActive ? '#fff' : color,
                borderRadius: 'var(--radius-btn)',
                padding: '0.35rem',
                display: 'flex',
                transition: 'all 0.18s ease',
              }}>
                <Icon size={16} strokeWidth={2.2} />
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? color : 'var(--color-text-dark)',
                lineHeight: 1.2,
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
