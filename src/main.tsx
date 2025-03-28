
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configService } from './services/config/configService.ts'

// Initialiser le client de requête
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Fonction d'initialisation de l'application
const initializeApp = async () => {
  try {
    // Import store dynamically to avoid circular dependencies
    const { initializeScreens } = await import('./store');
    
    // Charger la configuration depuis le backend
    await configService.loadConfig();
    console.log('Configuration chargée depuis le serveur');
    
    // Initialiser les écrans depuis le serveur
    await initializeScreens().catch(error => {
      console.error('Erreur lors de l\'initialisation des écrans:', error);
    });
    
    console.log('Écrans initialisés depuis le serveur');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'application:', error);
  }
};

// Lancer l'initialisation de l'application
initializeApp();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
