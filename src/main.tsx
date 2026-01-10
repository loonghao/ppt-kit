import React from 'react'
import ReactDOM from 'react-dom/client'
import { FluentProvider, webLightTheme } from '@fluentui/react-components'
import App from './App'
import './index.css'

// Office.js initialization
Office.onReady((info) => {
  if (info.host === Office.HostType.PowerPoint) {
    console.log('PPT-KIT loaded in PowerPoint')
  }
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <FluentProvider theme={webLightTheme}>
        <App />
      </FluentProvider>
    </React.StrictMode>,
  )
})
