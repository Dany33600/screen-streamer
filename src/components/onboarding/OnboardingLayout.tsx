
import React, { ReactNode } from 'react';
import { MonitorPlay } from 'lucide-react';
import { useAppStore } from '@/store';

interface OnboardingLayoutProps {
  children: ReactNode;
  step: number;
  totalSteps: number;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  step,
  totalSteps
}) => {
  const setHasCompletedOnboarding = useAppStore((state) => state.setHasCompletedOnboarding);
  const hasAttemptedServerCheck = useAppStore((state) => state.hasAttemptedServerCheck);
  
  // Cette fonction permet de bypasser l'onboarding quand on clique sur le logo
  // mais seulement si on a déjà tenté de vérifier la connexion au serveur au moins une fois
  const handleLogoClick = () => {
    if (step === 6 && hasAttemptedServerCheck) {
      setHasCompletedOnboarding(true);
    }
  };
  
  // Détermine si le logo est cliquable - s'assurer qu'on est bien sur la dernière étape ET que la vérification a été tentée
  const isLogoClickable = step === 6 && hasAttemptedServerCheck;
  
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-3xl px-4 py-8 space-y-8">
        <div className="flex flex-col items-center space-y-4 mb-8">
          <div 
            className={`flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2 ${
              isLogoClickable ? 'cursor-pointer hover:bg-primary/20 transition-colors' : ''
            }`}
            onClick={isLogoClickable ? handleLogoClick : undefined}
            role={isLogoClickable ? "button" : "presentation"}
            tabIndex={isLogoClickable ? 0 : -1}
            aria-label={isLogoClickable ? "Accéder au dashboard sans serveur" : "Logo ScreenCast"}
            title={isLogoClickable ? "Cliquez pour accéder au dashboard sans serveur" : "Logo ScreenCast"}
          >
            <MonitorPlay className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-center">
            Configuration de ScreenCast
          </h1>
          <p className="text-muted-foreground text-center max-w-md">
            Configurons votre application pour diffuser du contenu sur vos écrans.
          </p>
        </div>
        
        <div className="w-full bg-card rounded-lg border shadow-sm p-6">
          {children}
        </div>
        
        <div className="w-full flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Étape {step} sur {totalSteps}
          </div>
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div 
                key={i} 
                className={`h-2 w-10 rounded-full ${i < step ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
