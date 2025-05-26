import React from 'react'
import ReactDOM from 'react-dom/client'

import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

import { Toaster } from 'react-hot-toast'

import App from './App.jsx'
import { store } from './store/index.js'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              fontFamily: 'Inter, Noto Sans KR, sans-serif',
            },
            success: {
              duration: 3000,
              style: {
                background: '#22c55e',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)