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
        inputHint: "Escriu aquí el teu text i el botó s'activarà",
        button: "Generar Flyer",
        orTemplate: "O comença ràpidament amb una plantilla:",
        shortcuts: {
          tesis: "Tesi / TFG",
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
        terms: "En continuar, acceptes els nostres Termes de Servei i la Política de Privacitat.",
        emailPlaceholder: "nom@empresa.com",
        sending: "Enviant…",
        sendMagic: "Envia enllaç al correu",
        sentCheckEmail: "Revisa el teu correu per completar l'inici de sessió.",
        haveSession: "Ja tinc sessió (tancar)",
        appleNotConfigured: "Login amb Apple: pendent de configurar a Supabase.",
        googleNotConfigured: "Login amb Google: pendent de configurar a Supabase.",
        genericError: "Error d'autenticació"
      },
      loading: {
        eyebrow: "TodoFlyer treballant per a tu",
        title: "Generant el teu disseny…",
        step1: "Redactant copy persuasiu…",
        step2: "Estructurant composició…",
        step3: "Aplicant paleta i estil…"
      },
      checkout: {
        success: "💳 Pagament completat. Estem actualitzant els teus crèdits.",
        cancelled: "El pagament s'ha cancel·lat. No s'ha realitzat cap càrrec."
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
          feat1: "1 export premium", feat2: "Sense marca d'aigua", feat3: "Descàrrega en PNG o PDF", feat4: "Pagament únic", btn: "Comprar (5€)"
        },
        pro: {
          name: "Pro", desc: "Per a negocis en creixement", freq: "/ mes",
          feat1: "Sense marca d'aigua", feat2: "Descàrrega en PNG", feat3: "Descàrrega en PDF", feat4: "Alta resolució", btn: "Subscriure's"
        },
        premium: {
          name: "Premium", desc: "Agències i Copisteries", freq: "/ mes",
          feat1: "Sense marca d'aigua", feat2: "Puja el teu logo", feat3: "Més estils i plantilles", feat4: "Disseny personalitzat (brief)", btn: "Passar a Premium"
        },
        mustLoginFirst: "Has d'iniciar sessió abans de comprar.",
        stripeError: "Error connectant amb Stripe. Revisa la teva STRIPE_SECRET_KEY."
      },
      form: {
        eyebrow: "TodoFlyer, el teu dissenyador IA",
        title: "Crea el teu flyer amb IA",
        subtitle: "Tria una plantilla o descriu la teva idea i obtén un disseny llest per imprimir.",
        ideaLabel: "Descriu la teva idea",
        ideaPlaceholder: "Ex: Oferta especial en impressió de tesis i projectes universitaris. Descompte del 20% presentant el carnet…",
        briefLabel: "Brief (Premium)",
        briefPlaceholder: "Detalls: colors exactes, to, promoció, mida, telèfon, adreça, marca…",
        styleLabel: "Estil visual",
        audienceLabel: "Públic objectiu",
        colorLabel: "Paleta de colors",
        submitBtn: "Generar Flyer amb IA",
        submittingBtn: "Generant disseny…"
      },
      options: {
        style: {
          modern: "Modern i net",
          creative: "Creatiu i cridaner",
          corporate: "Corporatiu / B2B",
          elegant: "Elegant (Premium)",
          luxury: "Luxury (Premium)",
          minimal: "Minimal (Premium)",
          bold: "Bold (Premium)"
        },
        audience: {
          general: "Públic general",
          students: "Estudiants / Universitaris",
          companies: "Empreses / Pimes"
        },
        color: {
          auto: "Automàtic (IA decideix)",
          brand: "Corporatiu TodoFlyer",
          vibrant: "Vibrant i enèrgic",
          pastel: "Tons pastel / suaus"
        }
      },
      templates: {
        selectorLabel: "Tria una plantilla",
        tesis: {
          label: "Tesi / TFG",
          description: "Impressió i enquadernació de projectes universitaris",
          prompt: "Servei d'impressió i enquadernació de tesis, TFG i TFM. Paper d'alta qualitat, acabat professional i lliurament urgent en 24 hores."
        },
        flyer_univ: {
          label: "Flyer Universitari",
          description: "Descomptes i promocions per a estudiants",
          prompt: "Oferta especial de fotocòpies i impressió per a universitaris. 30% de descompte presentant el carnet d'estudiant vàlid."
        },
        tarjetas: {
          label: "Targetes de Visita",
          description: "Pack de targetes professionals per a empreses",
          prompt: "Impressió de targetes de visita professionals per a empreses. Pack de 500 unitats amb disseny personalitzat i paper premium 350gr."
        },
        cartel_a3: {
          label: "Cartell A3",
          description: "Cartells de gran format per a comerços i esdeveniments",
          prompt: "Impressió de cartells A3 en alta resolució per a aparadors, esdeveniments i locals comercials. Paper setinat o mat."
        },
        diptico: {
          label: "Díptic Informatiu",
          description: "Fullets plegables per a empreses i serveis",
          prompt: "Impressió de díptics i tríptics per a presentació de serveis empresarials. Acabat plastificat, color real i gramatge premium."
        },
        custom: {
          label: "Personalitzat",
          description: "Comença de zero amb la teva pròpia idea"
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
        defaultPoint: "Nou avantatge del servei",
        scriptAccent: "TodoFlyer t'ho posa fàcil",
        trustTag: "todoflyer.es · La teva impremta de confiança",
        downJpg: "Descarregar JPG",
        downPng: "Descarregar PNG",
        downPdf: "Descarregar PDF",
        watermark: "CREAT GRATUÏTAMENT AMB TODOFLYER.ES",
        addLogo: "El teu Logo",
        premiumLogo: "Logo 👑",
        errValidate: "No s'ha pogut validar el teu saldo de crèdits. Prova-ho de nou.",
        errConn: "Error de connexió validant crèdits. Prova-ho de nou.",
        errExport: "Error al generar el fitxer. Prova-ho de nou."
      },
      footer: {
        terms: "Termes",
        privacy: "Privacitat",
        cookies: "Cookies"
      },
      cookieBanner: {
        title: "🍪 Fem servir cookies",
        message: "Utilitzem cookies tècniques necessàries perquè TodoFlyer funcioni. Les analítiques són opcionals i pots triar.",
        accept: "Acceptar totes",
        essentials: "Només essencials",
        learnMore: "Saber-ne més"
      },
      legal: {
        backToApp: "← Tornar a TodoFlyer",
        lastUpdated: "Última actualització: 17 d'abril de 2026",
        holder: "Xavier Cid Salvador · NIF 39.179.681-D · Carrer Jacint Morera 14, 08227 Terrassa · Espanya",
        contactIntro: "Per a qualsevol consulta relacionada amb aquests textos, pots escriure a:",
        contactEmail: "xavicid@gmail.com",
        terms: {
          title: "Termes i Condicions",
          intro: "TodoFlyer és un servei en línia que genera flyers amb intel·ligència artificial. Utilitzant-lo acceptes aquestes condicions. Si no hi estàs d'acord, no utilitzis el servei.",
          sections: [
            { title: "1. Titular", body: "Titular del servei: Xavier Cid Salvador, NIF 39.179.681-D, amb domicili a Carrer Jacint Morera 14, 08227 Terrassa. Contacte: xavicid@gmail.com." },
            { title: "2. Ús acceptable", body: "Et compromets a no utilitzar TodoFlyer per generar contingut il·legal, que infringeixi drets de tercers, contingut enganyós, propaganda, spam o amb dades personals de tercers sense consentiment. Podem suspendre el teu compte si incompleixes." },
            { title: "3. Compte", body: "Inicies sessió mitjançant un enllaç màgic enviat al teu correu. Ets responsable de la seguretat del teu correu i de l'activitat del teu compte." },
            { title: "4. Plans, crèdits i pagaments", body: "Oferim un pla gratuït amb 10 crèdits inicials i plans de pagament gestionats per Stripe. Els preus mostrats inclouen impostos quan correspongui. Els crèdits no són reemborsables un cop consumits." },
            { title: "5. Propietat del contingut", body: "Ets titular del contingut que generis sempre que tinguis els drets sobre el prompt d'entrada. TodoFlyer no reclama propietat sobre els teus dissenys." },
            { title: "6. Desistiment i reemborsaments", body: "Com a consumidor a la UE tens 14 dies naturals per desistir de compres digitals que no hagis començat a utilitzar. Un cop has consumit crèdits o descarregat un flyer sense marca d'aigua, el servei es considera prestat i no procedeix reemborsament." },
            { title: "7. Responsabilitat", body: "TodoFlyer es presta \"tal qual\". La IA pot cometre errors de text, ortografia o composició. Revisa sempre el resultat abans d'imprimir. No responem de danys indirectes ni lucre cessant." },
            { title: "8. Llei aplicable", body: "Aquestes condicions es regeixen per la llei espanyola. Per als consumidors, els tribunals competents són els del seu domicili." }
          ]
        },
        privacy: {
          title: "Política de Privacitat",
          intro: "A TodoFlyer prenem seriosament la teva privacitat. Aquesta política explica quines dades tractem, per a què i amb quins drets comptes.",
          sections: [
            { title: "1. Responsable", body: "Responsable del tractament: Xavier Cid Salvador, NIF 39.179.681-D, amb domicili a Carrer Jacint Morera 14, 08227 Terrassa. Contacte: xavicid@gmail.com." },
            { title: "2. Dades que tractem", body: "Correu electrònic, identificador d'usuari de Supabase, pla contractat i crèdits disponibles, data de compra, prompts i contingut generat. No tractem el teu número de targeta: el cobrament el gestiona Stripe." },
            { title: "3. Finalitats", body: "Prestar el servei de generació de flyers, gestionar el teu compte i les teves compres, prevenir abús i frau, i complir obligacions legals." },
            { title: "4. Base legal", body: "Execució del contracte (compte, servei i cobraments), interès legítim (prevenció d'abús) i consentiment (cookies opcionals)." },
            { title: "5. Encarregats i tercers", body: "Compartim dades amb: Supabase (autenticació i base de dades), Google Gemini (generació de contingut), Stripe (pagaments) i Vercel (hosting). Tots actuen com a encarregats o corresponsables amb garanties contractuals." },
            { title: "6. Transferències internacionals", body: "Alguns proveïdors (Google, Stripe, Vercel) poden tractar dades fora de l'EEE sota Clàusules Contractuals Tipus de la Comissió Europea." },
            { title: "7. Conservació", body: "Conservem les teves dades mentre tinguis compte actiu. Pots sol·licitar l'eliminació en qualsevol moment." },
            { title: "8. Els teus drets", body: "Pots exercir els teus drets d'accés, rectificació, supressió, oposició, limitació i portabilitat escrivint a xavicid@gmail.com. Tens dret a presentar reclamació davant l'Agència Espanyola de Protecció de Dades (www.aepd.es)." },
            { title: "9. Canvis", body: "Si modifiquem aquesta política publicarem la nova versió en aquesta pàgina." }
          ]
        },
        cookies: {
          title: "Política de Cookies",
          intro: "Aquesta pàgina explica quines cookies utilitza TodoFlyer i com pots gestionar-les.",
          sections: [
            { title: "Què són les cookies?", body: "Petits arxius que els llocs web guarden al teu navegador per funcionar correctament o recordar preferències." },
            { title: "Cookies que utilitzem", body: "Utilitzem cookies tècniques necessàries per mantenir la teva sessió (Supabase Auth) i recordar l'idioma que prefereixes. No fem servir cookies publicitàries ni de seguiment de tercers." },
            { title: "Cookies opcionals", body: "Si acceptes, en el futur podrem activar cookies analítiques per mesurar l'ús agregat i millorar el servei. Mai s'utilitzaran per identificar-te personalment." },
            { title: "Gestió", body: "Pots revocar el consentiment en qualsevol moment esborrant les cookies al teu navegador o tornant a obrir el banner des del peu de pàgina." }
          ]
        }
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
        inputHint: "Escribe aquí tu texto y el botón se activará",
        button: "Generar Flyer",
        orTemplate: "O empieza rápidamente con una plantilla:",
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
        terms: "Al continuar, aceptas nuestros Términos de Servicio y la Política de Privacidad.",
        emailPlaceholder: "nombre@empresa.com",
        sending: "Enviando…",
        sendMagic: "Enviar enlace al correo",
        sentCheckEmail: "Revisa tu correo para completar el inicio de sesión.",
        haveSession: "Ya tengo sesión (cerrar)",
        appleNotConfigured: "Login con Apple: pendiente de configurar en Supabase.",
        googleNotConfigured: "Login con Google: pendiente de configurar en Supabase.",
        genericError: "Error de autenticación"
      },
      loading: {
        eyebrow: "TodoFlyer trabajando para ti",
        title: "Generando tu diseño…",
        step1: "Redactando copy persuasivo…",
        step2: "Estructurando composición…",
        step3: "Aplicando paleta y estilo…"
      },
      checkout: {
        success: "💳 Pago completado. Estamos actualizando tus créditos.",
        cancelled: "El pago se ha cancelado. No se ha realizado ningún cargo."
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
          feat1: "1 export premium", feat2: "Sin marca de agua", feat3: "Descarga en PNG o PDF", feat4: "Pago único", btn: "Comprar (5€)"
        },
        pro: {
          name: "Pro", desc: "Para negocios en crecimiento", freq: "/ mes",
          feat1: "Sin marca de agua", feat2: "Descarga en PNG", feat3: "Descarga en PDF", feat4: "Alta resolución", btn: "Suscribirse"
        },
        premium: {
          name: "Premium", desc: "Agencias y Copisterías", freq: "/ mes",
          feat1: "Sin marca de agua", feat2: "Sube tu logo", feat3: "Más estilos y plantillas", feat4: "Diseño personalizado (brief)", btn: "Pasarme a Premium"
        },
        mustLoginFirst: "Debes iniciar sesión antes de comprar.",
        stripeError: "Error conectando con Stripe. Revisa tu STRIPE_SECRET_KEY."
      },
      form: {
        eyebrow: "TodoFlyer, tu diseñador IA",
        title: "Crea tu flyer con IA",
        subtitle: "Elige una plantilla o describe tu idea y obtén un diseño listo para imprimir.",
        ideaLabel: "Describe tu idea",
        ideaPlaceholder: "Ej: Oferta especial en impresión de tesis y proyectos universitarios. Descuento del 20% presentando el carnet…",
        briefLabel: "Brief (Premium)",
        briefPlaceholder: "Detalles: colores exactos, tono, promoción, tamaño, teléfono, dirección, marca…",
        styleLabel: "Estilo visual",
        audienceLabel: "Público objetivo",
        colorLabel: "Paleta de colores",
        submitBtn: "Generar Flyer con IA",
        submittingBtn: "Generando diseño…"
      },
      options: {
        style: {
          modern: "Moderno y limpio",
          creative: "Creativo y llamativo",
          corporate: "Corporativo / B2B",
          elegant: "Elegante (Premium)",
          luxury: "Luxury (Premium)",
          minimal: "Minimal (Premium)",
          bold: "Bold (Premium)"
        },
        audience: {
          general: "Público general",
          students: "Estudiantes / Universitarios",
          companies: "Empresas / Pymes"
        },
        color: {
          auto: "Automático (IA decide)",
          brand: "Corporativo TodoFlyer",
          vibrant: "Vibrante y energético",
          pastel: "Tonos pastel / suaves"
        }
      },
      templates: {
        selectorLabel: "Elige una plantilla",
        tesis: {
          label: "Tesis / TFG",
          description: "Impresión y encuadernado de proyectos universitarios",
          prompt: "Servicio de impresión y encuadernado de tesis, TFG y TFM. Papel de alta calidad, acabado profesional y entrega urgente en 24 horas."
        },
        flyer_univ: {
          label: "Flyer Universitario",
          description: "Descuentos y promociones para estudiantes",
          prompt: "Oferta especial de fotocopias e impresión para universitarios. 30% de descuento presentando el carnet de estudiante válido."
        },
        tarjetas: {
          label: "Tarjetas de Visita",
          description: "Pack de tarjetas profesionales para empresas",
          prompt: "Impresión de tarjetas de visita profesionales para empresas. Pack de 500 unidades con diseño personalizado y papel premium 350gr."
        },
        cartel_a3: {
          label: "Cartel A3",
          description: "Carteles de gran formato para comercios y eventos",
          prompt: "Impresión de carteles A3 en alta resolución para escaparates, eventos y locales comerciales. Papel satinado o mate."
        },
        diptico: {
          label: "Díptico Informativo",
          description: "Folletos plegables para empresas y servicios",
          prompt: "Impresión de dípticos y trípticos para presentación de servicios empresariales. Acabado plastificado, color real y gramaje premium."
        },
        custom: {
          label: "Personalizado",
          description: "Empieza desde cero con tu propia idea"
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
        defaultPoint: "Nueva ventaja del servicio",
        scriptAccent: "TodoFlyer te lo pone fácil",
        trustTag: "todoflyer.es · Tu impresora de confianza",
        downJpg: "Descargar JPG",
        downPng: "Descargar PNG",
        downPdf: "Descargar PDF",
        watermark: "CREADO GRATUITAMENTE CON TODOFLYER.ES",
        addLogo: "Tu Logo",
        premiumLogo: "Logo 👑",
        errValidate: "No se ha podido validar tu saldo de créditos. Inténtalo de nuevo.",
        errConn: "Error de conexión al validar créditos. Inténtalo de nuevo.",
        errExport: "Error al generar el archivo. Inténtalo de nuevo."
      },
      footer: {
        terms: "Términos",
        privacy: "Privacidad",
        cookies: "Cookies"
      },
      cookieBanner: {
        title: "🍪 Usamos cookies",
        message: "Usamos cookies técnicas necesarias para que TodoFlyer funcione. Las analíticas son opcionales y puedes elegir.",
        accept: "Aceptar todas",
        essentials: "Solo esenciales",
        learnMore: "Saber más"
      },
      legal: {
        backToApp: "← Volver a TodoFlyer",
        lastUpdated: "Última actualización: 17 de abril de 2026",
        holder: "Xavier Cid Salvador · NIF 39.179.681-D · Carrer Jacint Morera 14, 08227 Terrassa · España",
        contactIntro: "Para cualquier consulta relativa a estos textos, puedes escribir a:",
        contactEmail: "xavicid@gmail.com",
        terms: {
          title: "Términos y Condiciones",
          intro: "TodoFlyer es un servicio en línea que genera flyers con inteligencia artificial. Al utilizarlo aceptas estas condiciones. Si no estás de acuerdo, no uses el servicio.",
          sections: [
            { title: "1. Titular", body: "Titular del servicio: Xavier Cid Salvador, NIF 39.179.681-D, con domicilio en Carrer Jacint Morera 14, 08227 Terrassa. Contacto: xavicid@gmail.com." },
            { title: "2. Uso aceptable", body: "Te comprometes a no utilizar TodoFlyer para generar contenido ilegal, que infrinja derechos de terceros, contenido engañoso, propaganda, spam o con datos personales de terceros sin consentimiento. Podemos suspender tu cuenta si incumples." },
            { title: "3. Cuenta", body: "Inicias sesión mediante un enlace mágico enviado a tu correo. Eres responsable de la seguridad de tu correo y de la actividad en tu cuenta." },
            { title: "4. Planes, créditos y pagos", body: "Ofrecemos un plan gratuito con 10 créditos iniciales y planes de pago gestionados por Stripe. Los precios mostrados incluyen impuestos cuando aplique. Los créditos no son reembolsables una vez consumidos." },
            { title: "5. Propiedad del contenido", body: "Eres titular del contenido que generes siempre que tengas los derechos sobre el prompt de entrada. TodoFlyer no reclama propiedad sobre tus diseños." },
            { title: "6. Desistimiento y reembolsos", body: "Como consumidor en la UE tienes 14 días naturales para desistir de compras digitales que no hayas comenzado a utilizar. Una vez has consumido créditos o descargado un flyer sin marca de agua, el servicio se considera prestado y no procede reembolso." },
            { title: "7. Responsabilidad", body: "TodoFlyer se presta \"tal cual\". La IA puede cometer errores de texto, ortografía o composición. Revisa siempre el resultado antes de imprimir. No respondemos de daños indirectos ni lucro cesante." },
            { title: "8. Ley aplicable", body: "Estas condiciones se rigen por la ley española. Para consumidores, los tribunales competentes son los de su domicilio." }
          ]
        },
        privacy: {
          title: "Política de Privacidad",
          intro: "En TodoFlyer nos tomamos tu privacidad en serio. Esta política explica qué datos tratamos, para qué y con qué derechos cuentas.",
          sections: [
            { title: "1. Responsable", body: "Responsable del tratamiento: Xavier Cid Salvador, NIF 39.179.681-D, con domicilio en Carrer Jacint Morera 14, 08227 Terrassa. Contacto: xavicid@gmail.com." },
            { title: "2. Datos que tratamos", body: "Correo electrónico, identificador de usuario de Supabase, plan contratado y créditos disponibles, fecha de compra, prompts y contenido generado. No tratamos tu número de tarjeta: el cobro lo gestiona Stripe." },
            { title: "3. Finalidades", body: "Prestar el servicio de generación de flyers, gestionar tu cuenta y compras, prevenir abuso y fraude, y cumplir obligaciones legales." },
            { title: "4. Base legal", body: "Ejecución del contrato (cuenta, servicio y cobros), interés legítimo (prevención de abuso) y consentimiento (cookies opcionales)." },
            { title: "5. Encargados y terceros", body: "Compartimos datos con: Supabase (autenticación y base de datos), Google Gemini (generación de contenido), Stripe (pagos) y Vercel (hosting). Todos actúan como encargados o corresponsables con garantías contractuales." },
            { title: "6. Transferencias internacionales", body: "Algunos proveedores (Google, Stripe, Vercel) pueden tratar datos fuera del EEE bajo Cláusulas Contractuales Tipo de la Comisión Europea." },
            { title: "7. Conservación", body: "Conservamos tus datos mientras tengas cuenta activa. Puedes solicitar la eliminación en cualquier momento." },
            { title: "8. Tus derechos", body: "Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a xavicid@gmail.com. Tienes derecho a presentar reclamación ante la Agencia Española de Protección de Datos (www.aepd.es)." },
            { title: "9. Cambios", body: "Si modificamos esta política publicaremos la nueva versión en esta página." }
          ]
        },
        cookies: {
          title: "Política de Cookies",
          intro: "Esta página explica qué cookies utiliza TodoFlyer y cómo puedes gestionarlas.",
          sections: [
            { title: "¿Qué son las cookies?", body: "Pequeños archivos que los sitios web guardan en tu navegador para funcionar correctamente o recordar preferencias." },
            { title: "Cookies que usamos", body: "Usamos cookies técnicas necesarias para mantener tu sesión (Supabase Auth) y recordar el idioma que prefieres. No usamos cookies publicitarias ni de seguimiento de terceros." },
            { title: "Cookies opcionales", body: "Si aceptas, en el futuro podremos activar cookies analíticas para medir el uso agregado y mejorar el servicio. Nunca se usarán para identificarte personalmente." },
            { title: "Gestión", body: "Puedes revocar el consentimiento en cualquier momento borrando las cookies en tu navegador o volviendo a abrir el banner desde el pie de página." }
          ]
        }
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
        inputHint: "Type your text here and the button will activate",
        button: "Generate Flyer",
        orTemplate: "Or start quickly with a template:",
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
        terms: "By continuing, you agree to our Terms of Service and Privacy Policy.",
        emailPlaceholder: "name@company.com",
        sending: "Sending…",
        sendMagic: "Send link to email",
        sentCheckEmail: "Check your email to complete sign-in.",
        haveSession: "I already have a session (close)",
        appleNotConfigured: "Apple sign-in: pending Supabase setup.",
        googleNotConfigured: "Google sign-in: pending Supabase setup.",
        genericError: "Authentication error"
      },
      loading: {
        eyebrow: "TodoFlyer working for you",
        title: "Generating your design…",
        step1: "Writing persuasive copy…",
        step2: "Structuring composition…",
        step3: "Applying palette and style…"
      },
      checkout: {
        success: "💳 Payment complete. We're updating your credits.",
        cancelled: "Payment cancelled. No charge was made."
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
          feat1: "1 premium export", feat2: "No watermark", feat3: "PNG or PDF download", feat4: "One-time payment", btn: "Buy (€5)"
        },
        pro: {
          name: "Pro", desc: "For growing businesses", freq: "/ month",
          feat1: "No watermark", feat2: "PNG download", feat3: "PDF download", feat4: "High resolution", btn: "Subscribe"
        },
        premium: {
          name: "Premium", desc: "Agencies & Printers", freq: "/ month",
          feat1: "No watermark", feat2: "Upload your logo", feat3: "More styles & templates", feat4: "Custom design (brief)", btn: "Go Premium"
        },
        mustLoginFirst: "You must sign in before purchasing.",
        stripeError: "Error connecting to Stripe. Check your STRIPE_SECRET_KEY."
      },
      form: {
        eyebrow: "TodoFlyer, your AI designer",
        title: "Create your flyer with AI",
        subtitle: "Choose a template or describe your idea and get a print-ready design.",
        ideaLabel: "Describe your idea",
        ideaPlaceholder: "E.g.: Special offer on thesis and university project printing. 20% discount with a student ID…",
        briefLabel: "Brief (Premium)",
        briefPlaceholder: "Details: exact colors, tone, promo, size, phone, address, brand…",
        styleLabel: "Visual style",
        audienceLabel: "Target audience",
        colorLabel: "Color palette",
        submitBtn: "Generate Flyer with AI",
        submittingBtn: "Generating design…"
      },
      options: {
        style: {
          modern: "Modern and clean",
          creative: "Creative and eye-catching",
          corporate: "Corporate / B2B",
          elegant: "Elegant (Premium)",
          luxury: "Luxury (Premium)",
          minimal: "Minimal (Premium)",
          bold: "Bold (Premium)"
        },
        audience: {
          general: "General audience",
          students: "Students / University",
          companies: "Companies / SMBs"
        },
        color: {
          auto: "Automatic (AI decides)",
          brand: "TodoFlyer brand",
          vibrant: "Vibrant and energetic",
          pastel: "Soft pastel tones"
        }
      },
      templates: {
        selectorLabel: "Choose a template",
        tesis: {
          label: "Thesis / Capstone",
          description: "Printing and binding of university projects",
          prompt: "Printing and binding service for theses, capstones and master's projects. High-quality paper, professional finish and 24-hour urgent delivery."
        },
        flyer_univ: {
          label: "University Flyer",
          description: "Discounts and promotions for students",
          prompt: "Special offer on photocopies and printing for university students. 30% discount by showing a valid student ID."
        },
        tarjetas: {
          label: "Business Cards",
          description: "Professional card pack for businesses",
          prompt: "Professional business card printing for companies. Pack of 500 units with custom design and premium 350gsm paper."
        },
        cartel_a3: {
          label: "A3 Poster",
          description: "Large-format posters for shops and events",
          prompt: "High-resolution A3 poster printing for shop windows, events and commercial premises. Glossy or matte paper."
        },
        diptico: {
          label: "Informative Diptych",
          description: "Folded leaflets for businesses and services",
          prompt: "Printing of diptychs and triptychs for business service presentations. Laminated finish, true color and premium paper weight."
        },
        custom: {
          label: "Custom",
          description: "Start from scratch with your own idea"
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
        defaultPoint: "New service benefit",
        scriptAccent: "TodoFlyer makes it easy",
        trustTag: "todoflyer.es · Your trusted printer",
        downJpg: "Download JPG",
        downPng: "Download PNG",
        downPdf: "Download PDF",
        watermark: "CREATED FOR FREE WITH TODOFLYER.ES",
        addLogo: "Add Logo",
        premiumLogo: "Logo 👑",
        errValidate: "We couldn't validate your credit balance. Please try again.",
        errConn: "Connection error while validating credits. Please try again.",
        errExport: "Failed to generate the file. Please try again."
      },
      footer: {
        terms: "Terms",
        privacy: "Privacy",
        cookies: "Cookies"
      },
      cookieBanner: {
        title: "🍪 We use cookies",
        message: "We use technical cookies required for TodoFlyer to work. Analytics are optional and you choose.",
        accept: "Accept all",
        essentials: "Essentials only",
        learnMore: "Learn more"
      },
      legal: {
        backToApp: "← Back to TodoFlyer",
        lastUpdated: "Last updated: April 17, 2026",
        holder: "Xavier Cid Salvador · NIF 39.179.681-D · Carrer Jacint Morera 14, 08227 Terrassa · Spain",
        contactIntro: "For any query regarding these documents, you can write to:",
        contactEmail: "xavicid@gmail.com",
        terms: {
          title: "Terms and Conditions",
          intro: "TodoFlyer is an online service that generates flyers using artificial intelligence. By using it you accept these terms. If you do not agree, do not use the service.",
          sections: [
            { title: "1. Service provider", body: "Service provider: Xavier Cid Salvador, NIF 39.179.681-D, with address at Carrer Jacint Morera 14, 08227 Terrassa, Spain. Contact: xavicid@gmail.com." },
            { title: "2. Acceptable use", body: "You agree not to use TodoFlyer to generate illegal content, content that infringes third-party rights, misleading content, propaganda, spam or content with third parties' personal data without consent. We may suspend your account in case of breach." },
            { title: "3. Account", body: "You sign in via a magic link sent to your email. You are responsible for the security of your inbox and for any activity in your account." },
            { title: "4. Plans, credits and payments", body: "We offer a free plan with 10 initial credits and paid plans handled by Stripe. Listed prices include taxes where applicable. Credits are non-refundable once consumed." },
            { title: "5. Content ownership", body: "You own the content you generate as long as you own the rights on the input prompt. TodoFlyer does not claim any ownership over your designs." },
            { title: "6. Withdrawal and refunds", body: "As an EU consumer you have 14 calendar days to withdraw from digital purchases that you have not started to use. Once you have consumed credits or downloaded a watermark-free flyer the service is considered rendered and no refund applies." },
            { title: "7. Liability", body: "TodoFlyer is provided \"as is\". The AI may produce text, spelling or layout errors. Always review the result before printing. We are not liable for indirect damages or lost profits." },
            { title: "8. Governing law", body: "These terms are governed by Spanish law. For consumers, competent courts are those of their place of residence." }
          ]
        },
        privacy: {
          title: "Privacy Policy",
          intro: "At TodoFlyer we take your privacy seriously. This policy explains which data we process, for what purpose and which rights you have.",
          sections: [
            { title: "1. Controller", body: "Data controller: Xavier Cid Salvador, NIF 39.179.681-D, with address at Carrer Jacint Morera 14, 08227 Terrassa, Spain. Contact: xavicid@gmail.com." },
            { title: "2. Data we process", body: "Email address, Supabase user id, contracted plan and available credits, purchase date, prompts and generated content. We do not process your card number: payments are handled by Stripe." },
            { title: "3. Purposes", body: "To provide the flyer generation service, manage your account and purchases, prevent abuse and fraud, and comply with legal obligations." },
            { title: "4. Legal basis", body: "Contract performance (account, service and payments), legitimate interest (abuse prevention) and consent (optional cookies)." },
            { title: "5. Processors and third parties", body: "We share data with: Supabase (auth and database), Google Gemini (content generation), Stripe (payments) and Vercel (hosting). All act as processors or joint controllers under contractual safeguards." },
            { title: "6. International transfers", body: "Some providers (Google, Stripe, Vercel) may process data outside the EEA under the European Commission's Standard Contractual Clauses." },
            { title: "7. Retention", body: "We retain your data while your account is active. You can request deletion at any time." },
            { title: "8. Your rights", body: "You can exercise your rights of access, rectification, erasure, objection, restriction and portability by writing to xavicid@gmail.com. You have the right to lodge a complaint with the Spanish Data Protection Agency (www.aepd.es)." },
            { title: "9. Changes", body: "If we amend this policy we will publish the new version on this page." }
          ]
        },
        cookies: {
          title: "Cookie Policy",
          intro: "This page explains which cookies TodoFlyer uses and how you can manage them.",
          sections: [
            { title: "What are cookies?", body: "Small files that websites store in your browser to work properly or remember preferences." },
            { title: "Cookies we use", body: "We use technical cookies required to keep your session (Supabase Auth) and to remember your preferred language. We do not use advertising or third-party tracking cookies." },
            { title: "Optional cookies", body: "If you accept, in the future we may enable analytics cookies to measure aggregate usage and improve the service. They will never be used to identify you personally." },
            { title: "Manage cookies", body: "You can revoke consent at any time by clearing cookies in your browser or by reopening the banner from the footer." }
          ]
        }
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

// Keep <html lang="…"> in sync with the i18n language. This matters for:
//   - Browser translation / reader-mode detection
//   - SEO (search engines read the lang attribute)
//   - Accessibility (screen readers pick the right voice)
const syncHtmlLang = (lng) => {
  if (typeof document === 'undefined') return;
  const short = (lng || 'es').split('-')[0].toLowerCase();
  document.documentElement.lang = short;
};
syncHtmlLang(i18n.language);
i18n.on('languageChanged', syncHtmlLang);

export default i18n;
