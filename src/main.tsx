import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ThemeProvider from './components/ThemeProvider'
import './index.css'

// Office.js initialization
Office.onReady((info) => {
  if (info.host === Office.HostType.PowerPoint) {
    console.log('PPT-KIT loaded in PowerPoint')
  }
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </React.StrictMode>,
  )
})
