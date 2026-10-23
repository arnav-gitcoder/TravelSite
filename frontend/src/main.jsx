import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const rootElement = document.getElementById('root')

const showStartupError = (error) => {
  if (!rootElement) return

  const message = error?.message || String(error)
  rootElement.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8fafc;padding:24px;font-family:Inter,Arial,sans-serif;">
      <div style="max-width:640px;width:100%;background:white;border:1px solid #fee2e2;border-radius:16px;padding:28px;box-shadow:0 20px 45px rgba(15,23,42,.12);">
        <p style="margin:0 0 8px;color:#dc2626;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">Application error</p>
        <h1 style="margin:0 0 12px;color:#0f172a;font-size:24px;">The app failed to start.</h1>
        <p style="margin:0 0 18px;color:#475569;">This message is shown instead of a blank white page so the crash can be fixed quickly.</p>
        <pre style="margin:0;white-space:pre-wrap;overflow:auto;background:#0f172a;color:white;border-radius:12px;padding:16px;font-size:12px;">${message}</pre>
      </div>
    </div>
  `
}

try {
  if (!rootElement) {
    throw new Error('Root element #root was not found in index.html')
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} catch (error) {
  showStartupError(error)
}
