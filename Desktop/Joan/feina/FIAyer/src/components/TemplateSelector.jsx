import React from 'react';
import {
  GraduationCap,
  Megaphone,
  CreditCard,
  Layout,
  BookOpen,
  Printer
} from 'lucide-react';

export const TEMPLATES = [
  {
    id: 'tesis',
    icon: GraduationCap,
    label: 'Tesis / TFG',
    description: 'Impresión y encuadernado de proyectos universitarios',
    color: '#3E86C1',
    preset: {
      prompt: 'Servicio de impresión y encuadernado de tesis, TFG y TFM. Papel de alta calidad, acabado profesional y entrega urgente en 24 horas.',
      style: 'modern',
      audience: 'students',
      colorTheme: 'brand',
    },
  },
  {
    id: 'flyer_univ',
    icon: Megaphone,
    label: 'Flyer Universitario',
    description: 'Descuentos y promociones para estudiantes',
    color: '#E84C3D',
    preset: {
      prompt: 'Oferta especial de fotocopias y impresión para universitarios. 30% de descuento presentando el carnet de estudiante válido.',
      style: 'creative',
      audience: 'students',
      colorTheme: 'vibrant',
    },
  },
  {
    id: 'tarjetas',
    icon: CreditCard,
    label: 'Tarjetas de Visita',
    description: 'Pack de tarjetas profesionales para empresas',
    color: '#1F2937',
    preset: {
      prompt: 'Impresión de tarjetas de visita profesionales para empresas. Pack de 500 unidades con diseño personalizado y papel premium 350gr.',
      style: 'corporate',
      audience: 'companies',
      colorTheme: 'brand',
    },
  },
  {
    id: 'cartel_a3',
    icon: Layout,
    label: 'Cartel A3',
    description: 'Carteles de gran formato para comercios y eventos',
    color: '#7C3AED',
    preset: {
      prompt: 'Impresión de carteles A3 en alta resolución para escaparates, eventos y locales comerciales. Papel satinado o mate.',
      style: 'creative',
      audience: 'general',
      colorTheme: 'vibrant',
    },
  },
  {
    id: 'diptico',
    icon: BookOpen,
    label: 'Díptico Informativo',
    description: 'Folletos plegables para empresas y servicios',
    color: '#059669',
    preset: {
      prompt: 'Impresión de dípticos y trípticos para presentación de servicios empresariales. Acabado plastificado, color real y gramaje premium.',
      style: 'elegant',
      audience: 'companies',
      colorTheme: 'pastel',
    },
  },
  {
    id: 'custom',
    icon: Printer,
    label: 'Personalizado',
    description: 'Empieza desde cero con tu propia idea',
    color: '#6B7280',
    preset: null,
  },
];

export default function TemplateSelector({ selectedId, onSelect }) {
  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <label style={{ marginBottom: '0.75rem' }}>Elige una plantilla</label>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.625rem',
      }}>
        {TEMPLATES.map(({ id, icon: Icon, label, description, color }) => {
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
