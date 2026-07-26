// Wails 运行时：提供窗口拖拽（--wails-draggable）、事件与绑定桥接，必须副作用引入
import '@wailsio/runtime'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
