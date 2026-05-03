import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PromptForm from './components/PromptForm';
import LoadingState from './components/LoadingState';
import FlyerPreview from './components/FlyerPreview';
import HeroPrompt from './components/HeroPrompt';
import AuthModal from './components/AuthModal';
import PricingModal from './components/PricingModal';
import CookieBanner from './components/CookieBanner';
import Legal from './pages/Legal';
import { useTranslation } from 'react-i18next';
import { supabase } from "./lib/supabaseClient";
import { useToast } from "./lib/toast.jsx";
import { Analytics } from "@vercel/analytics/react";
import './index.css';

// Mock generateContent removed. Now using real AI via /api/generate backend.

// Maps hash route → page slug used inside <Legal />.
// Anything not listed here falls through to the normal app.
const LEGAL_ROUTES = {
  '#/legal/terms': 'terms',
  '#/legal/privacy': 'privacy',
  '#/legal/cookies': 'cookies',
};

function readLegalRoute() {
  if (typeof window === 'undefined') return null;
  return LEGAL_ROUTES[window.location.hash] || null;
}

export default function App() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();

  // Legal route state (hash-based). `null` means render the normal app.
  const [legalPage, setLegalPage] = useState(readLegalRoute());

  useEffect(() => {
    const onHash = () => setLegalPage(readLegalRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [flyerData, setFlyerData] = useState(null);
  
  // Supabase auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Monetization state (server-backed)
  const [credits, setCredits] = useState(0);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [activePlan, setActivePlan] = useState('free');
  const [hasPaid, setHasPaid] = useState(false);
  
  // Stores initial data from PLG Hero
  const [initialFormData, setInitialFormData] = useState(null);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // The onAuthStateChange listener below will clear isLoggedIn, credits,
      // activePlan and hasPaid automatically. We just reset the view back
      // to the hero so the user lands on a clean screen.
      setHasStarted(false);
      setFlyerData(null);
      setInitialFormData(null);
      setShowPricingModal(false);
      setShowAuthModal(false);
    } catch (err) {
      console.error('Signout error:', err);
      const lang = (i18n.language || 'es').split('-')[0].toLowerCase();
      toast.error(
        lang === 'en'
          ? "We couldn't sign you out. Please try again."
          : lang === 'ca'
            ? "No s'ha pogut tancar la sessió. Prova-ho de nou."
            : "No se ha podido cerrar la sesión. Inténtalo de nuevo."
      );
    }
  };

  const refreshMe = async () => {
    const { data } = await supabase.auth.getSession();
    const accessToken = data?.session?.access_token;
    if (!accessToken) return;

    const res = await fetch('/api/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return;
    const me = await res.json();
    setCredits(typeof me.credits === 'number' ? me.credits : 0);
    setActivePlan(me.plan || 'free');
    setHasPaid(Boolean(me.hasPaid));
  };

  // Stripe Checkout return handling
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(Boolean(data?.session));
      if (data?.session) await refreshMe();
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoggedIn(Boolean(session));
      if (session) await refreshMe();
      if (!session) {
        setCredits(0);
        setActivePlan('free');
        setHasPaid(false);
      }
    });

    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      // Webhook may take a moment; refresh a couple times.
      (async () => {
        await new Promise(r => setTimeout(r, 800));
        await refreshMe();
        await new Promise(r => setTimeout(r, 1200));
        await refreshMe();
      })();
      toast.success(t('checkout.success'));
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('checkout') === 'cancel') {
      toast.info(t('checkout.cancelled'));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    return () => {
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleGenerate = async (formData) => {
    const langCode = (i18n.language || 'es').split('-')[0].toLowerCase();

    // 1. Require authentication BEFORE hitting the API.
    //    The backend now rejects anonymous requests to /api/generate, so we
    //    gate on the client side to avoid a wasted round-trip and to show
    //    the auth modal in a natural place.
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    if (!accessToken) {
      // Preserve what the user already typed so it's still there after login.
      setInitialFormData(formData);
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);

    const wasFirstGeneration = !hasStarted;
    if (wasFirstGeneration) {
      setHasStarted(true);
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          prompt: formData.prompt,
          lang: langCode,
          style: formData.style,
          audience: formData.audience,
          colorTheme: formData.colorTheme,
          brief: formData.brief,
        }),
      });

      // Token expired or invalid → re-prompt auth.
      if (response.status === 401) {
        setInitialFormData(formData);
        setShowAuthModal(true);
        if (wasFirstGeneration) setHasStarted(false);
        return;
      }

      // Rate limited.
      if (response.status === 429) {
        let retryAfterMin = 60;
        try {
          const j = await response.json();
          if (j?.retryAfterSec) retryAfterMin = Math.max(1, Math.ceil(j.retryAfterSec / 60));
        } catch (_) { /* ignore */ }
        const rlMsg = langCode === 'en'
          ? `You've generated too many flyers. Please try again in ~${retryAfterMin} min.`
          : langCode === 'ca'
            ? `Has generat massa flyers. Torna-ho a provar d'aquí ~${retryAfterMin} min.`
            : `Has generado demasiados flyers. Inténtalo de nuevo en ~${retryAfterMin} min.`;
        toast.warning(rlMsg, { ttl: 8000 });
        if (wasFirstGeneration) setHasStarted(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`AI request failed (${response.status})`);
      }

      const generated = await response.json();

      // Merge AI output with user's explicit visual preferences.
      // The AI may return its own `style`/`colorTheme`, but the user's pick wins.
      setFlyerData({
        ...formData,
        generated: {
          title: generated.title || formData.prompt,
          subtitle: generated.subtitle || '',
          points: Array.isArray(generated.points) && generated.points.length > 0
            ? generated.points
            : [],
          cta: generated.cta || '',
          style: formData.style || generated.style || 'modern',
          colorTheme: formData.colorTheme || generated.colorTheme || 'brand',
        },
      });
    } catch (err) {
      console.error('Generate error:', err);
      const msg = langCode === 'en'
        ? "We couldn't generate your flyer right now. Please try again."
        : langCode === 'ca'
          ? "No s'ha pogut generar el flyer. Prova-ho de nou."
          : "No se ha podido generar el flyer. Inténtalo de nuevo.";
      toast.error(msg);
      // If it was the very first attempt, go back to the hero so the user isn't stuck.
      if (wasFirstGeneration) {
        setHasStarted(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Legal pages take over the full screen. The cookie banner stays mounted
  // on top so users can still manage their consent from the legal views.
  if (legalPage) {
    return (
      <>
        <Legal page={legalPage} />
        <CookieBanner />
      </>
    );
  }

  return (
    <div translate="no" className="notranslate" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-cream)' }}>
      <Header
        isLoggedIn={isLoggedIn}
        credits={credits}
        onLoginClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onOpenPricing={() => setShowPricingModal(true)}
      />

      {/* Hero tagline strip */}
      <div className="todoflyer-hero-tagline" style={{
        backgroundColor: 'var(--color-primary)',
        color: '#fff',
        textAlign: 'center',
        padding: '0.6rem 1rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        letterSpacing: '0.02em'
      }}>
        {t('app.tagline')}
      </div>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!hasStarted ? (
          
          /* Phase 1: Guest Mode Landing */
          <HeroPrompt onGo={handleGenerate} />
          
        ) : (
          
          /* Phase 2: Editor Mode */
          <div className="anim-fade-up todoflyer-editor-grid" style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 480px) 1fr',
            gap: '2rem',
            padding: '2.5rem 2rem',
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
            alignItems: 'start'
          }}>
            <PromptForm 
              onSubmit={handleGenerate} 
              isLoading={isLoading} 
              initialData={initialFormData} 
              plan={activePlan}
            />

            <div className="todoflyer-preview-col" style={{ position: 'sticky', top: '80px' }}>
              {isLoading ? (
                <LoadingState />
              ) : (
                <FlyerPreview 
                  data={flyerData} 
                  isAuthenticated={isLoggedIn}
                  hasPaid={hasPaid}
                  credits={credits}
                  plan={activePlan}
                  onRequireAuth={() => setShowAuthModal(true)} 
                  onRequirePricing={() => setShowPricingModal(true)}
                  onCreditsUpdated={(next) => {
                    setCredits(typeof next?.credits === 'number' ? next.credits : credits);
                    setActivePlan(next?.plan || activePlan);
                    setHasPaid(Boolean(next?.hasPaid));
                  }}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="todoflyer-footer" style={{
        backgroundColor: 'var(--color-bg-main)',
        borderTop: '1px solid var(--color-border)',
        padding: '1.5rem 2.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.8125rem',
        color: 'var(--color-text-body)'
      }}>
        <span>© 2025 <strong translate="no" className="notranslate" style={{ color: 'var(--color-text-dark)' }}>TodoFlyer</strong>. {t('app.footerRights')}</span>
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a href="#/legal/terms" style={{ color: 'var(--color-text-body)', textDecoration: 'none', fontWeight: 600 }}>
            {t('footer.terms')}
          </a>
          <a href="#/legal/privacy" style={{ color: 'var(--color-text-body)', textDecoration: 'none', fontWeight: 600 }}>
            {t('footer.privacy')}
          </a>
          <a href="#/legal/cookies" style={{ color: 'var(--color-text-body)', textDecoration: 'none', fontWeight: 600 }}>
            {t('footer.cookies')}
          </a>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('todoflyer:reopen-cookie-banner'))}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-body)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline'
            }}
          >
            🍪
          </button>
        </nav>
        <span>{t('app.footerDesc')}</span>
      </footer>

      {/* Auth Modal Overlay */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onLogin={() => {
          setShowAuthModal(false);
        }}
      />

      {/* Pricing Modal Overlay */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onPurchase={() => {}}
      />

      {/* GDPR cookie consent banner */}
      <CookieBanner />

      {/* Vercel Analytics */}
      <Analytics />
    </div>
  );
}
