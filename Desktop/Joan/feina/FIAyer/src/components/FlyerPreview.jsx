import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Printer, FileImage, FileText, Pencil, Check, Plus, Trash2, Upload, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../lib/toast.jsx';

/* ─── Color themes ─── */
const themeMap = {
  auto:    { bg: '#3E86C1', accent: '#ffffff', text: '#ffffff', bodyBg: '#F7F0EB' },
  brand:   { bg: '#3E86C1', accent: '#ffffff', text: '#ffffff', bodyBg: '#F7F0EB' },
  vibrant: { bg: '#E84C3D', accent: '#FFCA2C', text: '#ffffff', bodyBg: '#FFF9F0' },
  pastel:  { bg: '#7EC8C8', accent: '#F4A261', text: '#061A12', bodyBg: '#F0FAF9' },
};

const styleFont = {
  modern:    { heading: 800, sub: 400, family: 'Outfit, sans-serif' },
  elegant:   { heading: 700, sub: 300, family: '"Covered By Your Grace", cursive' },
  creative:  { heading: 800, sub: 500, family: 'Outfit, sans-serif' },
  corporate: { heading: 700, sub: 400, family: 'Outfit, sans-serif' },
  luxury:    { heading: 800, sub: 400, family: 'Outfit, sans-serif' },
  minimal:   { heading: 700, sub: 400, family: 'Outfit, sans-serif' },
  bold:      { heading: 900, sub: 500, family: 'Outfit, sans-serif' },
};

/* ─── Editable text field ─── */
function EditableText({ value, onChange, tag: Tag = 'p', style: extraStyle = {}, editMode, placeholder }) {
  if (!editMode) {
    return <Tag style={extraStyle}>{value}</Tag>;
  }
  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange(e.currentTarget.textContent)}
      style={{
        ...extraStyle,
        outline: 'none',
        borderBottom: '1.5px dashed rgba(255,255,255,0.6)',
        cursor: 'text',
        minWidth: '40px',
        display: 'block',
      }}
    >
      {value}
    </Tag>
  );
}

/* ─── Empty state ─── */
function EmptyState() {
  const { t } = useTranslation();
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '480px',
      height: '100%',
      backgroundColor: 'var(--color-bg-cream)',
      borderRadius: 'var(--radius-card)',
      border: '2px dashed var(--color-border)',
      padding: '3rem',
      textAlign: 'center'
    }}>
      <Printer size={52} color="var(--color-border)" strokeWidth={1.5} style={{ marginBottom: '1.25rem' }} />
      <span className="script-label" style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{t('preview.emptyTitle')}</span>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-dark)', marginBottom: '0.6rem' }}>
        {t('preview.emptyTitle')}
      </h3>
      <p style={{ fontSize: '0.875rem', maxWidth: '260px', color: 'var(--color-text-body)' }}>
        {t('preview.emptyDesc')}
      </p>
    </div>
  );
}

/* ─── Main component ─── */
export default function FlyerPreview({ data, isAuthenticated, hasPaid, credits, plan, onRequireAuth, onRequirePricing, onCreditsUpdated }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const flyerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [editMode, setEditMode] = useState(false);
  const [uploadedLogo, setUploadedLogo] = useState(null);

  // Local editable copy of generated content
  const [content, setContent] = useState(null);

  // Sync content when new data arrives (new generation)
  useEffect(() => {
    if (data?.generated) {
      setContent({ ...data.generated });
      setEditMode(false);
    }
  }, [data]);

  // Cleanup uploaded logo URL — must be before any early return (Rules of Hooks)
  useEffect(() => {
    return () => {
      if (uploadedLogo) URL.revokeObjectURL(uploadedLogo);
    };
  }, [uploadedLogo]);

  if (!data || !content) return <EmptyState />;

  const theme  = themeMap[data.colorTheme] ?? themeMap.auto;
  const font   = styleFont[data.style] ?? styleFont.modern;
  const isElegant = data.style === 'elegant';

  const handleDownload = async (format) => {
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }

    // Freemium: only JPG export
    if (plan === 'free' && format !== 'jpg') {
      onRequirePricing();
      return;
    }

    // Consume credit server-side (premium does not consume)
    try {
      const { supabase } = await import('../lib/supabaseClient'); // ← ruta corregida
      const { data } = await supabase.auth.getSession();
      const accessToken = data?.session?.access_token;
      if (!accessToken) {
        onRequireAuth();
        return;
      }

      const resp = await fetch('/api/consume-credit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (resp.status === 402) {
        onRequirePricing();
        return;
      }
      if (!resp.ok) {
        toast.error(t('preview.errValidate'));
        return;
      }
      const next = await resp.json();
      onCreditsUpdated?.(next);
    } catch (e) {
      console.error(e);
      toast.error(t('preview.errConn'));
      return;
    }

    // Prepare for capture: temporary hide shadows and rounding for a clean print result
    const el = flyerRef.current;
    const originalShadow = el.style.boxShadow;
    const originalRadius = el.style.borderRadius;
    
    el.style.boxShadow = 'none';
    el.style.borderRadius = '0';

    try {
      const canvas = await html2canvas(el, { 
        scale: 4, // High resolution for print
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      if (format === 'jpg') {
        const link = document.createElement('a');
        link.download = `todoflyer-flyer-${Date.now()}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.82);
        link.click();
      } else if (format === 'png') {
        const link = document.createElement('a');
        link.download = `todoflyer-flyer-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      } else if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF({ 
          orientation: 'portrait', 
          unit: 'mm', 
          format: 'a4' 
        });
        
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        pdf.save(`todoflyer-flyer-${Date.now()}.pdf`);
      }
    } catch (err) {
      console.error("Export error:", err);
      toast.error(t('preview.errExport'));
    } finally {
      // Restore styles
      el.style.boxShadow = originalShadow;
      el.style.borderRadius = originalRadius;
    }
  };

  const updatePoint = (index, value) => {
    const newPoints = [...content.points];
    newPoints[index] = value;
    setContent(c => ({ ...c, points: newPoints }));
  };

  const addPoint = () => {
    setContent(c => ({ ...c, points: [...c.points, t('preview.defaultPoint')] }));
  };

  const removePoint = (index) => {
    setContent(c => ({ ...c, points: c.points.filter((_, i) => i !== index) }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedLogo(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    }
  };

  const triggerLogoUpload = () => {
    if (plan !== 'premium') {
      onRequirePricing();
      return;
    }
    fileInputRef.current.click();
  };

  return (
    <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%' }}>

      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.25rem',
        backgroundColor: 'var(--color-bg-main)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)'
      }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-dark)' }}>
          {t('preview.headerTitle')}
        </span>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleLogoUpload} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
          
          <button
            onClick={triggerLogoUpload}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-btn)',
              border: '1.5px solid var(--color-border)',
              backgroundColor: '#fff',
              color: 'var(--color-text-dark)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all 0.18s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            {plan === 'premium' ? <Upload size={14} /> : <Crown size={14} color="#D97706" />}
            {plan === 'premium' ? t('preview.addLogo') : t('preview.premiumLogo')}
          </button>

          <button
            onClick={() => setEditMode(e => !e)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-btn)',
              border: `1.5px solid ${editMode ? '#059669' : 'var(--color-primary)'}`,
              backgroundColor: editMode ? '#059669' : 'transparent',
              color: editMode ? '#fff' : 'var(--color-primary)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              letterSpacing: '0.02em',
              cursor: 'pointer',
              transition: 'all 0.18s ease'
            }}
          >
            {editMode
              ? <><Check size={14} strokeWidth={2.5} /> {t('preview.saveMode')}</>
              : <><Pencil size={14} strokeWidth={2.5} /> {t('preview.editMode')}</>
            }
          </button>
        </div>
      </div>

      {/* ── Edit mode hint ── */}
      {editMode && (
        <div style={{
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: 'var(--radius-sm)',
          padding: '0.6rem 1rem',
          fontSize: '0.8rem',
          color: '#1D4ED8',
          fontWeight: 500,
        }}>
          {t('preview.editHint')}
        </div>
      )}

      {/* ── Flyer Canvas ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg-cream)',
        borderRadius: 'var(--radius-card)',
        border: `2px solid ${editMode ? '#BFDBFE' : 'var(--color-border)'}`,
        padding: '1.5rem',
        overflow: 'auto',
        transition: 'border-color 0.2s'
      }}>
        <div
          ref={flyerRef}
          style={{
            width: '100%',
            maxWidth: '440px',
            aspectRatio: '1 / 1.414',
            backgroundColor: '#ffffff',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Outfit, sans-serif',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            borderRadius: '8px',
            position: 'relative'
          }}
        >
          {/* ── Watermark ── */}
          {(plan === 'free' || (plan === 'pack' && (credits ?? 0) <= 0)) && (
            <div style={{
              position: 'absolute',
              top: 0,
              right: '30px',
              bottom: 0,
              width: '40px',
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(2px)',
              borderLeft: '1px solid rgba(255,255,255,0.6)',
              borderRight: '1px solid rgba(255,255,255,0.6)',
              zIndex: 10,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <span style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                transform: 'rotate(180deg)',
                color: 'rgba(0,0,0,0.5)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                whiteSpace: 'nowrap',
                textTransform: 'uppercase'
              }}>
                {t('preview.watermark')} - {t('preview.watermark')} - {t('preview.watermark')}
              </span>
            </div>
          )}

          {/* ── Banner ── */}
          <div style={{
            backgroundColor: theme.bg,
            padding: isElegant ? '2.5rem 2rem 2rem' : '3rem 2.25rem 2.5rem',
            color: theme.text,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            {/* Logo placeholder / Uploaded logo */}
            {uploadedLogo && (
              <div style={{
                position: 'absolute',
                top: '1.5rem',
                right: '2rem',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 5
              }}>
                <img 
                  src={uploadedLogo} 
                  alt="Logo" 
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                />
              </div>
            )}
            {/* Script accent */}
            <span style={{
              fontFamily: '"Covered By Your Grace", cursive',
              fontSize: '1.1rem',
              color: theme.accent,
              opacity: 0.9,
              display: 'block',
              marginBottom: '0.5rem'
            }}>
              {t('preview.scriptAccent')}
            </span>

            {/* Headline */}
            <EditableText
              tag="h1"
              value={content.title}
              onChange={(v) => setContent(c => ({ ...c, title: v }))}
              editMode={editMode}
              style={{
                fontFamily: font.family,
                fontSize: isElegant ? '2.1rem' : '2.4rem',
                fontWeight: font.heading,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                marginBottom: '0.875rem',
                color: theme.text
              }}
            />

            {/* Subtitle */}
            <EditableText
              tag="p"
              value={content.subtitle}
              onChange={(v) => setContent(c => ({ ...c, subtitle: v }))}
              editMode={editMode}
              style={{
                fontSize: '1rem',
                fontWeight: font.sub,
                opacity: 0.88,
                lineHeight: 1.5,
                color: theme.text
              }}
            />
          </div>

          {/* ── Body ── */}
          <div style={{
            flex: 1,
            backgroundColor: theme.bodyBg,
            padding: '2rem 2.25rem',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Bullet points */}
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: 'auto' }}>
              {content.points.map((pt, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{
                    backgroundColor: theme.bg,
                    color: '#fff',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: '1px'
                  }}>✓</span>

                  {editMode ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => updatePoint(i, e.currentTarget.textContent)}
                        style={{
                          flex: 1,
                          fontSize: '0.925rem',
                          fontWeight: 400,
                          color: '#061A12',
                          lineHeight: 1.5,
                          outline: 'none',
                          borderBottom: '1.5px dashed var(--color-primary)',
                          cursor: 'text',
                          display: 'block'
                        }}
                      >
                        {pt}
                      </span>
                      <button
                        onClick={() => removePoint(i)}
                        style={{
                          color: '#E84C3D',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.1rem',
                          flexShrink: 0
                        }}
                      >
                        <Trash2 size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <span style={{
                      fontSize: '0.925rem',
                      fontWeight: 400,
                      color: '#061A12',
                      lineHeight: 1.5
                    }}>
                      {pt}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {/* Add bullet button in edit mode */}
            {editMode && (
              <button
                onClick={addPoint}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--color-primary)',
                  background: 'none',
                  border: '1.5px dashed var(--color-primary)',
                  borderRadius: 'var(--radius-btn)',
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  margin: '0.75rem 0',
                  alignSelf: 'flex-start'
                }}
              >
                <Plus size={13} strokeWidth={2.5} /> {t('preview.addPoint')}
              </button>
            )}

            {/* CTA block */}
            <div style={{
              marginTop: editMode ? '0.5rem' : '1.75rem',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '1.5rem',
              textAlign: 'center',
              border: `2px solid ${theme.bg}`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
            }}>
              <EditableText
                tag="h2"
                value={content.cta}
                onChange={(v) => setContent(c => ({ ...c, cta: v }))}
                editMode={editMode}
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: theme.bg,
                  letterSpacing: '-0.02em',
                  marginBottom: '0.3rem'
                }}
              />
              <p style={{ fontSize: '0.8rem', color: '#4D5155', fontWeight: 400 }}>
                {t('preview.trustTag')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Export Controls ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: plan === 'free' ? '1fr' : '1fr 1fr 1fr',
        gap: '1rem',
        padding: '1.25rem',
        backgroundColor: 'var(--color-bg-main)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)'
      }}>
        <button
          onClick={() => handleDownload('jpg')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem', padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-bg-cream)',
            color: 'var(--color-text-dark)',
            borderRadius: 'var(--radius-btn)',
            fontWeight: 700, fontSize: '0.875rem',
            border: '1.5px solid var(--color-border)',
            cursor: 'pointer', transition: 'background-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#efe6e0'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-cream)'}
        >
          <FileImage size={16} strokeWidth={2.5} /> {t('preview.downJpg')}
        </button>

        {plan !== 'free' && (
        <button
          onClick={() => handleDownload('png')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem', padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-bg-cream)',
            color: 'var(--color-primary)',
            borderRadius: 'var(--radius-btn)',
            fontWeight: 600, fontSize: '0.875rem',
            border: '1.5px solid var(--color-primary)',
            cursor: 'pointer', transition: 'background-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dceaf5'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-cream)'}
        >
          <FileImage size={16} strokeWidth={2.5} /> {t('preview.downPng')}
        </button>
        )}

        {plan !== 'free' && (
        <button
          onClick={() => handleDownload('pdf')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem', padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-primary)', color: '#ffffff',
            borderRadius: 'var(--radius-btn)',
            fontWeight: 700, fontSize: '0.875rem',
            letterSpacing: '0.03em', textTransform: 'uppercase',
            cursor: 'pointer', boxShadow: 'var(--shadow-btn)',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
        >
          <FileText size={16} strokeWidth={2.5} /> {t('preview.downPdf')}
        </button>
        )}
      </div>
    </div>
  );
}