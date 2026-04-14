import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ca: {
    translation: {
      app: {
        tagline: "✦ Generador de flyers amb IA — dissenys llestos per imprimir en segons ✦",
        footerRights: "Tots els drets reservats.",
        footerDesc: "Generador de Flyers amb IA · Impressió Professional"
      },
      header: {
        help: "Ajuda",
        contact: "¿Parlem?",
        login: "ENTRAR",
        logout: "Sortir",
        credits: "Crèdits",
        lang: "CA"
      },
      hero: {
        title: "Crea un flyer professional en segons.",
        inputPlaceholder: "De què va el teu esdeveniment o negoci?",
        button: "Generar Flyer",
        shortcuts: {
          tesis: "Tesis / TFG",
          uni: "Universitari",
          cards: "Targetes",
          a3: "Pòster A3",
          diptic: "Díptic",
          custom: "Mida ext."
        }
      },
      auth: {
        title: "Desbloqueja el teu disseny",
        desc: "Crea el teu compte gratuït per **treure la marca d'aigua**, descarregar en PDF/PNG d'alta resolució i guardar el teu disseny.",
        apple: "Continua amb Apple",
        google: "Continua amb Google",
        email: "Registra't amb Correu",
        terms: "En continuar, acceptes els nostres Termes de Servei i la Política de Privacitat."
      },
      pricing: {
        title: "T'has quedat sense crèdits",
        subtitle: "Aprofita el poder de la IA per impulsar el teu negoci. Tria el pla que s'adapti millor a tu.",
        currency: "€",
        popular: "Més Popular",
        free: {
          name: "Freemium", desc: "Per a proves",
          feat1: "10 Crèdits inicials", feat2: "Marca d'aigua actiu", feat3: "Qualitat JPG (72dpi)", feat4: "Suport comunitari", btn: "Pla Actual"
        },
        pack: {
          name: "Pack Crèdits", desc: "Llibertat puntual", freq: "pagament únic",
          feat1: "+5 Crèdits extra", feat2: "Sense marces d'aigua", feat3: "Alta resolució PDF/PNG", feat4: "Mai caduquen", btn: "Comprar Pack"
        },
        pro: {
          name: "Pro", desc: "Per a negocis en creixement", freq: "/ mes",
          feat1: "100 Crèdits / mes", feat2: "Alta resolució Premium", feat3: "Documents Sense Marca", feat4: "Edició iterativa assistida", btn: "Subscriure's"
        },
        premium: {
          name: "Premium", desc: "Agències i Copisteries", freq: "/ mes",
          feat1: "Crèdits Il·limitats", feat2: "Generació Logos IA", feat3: "Brand Kit (Logo Personal)", feat4: "Suport Prioritari", btn: "Pla Superior"
        }
      },
      preview: {
        emptyTitle: "El llenç t'espera",
        emptyDesc: "Tria una plantilla o escriu la teva idea i fes clic a 'Generar Flyer amb IA'.",
        headerTitle: "Vista prèvia del flyer",
        editMode: "Editar text",
        saveMode: "Guardar edició",
        editHint: "✏️ Fes clic a qualsevol text del flyer per editar-lo directament.",
        addPoint: "Afegir punt",
        downPng: "Descarregar PNG",
        downPdf: "Descarregar PDF",
        watermark: "CREAT GRATUÏTAMENT AMB FIAYER.COM",
        addLogo: "El teu Logo",
        premiumLogo: "Logo 👑"
      }
    }
  },
  es: {
    translation: {
      app: {
        tagline: "✦ Generador de flyers con IA — diseños listos para imprimir en segundos ✦",
        footerRights: "Todos los derechos reservados.",
        footerDesc: "Generador de Flyers con IA · Impresión Profesional"
      },
      header: {
        help: "Ayuda",
        contact: "¿Hablamos?",
        login: "ENTRAR",
        logout: "Salir",
        credits: "Créditos",
        lang: "ES"
      },
      hero: {
        title: "Crea un flyer profesional en segundos.",
        inputPlaceholder: "¿De qué trata tu evento o negocio?",
        button: "Generar Flyer",
        shortcuts: {
          tesis: "Tesis / TFG",
          uni: "Universitario",
          cards: "Tarjetas",
          a3: "Póster A3",
          diptic: "Díptico",
          custom: "Tamaño ext."
        }
      },
      auth: {
        title: "Desbloquea tu diseño",
        desc: "Crea tu cuenta gratuita para **quitar la marca de agua**, descargar en PDF/PNG de alta resolución y guardar tu diseño.",
        apple: "Continuar con Apple",
        google: "Continuar con Google",
        email: "Regístrate con Correo",
        terms: "Al continuar, aceptas nuestros Términos de Servicio y la Política de Privacidad."
      },
      pricing: {
        title: "Te has quedado sin créditos",
        subtitle: "Aprovecha el poder de la IA para impulsar tu negocio. Elige el plan que mejor se adapte a ti.",
        currency: "€",
        popular: "Más Popular",
        free: {
          name: "Freemium", desc: "Para pruebas",
          feat1: "10 Créditos iniciales", feat2: "Marca de agua activa", feat3: "Calidad JPG (72dpi)", feat4: "Soporte comunitario", btn: "Plan Actual"
        },
        pack: {
          name: "Pack Créditos", desc: "Libertad puntual", freq: "pago único",
          feat1: "+5 Créditos extra", feat2: "Sin marcas de agua", feat3: "Alta resolución PDF/PNG", feat4: "Nunca caducan", btn: "Comprar Pack"
        },
        pro: {
          name: "Pro", desc: "Para negocios en crecimiento", freq: "/ mes",
          feat1: "100 Créditos / mes", feat2: "Alta resolución Premium", feat3: "Documentos Sin Marca", feat4: "Edición iterativa asistida", btn: "Suscribirse"
        },
        premium: {
          name: "Premium", desc: "Agencias y Copisterías", freq: "/ mes",
          feat1: "Créditos Ilimitados", feat2: "Generación Logos IA", feat3: "Brand Kit (Logo Personal)", feat4: "Soporte Prioritario", btn: "Plan Superior"
        }
      },
      preview: {
        emptyTitle: "El lienzo te espera",
        emptyDesc: "Elige una plantilla o escribe tu idea y haz clic en 'Generar Flyer con IA'.",
        headerTitle: "Vista previa del flyer",
        editMode: "Editar texto",
        saveMode: "Guardar edición",
        editHint: "✏️ Haz clic en cualquier texto del flyer para editarlo directamente.",
        addPoint: "Añadir punto",
        downPng: "Descargar PNG",
        downPdf: "Descargar PDF",
        watermark: "CREADO GRATUITAMENTE CON FIAYER.COM",
        addLogo: "Tu Logo",
        premiumLogo: "Logo 👑"
      }
    }
  },
  en: {
    translation: {
      app: {
        tagline: "✦ AI Flyer Generator — print-ready designs in seconds ✦",
        footerRights: "All rights reserved.",
        footerDesc: "AI Flyer Generator · Professional Printing"
      },
      header: {
        help: "Help",
        contact: "Contact us",
        login: "LOGIN",
        logout: "Logout",
        credits: "Credits",
        lang: "EN"
      },
      hero: {
        title: "Create a professional flyer in seconds.",
        inputPlaceholder: "What is your event or business about?",
        button: "Generate Flyer",
        shortcuts: {
          tesis: "Thesis / Capstone",
          uni: "University",
          cards: "Cards",
          a3: "A3 Poster",
          diptic: "Diptych",
          custom: "Custom Size"
        }
      },
      auth: {
        title: "Unlock your design",
        desc: "Create your free account to **remove the watermark**, download high-res PDF/PNG, and save your design.",
        apple: "Continue with Apple",
        google: "Continue with Google",
        email: "Sign up with Email",
        terms: "By continuing, you agree to our Terms of Service and Privacy Policy."
      },
      pricing: {
        title: "You are out of credits",
        subtitle: "Leverage AI to boost your business. Choose the plan that fits you best.",
        currency: "$",
        popular: "Most Popular",
        free: {
          name: "Freemium", desc: "For testing",
          feat1: "10 Initial Credits", feat2: "Watermark active", feat3: "JPG Quality (72dpi)", feat4: "Community Support", btn: "Current Plan"
        },
        pack: {
          name: "Credit Pack", desc: "On-demand freedom", freq: "one-time",
          feat1: "+5 Extra Credits", feat2: "No watermarks", feat3: "High-Res PDF/PNG", feat4: "Never expire", btn: "Buy Pack"
        },
        pro: {
          name: "Pro", desc: "For growing businesses", freq: "/ month",
          feat1: "100 Credits / month", feat2: "Premium High-Res", feat3: "Unwatermarked Files", feat4: "Assisted editing", btn: "Subscribe"
        },
        premium: {
          name: "Premium", desc: "Agencies & Printers", freq: "/ month",
          feat1: "Unlimited Credits", feat2: "AI Logo Gen", feat3: "Brand Kit (Custom Logo)", feat4: "Priority Support", btn: "Upgrade Plan"
        }
      },
      preview: {
        emptyTitle: "The canvas awaits",
        emptyDesc: "Choose a template or type your idea and click 'Generate AI Flyer'.",
        headerTitle: "Flyer Preview",
        editMode: "Edit text",
        saveMode: "Save changes",
        editHint: "✏️ Click on any text on the flyer to edit it directly.",
        addPoint: "Add point",
        downPng: "Download PNG",
        downPdf: "Download PDF",
        watermark: "CREATED FOR FREE WITH FIAYER.COM",
        addLogo: "Add Logo",
        premiumLogo: "Logo 👑"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
