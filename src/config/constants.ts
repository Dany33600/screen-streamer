
// Configuration par défaut partagée entre le client et le serveur
// Ces valeurs seront utilisées uniquement si le fichier de configuration JSON n'est pas disponible

// Port sur lequel le serveur API sera accessible
export const API_PORT = 5070;

// Adresse IP par défaut pour le serveur
export const DEFAULT_IP_ADDRESS = '192.168.0.14';

// Adresse IP par défaut pour le serveur API
export const DEFAULT_API_IP_ADDRESS = '192.168.0.14';

// Port de base par défaut pour les écrans
export const DEFAULT_BASE_PORT = 5550;

// Code PIN par défaut pour l'accès admin
export const DEFAULT_PIN = '1234';

// Intervalle de rafraîchissement par défaut (en minutes)
export const DEFAULT_REFRESH_INTERVAL = 1;

// Constante pour forcer le redémarrage de l'onboarding
// Mettre à true pour forcer le redémarrage de l'onboarding
export const FORCE_ONBOARDING = false; // Désactivé par défaut, activé dans la configuration JSON si nécessaire
