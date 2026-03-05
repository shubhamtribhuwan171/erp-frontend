import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyTheme, getInitialTheme } from './lib/theme'

// Apply theme before first paint (prevents flash)
applyTheme(getInitialTheme())

createRoot(document.getElementById('root')!).render(<App />)
