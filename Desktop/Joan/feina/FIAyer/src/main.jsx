// AFEGEIX AQUESTA IMPORTACIÓ A DALT DE TOT
import { useTranslation } from 'react-i18next';

function Header() {
  // AQUESTA LÍNIA ÉS LA QUE T'ESTÀ FALTANT:
  const { t, i18n } = useTranslation(); 

  // Ara ja pots fer servir "i18n.changeLanguage" sense que peti
  return (
    <button onClick={() => i18n.changeLanguage('ca')}>
      {t('header.lang')}
    </button>
  );
}
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
