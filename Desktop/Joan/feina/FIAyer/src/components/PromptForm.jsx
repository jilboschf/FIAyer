import React, { useState, useEffect } from 'react';
import { Sparkles, Palette, Users, LayoutTemplate } from 'lucide-react';
import TemplateSelector, { TEMPLATES } from './TemplateSelector';

const OPTIONS_STYLE = [
  { value: 'modern',    label: 'Moderno y limpio' },
  { value: 'elegant',   label: 'Elegante (Premium)' },
  { value: 'creative',  label: 'Creativo y llamativo' },
  { value: 'corporate', label: 'Corporativo / B2B' },
];

const OPTIONS_AUDIENCE = [
  { value: 'general',   label: 'Público general' },
  { value: 'students',  label: 'Estudiantes / Universitarios' },
  { value: 'companies', label: 'Empresas / Pymes' },
];

const OPTIONS_COLOR = [
  { value: 'auto',    label: 'Automático (IA decide)' },
  { value: 'brand',   label: 'Corporativo FIAyer' },
  { value: 'vibrant', label: 'Vibrante y energético' },
  { value: 'pastel',  label: 'Tonos pastel / suaves' },
];

function SelectRow({ label, icon: Icon, value, onChange, options, disabled }) {
  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Icon size={14} color="var(--color-primary)" strokeWidth={2.5} />
        {label}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export default function PromptForm({ onSubmit, isLoading, initialData }) {
  const [selectedTemplate, setSelectedTemplate] = useState(initialData?.templateId || 'custom');
  const [prompt, setPrompt] = useState(initialData?.prompt || '');
  const [style, setStyle] = useState(initialData?.style || 'modern');
  const [audience, setAudience] = useState(initialData?.audience || 'general');
  const [colorTheme, setColorTheme] = useState(initialData?.colorTheme || 'auto');

  // Auto-fill form when a template is selected
  const handleTemplateSelect = (id) => {
    setSelectedTemplate(id);
    const tpl = TEMPLATES.find(t => t.id === id);
    if (tpl?.preset) {
      setPrompt(tpl.preset.prompt);
      setStyle(tpl.preset.style);
      setAudience(tpl.preset.audience);
      setColorTheme(tpl.preset.colorTheme);
    } else {
      // Custom — clear form
      setPrompt('');
      setStyle('modern');
      setAudience('general');
      setColorTheme('auto');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit({ prompt, style, audience, colorTheme, templateId: selectedTemplate });
  };

  const canSubmit = prompt.trim() && !isLoading;

  return (
    <div style={{
      backgroundColor: 'var(--color-bg-main)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-card)',
      padding: '2.25rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      border: '1px solid var(--color-border)'
    }}>
      {/* Section header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <span className="script-label">FIAyer, tu diseñador IA</span>
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: 'var(--color-text-dark)',
          lineHeight: 1.15,
          marginBottom: '0.4rem'
        }}>
          Crea tu Flyer con IA
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-body)' }}>
          Elige una plantilla o describe tu idea y obtén un diseño listo para imprimir.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>

        {/* Template selector */}
        <TemplateSelector selectedId={selectedTemplate} onSelect={handleTemplateSelect} />

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

        {/* Main prompt */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={14} color="var(--color-primary)" strokeWidth={2.5} />
            Describe tu idea
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: Oferta especial en impresión de tesis y proyectos universitarios. Descuento del 20% presentando el carnet..."
            rows={4}
            disabled={isLoading}
            required
          />
        </div>

        {/* Options grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <SelectRow
            label="Estilo visual"
            icon={LayoutTemplate}
            value={style}
            onChange={setStyle}
            options={OPTIONS_STYLE}
            disabled={isLoading}
          />
          <SelectRow
            label="Público objetivo"
            icon={Users}
            value={audience}
            onChange={setAudience}
            options={OPTIONS_AUDIENCE}
            disabled={isLoading}
          />
        </div>
        <SelectRow
          label="Paleta de colores"
          icon={Palette}
          value={colorTheme}
          onChange={setColorTheme}
          options={OPTIONS_COLOR}
          disabled={isLoading}
        />

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0.25rem 0' }} />

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            backgroundColor: canSubmit ? 'var(--color-primary)' : '#B0C8DE',
            color: '#fff',
            padding: '0.875rem 2rem',
            borderRadius: 'var(--radius-btn)',
            fontWeight: 700,
            fontSize: '0.9375rem',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            boxShadow: canSubmit ? 'var(--shadow-btn)' : 'none',
            transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
            width: '100%'
          }}
        >
          {isLoading ? (
            <>
              <span className="anim-spin" style={{ display: 'flex' }}>
                <Sparkles size={17} strokeWidth={2.5} />
              </span>
              Generando diseño…
            </>
          ) : (
            <>
              <Sparkles size={17} strokeWidth={2.5} />
              Generar Flyer con IA
            </>
          )}
        </button>
      </form>
    </div>
  );
}
