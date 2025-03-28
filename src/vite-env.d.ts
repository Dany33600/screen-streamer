
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONFIG_PIN: string;
  // Ajoutez d'autres variables d'environnement ici si nécessaire
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
