
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeScreens } from './store'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configService } from './services/config/configService.ts'
import { useAppStore } from './store'

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
    // Charger la configuration depuis le backend
    const config = await configService.loadConfig();
    console.log('Configuration chargée:', config);
    
    // Mettre à jour l'URL de l'API dans configService
    configService.updateApiBaseUrl({
      baseIpAddress: config.baseIpAddress,
      apiPort: config.apiPort,
      apiIpAddress: config.apiIpAddress,
      useBaseIpForApi: true
    });
    
    // Mettre à jour le store avec les valeurs de configuration
    const store = useAppStore.getState();
    
    if (store.setBaseIpAddress) store.setBaseIpAddress(config.baseIpAddress);
    if (store.setBasePort) store.setBasePort(config.basePort);
    if (store.setApiPort) store.setApiPort(config.apiPort);
    if (store.setApiIpAddress) store.setApiIpAddress(config.apiIpAddress);
    if (store.setConfigPin) store.setConfigPin(config.configPin);
    if (store.setRefreshInterval) store.setRefreshInterval(config.refreshInterval);
    
    // Initialiser les écrans depuis le serveur
    console.log('Initialisation des écrans...');
    await initializeScreens().catch(error => {
      console.error('Erreur lors de l\'initialisation des écrans:', error);
    });
    
    console.log('Écrans initialisés depuis le serveur');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'application:', error);
  }
};

// Rendu initial de l'application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

// Lancer l'initialisation de l'application après le rendu initial
initializeApp();
