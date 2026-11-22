import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css' // cores, fontes e medidas (mude aqui para trocar o tema)
import './styles/base.css' // estilos usados no site todo (cartão, botão, textos)
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
