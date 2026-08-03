import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initClarity } from '@/lib/analytics/clarity'

// Initialize Microsoft Clarity Analytics if configured
initClarity()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
