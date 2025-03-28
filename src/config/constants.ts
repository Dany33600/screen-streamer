
// Configuration partagée entre le client et le serveur

// Port sur lequel le serveur API sera accessible
export const API_PORT = parseInt(process.env.API_PORT || '5070', 10);

// Adresse IP par défaut pour le serveur
export const DEFAULT_IP_ADDRESS = process.env.SERVER_IP || '192.168.0.14';

// Adresse IP par défaut pour le serveur API
export const DEFAULT_API_IP_ADDRESS = process.env.API_IP || '192.168.0.14';

// Port de base par défaut pour les écrans
export const DEFAULT_BASE_PORT = parseInt(process.env.BASE_PORT || '5550', 10);

// Code PIN par défaut pour l'accès admin
export const DEFAULT_PIN = process.env.CONFIG_PIN || '1234';

// Intervalle de rafraîchissement par défaut (en minutes)
export const DEFAULT_REFRESH_INTERVAL = parseInt(process.env.REFRESH_INTERVAL || '1', 10);

// Constante pour forcer le redémarrage de l'onboarding
// Mettre à true pour forcer le redémarrage de l'onboarding
export const FORCE_ONBOARDING = process.env.FORCE_ONBOARDING === 'true' ? true : false;

// Autres constantes globales peuvent être ajoutées ici
