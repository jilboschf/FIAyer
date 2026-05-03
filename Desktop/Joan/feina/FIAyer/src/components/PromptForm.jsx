import React, { useMemo, useState } from 'react';
import { Sparkles, Palette, Users, LayoutTemplate } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TemplateSelector, { useTemplates } from './TemplateSelector';

/* ─── Option value lists (labels come from i18n) ─── */
const STYLE_VALUES_BASE    = ['modern', 'creative', 'corporate'];
const STYLE_VALUES_PREMIUM = ['elegant', 'luxury', 'minimal', 'bold'];
const AUDIENCE_VALUES      = ['general', 'students', 'companies'];
const COLOR_VALUES         = ['auto', 'brand', 'vibrant', 'pastel'];

function SelectRow({ label, icon: Icon, value, onChange, options, disabled }) {
  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Icon size={14} color="var(--color-primary)" strokeWidth={2.5} />
        {label}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        {options.map(o => (
          <option key={o.value} value={o.value} disabled={Boolean(o.disabled)}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function PromptForm({ onSubmit, isLoading, initialData, plan = 'free' }) {
  const { t } = useTranslation();
  const templates = useTemplates();

  const [selectedTemplate, setSelectedTemplate] = useState(initialData?.templateId || 'custom');
  const [prompt, setPrompt] = useState(initialData?.prompt || '');
  const [style, setStyle] = useState(initialData?.style || 'modern');
  const [audience, setAudience] = useState(initialData?.audience || 'general');
  const [colorTheme, setColorTheme] = useState(initialData?.colorTheme || 'auto');
  const [brief, setBrief] = useState('');

  /* Build translated option lists. Premium styles stay visible but
     disabled for non-premium users, so they can see the upsell. */
  const styleOptions = useMemo(() => {
    const base    = STYLE_VALUES_BASE.map(v => ({ value: v, label: t(`options.style.${v}`) }));
    const premium = STYLE_VALUES_PREMIUM.map(v => ({
      value: v,
      label: t(`options.style.${v}`),
      disabled: plan !== 'premium',
    }));
    return [...base, ...premium];
  }, [plan, t]);

  const audienceOptions = useMemo(
    () => AUDIENCE_VALUES.map(v => ({ value: v, label: t(`options.audience.${v}`) })),
    [t]
  );

  const colorOptions = useMemo(
    () => COLOR_VALUES.map(v => ({ value: v, label: t(`options.color.${v}`) })),
    [t]
  );

  // Auto-fill form when a template is selected
  const handleTemplateSelect = (id) => {
    setSelectedTemplate(id);
    const tpl = templates.find(x => x.id === id);
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
    onSubmit({
      prompt,
      style,
      audience,
      colorTheme,
      templateId: selectedTemplate,
      brief: plan === 'premium' ? brief : '',
    });
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
        <span className="script-label">{t('form.eyebrow')}</span>
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: 'var(--color-text-dark)',
          lineHeight: 1.15,
          marginBottom: '0.4rem'
        }}>
          {t('form.title')}
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-body)' }}>
          {t('form.subtitle')}
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
            {t('form.ideaLabel')}
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('form.ideaPlaceholder')}
            rows={4}
            disabled={isLoading}
            required
          />
        </div>

        {/* Premium brief */}
        {plan === 'premium' && (
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={14} color="var(--color-primary)" strokeWidth={2.5} />
              {t('form.briefLabel')}
            </label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder={t('form.briefPlaceholder')}
              rows={3}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Options grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <SelectRow
            label={t('form.styleLabel')}
            icon={LayoutTemplate}
            value={style}
            onChange={setStyle}
            options={styleOptions}
            disabled={isLoading}
          />
          <SelectRow
            label={t('form.audienceLabel')}
            icon={Users}
            value={audience}
            onChange={setAudience}
            options={audienceOptions}
            disabled={isLoading}
          />
        </div>
        <SelectRow
          label={t('form.colorLabel')}
          icon={Palette}
          value={colorTheme}
          onChange={setColorTheme}
          options={colorOptions}
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
              {t('form.submittingBtn')}
            </>
          ) : (
            <>
              <Sparkles size={17} strokeWidth={2.5} />
              {t('form.submitBtn')}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
