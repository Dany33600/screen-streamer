
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeScreens } from './store'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Initialiser le client de requête
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Deferring initialization to ensure store is available first
setTimeout(() => {
  // Initialiser les écrans depuis le serveur
  initializeScreens().then(() => {
    console.log('Écrans initialisés depuis le serveur');
  }).catch(error => {
    console.error('Erreur lors de l\'initialisation des écrans:', error);
  });
}, 0);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
