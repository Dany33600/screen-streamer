
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
  
  // Cette fonction permet de bypasser l'onboarding quand on clique sur le logo
  const handleLogoClick = () => {
    setHasCompletedOnboarding(true);
  };
  
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-3xl px-4 py-8 space-y-8">
        <div className="flex flex-col items-center space-y-4 mb-8">
          <div 
            className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2 cursor-pointer"
            onClick={handleLogoClick}
            role="button"
            tabIndex={0}
            aria-label="Logo ScreenCast"
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
