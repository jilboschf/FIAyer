import React, { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../lib/toast.jsx';

// Removing hardcoded PLANS array from global scope
// It will be generated inside the component so it has access to `t()`

export default function PricingModal({ isOpen, onClose, onPurchase }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleStripeCheckout = async (plan) => {
    setLoadingPlan(plan.id);
    try {
      // Ensure the request includes the Supabase JWT (so backend can link purchase to userId)
      const { supabase } = await import('../lib/supabaseClient');
      const { data } = await supabase.auth.getSession();
      const accessToken = data?.session?.access_token;
      if (!accessToken) {
        toast.warning(t('pricing.mustLoginFirst'));
        setLoadingPlan(null);
        return;
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          planId: plan.id
        }),
      });

      if (!response.ok) throw new Error('Failed to create checkout session');

      const { url } = await response.json();
      window.location.href = url; // Redirect to Stripe
    } catch (err) {
      console.error(err);
      toast.error(t('pricing.stripeError'));
      setLoadingPlan(null);
    }
  };

  const PLANS = [
    {
      id: 'free',
      name: t('pricing.free.name'),
      price: `0${t('pricing.currency')}`,
      freq: '',
      desc: t('pricing.free.desc'),
      features: [t('pricing.free.feat1'), t('pricing.free.feat2'), t('pricing.free.feat3'), t('pricing.free.feat4')],
      buttonText: t('pricing.free.btn'),
      disabled: true,
    },
    {
      id: 'pack',
      name: t('pricing.pack.name'),
      price: `5${t('pricing.currency')}`,
      freq: t('pricing.pack.freq'),
      desc: t('pricing.pack.desc'),
      features: [t('pricing.pack.feat1'), t('pricing.pack.feat2'), t('pricing.pack.feat3'), t('pricing.pack.feat4')],
      buttonText: t('pricing.pack.btn'),
      popular: false,
    },
    {
      id: 'pro',
      name: t('pricing.pro.name'),
      price: `15${t('pricing.currency')}`,
      freq: t('pricing.pro.freq'),
      desc: t('pricing.pro.desc'),
      features: [t('pricing.pro.feat1'), t('pricing.pro.feat2'), t('pricing.pro.feat3'), t('pricing.pro.feat4')],
      buttonText: t('pricing.pro.btn'),
      popular: true,
    },
    {
      id: 'premium',
      name: t('pricing.premium.name'),
      price: `35${t('pricing.currency')}`,
      freq: t('pricing.premium.freq'),
      desc: t('pricing.premium.desc'),
      features: [t('pricing.premium.feat1'), t('pricing.premium.feat2'), t('pricing.premium.feat3'), t('pricing.premium.feat4')],
      buttonText: t('pricing.premium.btn'),
      popular: false,
    }
  ];

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(6, 26, 18, 0.6)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '2rem',
      animation: 'fadeIn 0.2s ease-out',
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: 'var(--color-bg-cream)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '1100px',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(0,0,0,0.05)',
            border: 'none',
            color: 'var(--color-text-dark)',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', padding: '3.5rem 2rem 2rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text-dark)', marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
            {t('pricing.title')}
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-body)', maxWidth: '500px', margin: '0 auto' }}>
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '1.5rem',
          padding: '0 2.5rem 3.5rem'
        }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{
              backgroundColor: '#fff',
              border: `2px solid ${plan.popular ? 'var(--color-primary)' : 'var(--color-border)'}`,
              borderRadius: '20px',
              padding: '2rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              boxShadow: plan.popular ? '0 15px 30px -10px rgba(62,134,193,0.3)' : '0 4px 6px -1px rgba(0,0,0,0.05)',
              transform: plan.popular ? 'scale(1.03)' : 'scale(1)',
              zIndex: plan.popular ? 2 : 1
            }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-14px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {t('pricing.popular')}
                </div>
              )}
              
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-dark)', marginBottom: '0.25rem' }}>
                {plan.name}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-body)', marginBottom: '1.5rem', minHeight: '40px' }}>
                {plan.desc}
              </p>
              
              <div style={{ marginBottom: '2rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text-dark)', letterSpacing: '-0.04em' }}>{plan.price}</span>
                <span style={{ fontSize: '1rem', color: 'var(--color-text-body)', fontWeight: 500 }}>{plan.freq}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, marginBottom: '2.5rem' }}>
                {plan.features.map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ 
                      backgroundColor: plan.popular ? 'rgba(62,134,193,0.1)' : 'var(--color-bg-cream)', 
                      borderRadius: '50%', 
                      padding: '2px',
                      color: plan.popular ? 'var(--color-primary)' : 'var(--color-text-dark)'
                    }}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-dark)' }}>
                      {feat}
                    </span>
                  </div>
                ))}
              </div>

              <button
                disabled={plan.disabled || (loadingPlan !== null)}
                onClick={() => handleStripeCheckout(plan)}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '12px',
                  border: plan.disabled ? '1px solid var(--color-border)' : 'none',
                  backgroundColor: plan.disabled ? 'transparent' : (plan.popular ? 'var(--color-primary)' : 'var(--color-text-dark)'),
                  color: plan.disabled ? 'var(--color-text-body)' : '#fff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: (plan.disabled || loadingPlan) ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s',
                  boxShadow: (!plan.disabled) ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={e => { if (!plan.disabled && !loadingPlan) e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={e => { if (!plan.disabled && !loadingPlan) e.currentTarget.style.opacity = '1'; }}
              >
                {loadingPlan === plan.id ? <Loader2 className="animate-spin" size={18} /> : plan.buttonText}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
