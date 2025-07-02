// src/utils/initAuth.js
import store from '@/store'
import { 
  loadInitialAuthState, 
  forceLogout 
} from '@/store/slices/authSlice'
import { tokenUtils, getAuthToken } from '@/utils/auth' // Importe do auth.js corretamente

export const initializeAuth = () => {
  // 1. Carregar estado inicial do localStorage
  store.dispatch(loadInitialAuthState())
  
  // 2. Configurar verificação periódica do token
  const checkTokenValidity = () => {
    const token = getAuthToken()
    const { auth } = store.getState()
    
    if (auth.isAuthenticated) {
      // Verificar expiração do token usando tokenUtils
      if (token && !tokenUtils.isTokenValid(token)) {
        store.dispatch(forceLogout({ reason: 'token_expired' }))
      }
      
      // Verificar expiração da sessão
      if (auth.sessionExpiry && new Date(auth.sessionExpiry) < new Date()) {
        store.dispatch(forceLogout({ reason: 'session_expired' }))
      }
    }
  }
  
  // Verificar a cada minuto
  const interval = setInterval(checkTokenValidity, 60000)
  
  // Retornar função de limpeza
  return () => clearInterval(interval)
}