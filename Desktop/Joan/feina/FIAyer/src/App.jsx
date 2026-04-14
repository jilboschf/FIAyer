import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PromptForm from './components/PromptForm';
import LoadingState from './components/LoadingState';
import FlyerPreview from './components/FlyerPreview';
import HeroPrompt from './components/HeroPrompt';
import AuthModal from './components/AuthModal';
import PricingModal from './components/PricingModal';
import { useTranslation } from 'react-i18next';
import './index.css';

// Mock generateContent removed. Now using real AI via /api/generate backend.

export default function App() {
  const { t } = useTranslation();
  
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [flyerData, setFlyerData] = useState(null);
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Monetization state
  const [credits, setCredits] = useState(10);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [activePlan, setActivePlan] = useState('free');
  
  // Stores initial data from PLG Hero
  const [initialFormData, setInitialFormData] = useState(null);

  // Stripe Payment Success Detection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      const addedCredits = parseInt(params.get('credits')) || 0;
      const boughtPlan = params.get('plan');

      setCredits(prev => prev + addedCredits);
      if (boughtPlan && boughtPlan !== 'pack') {
        setActivePlan(boughtPlan);
      }

      alert(`💳 Gràcies per la teva compra! S'han afegit ${addedCredits} crèdits al teu compte.`);
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('payment') === 'cancel') {
      alert("El pagament s'ha cancel·lat. No s'ha realitzat cap càrrec.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleGenerate = (formData) => {
    // 1. Switch view
    if (!hasStarted) {
      setHasStarted(true);
    }

    // 2. Prepare data immediately
    const simulated = {
      title: formData.prompt.length > 20 ? formData.prompt.substring(0, 20) + "..." : formData.prompt,
      subtitle: i18n.language === 'en' ? "Professional solution for your business" : "La solució professional per al teu negoci",
      points: [
        i18n.language === 'en' ? "Premium high-quality result" : "Resultat de qualitat premium",
        i18n.language === 'en' ? "Fast and professional service" : "Servei ràpid i professional",
        i18n.language === 'en' ? "30% off for new customers" : "30% de descompte per clients nous"
      ],
      cta: i18n.language === 'en' ? "Contact Us!" : "Contacta ara!",
      style: formData.style || 'modern',
      colorTheme: formData.colorTheme || 'brand'
    };
    
    // 3. Update state
    setFlyerData({ 
      ...formData, 
      generated: simulated 
    });
    setIsLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-cream)' }}>
      <Header 
        isLoggedIn={isLoggedIn} 
        credits={credits}
        onLoginClick={() => setShowAuthModal(true)} 
        onLogout={() => setIsLoggedIn(false)} 
        onOpenPricing={() => setShowPricingModal(true)}
      />

      {/* Hero tagline strip */}
      <div style={{
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
          <div className="anim-fade-up" style={{
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
            />

            <div style={{ position: 'sticky', top: '80px' }}>
              {isLoading ? (
                <LoadingState />
              ) : (
                <FlyerPreview 
                  data={flyerData} 
                  isLoggedIn={isLoggedIn} 
                  credits={credits}
                  plan={activePlan}
                  onRequireAuth={() => setShowAuthModal(true)} 
                  onRequirePricing={() => setShowPricingModal(true)}
                  onConsumeCredit={() => setCredits(c => Math.max(0, c - 1))}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'var(--color-bg-main)',
        borderTop: '1px solid var(--color-border)',
        padding: '1.5rem 2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.8125rem',
        color: 'var(--color-text-body)'
      }}>
        <span>© 2025 <strong style={{ color: 'var(--color-text-dark)' }}>FIAyer</strong>. {t('app.footerRights')}</span>
        <span>{t('app.footerDesc')}</span>
      </footer>

      {/* Auth Modal Overlay */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onLogin={(provider) => {
          setIsLoggedIn(true);
          setShowAuthModal(false);
        }}
      />

      {/* Pricing Modal Overlay */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onPurchase={(planData) => {
          // Simulate purchase success
          alert(`Simulant la compra del pla: ${planData.name}`);
          setCredits(c => c + (planData.id === 'pack' ? 5 : 100));
          if (planData.id !== 'pack') {
            setActivePlan(planData.id); // 'pro' | 'premium'
          }
          setShowPricingModal(false);
        }}
      />
    </div>
  );
}
