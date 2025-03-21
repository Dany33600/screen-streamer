
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      // Allow external connections for HMR (for screens)
      host: 'localhost',
      port: 8080,
      // Désactiver les pings lorsque la connexion au serveur échoue répétitivement
      clientPort: 8080,
      overlay: false,  // Désactive également l'overlay d'erreur qui peut être gênant
    },
    cors: true, // Enable CORS for all requests
    watch: {
      // Réduire la fréquence des vérifications de changements de fichiers
      usePolling: false, 
      interval: 1000,
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
