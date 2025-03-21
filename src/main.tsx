
import { createRoot } from 'react-dom/client';
import { StrictMode, Suspense } from 'react';
import App from './App.tsx';
import './index.css';

// Ajouter un gestionnaire d'erreurs global
const ErrorFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background p-4">
    <div className="text-center">
      <h1 className="mb-4 text-4xl font-bold">Une erreur est survenue</h1>
      <p className="mb-6 text-muted-foreground">
        Nous sommes désolés, une erreur s'est produite lors du chargement de l'application.
        Veuillez vérifier la console pour plus de détails.
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
      >
        Recharger l'application
      </button>
    </div>
  </div>
);

const container = document.getElementById('root');
if (!container) throw new Error("L'élément root n'a pas été trouvé");

const root = createRoot(container);

try {
  root.render(
    <StrictMode>
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Chargement...</div>}>
        <App />
      </Suspense>
    </StrictMode>
  );
} catch (error) {
  console.error("Erreur lors du rendu de l'application:", error);
  root.render(<ErrorFallback />);
}
