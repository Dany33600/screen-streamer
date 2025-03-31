
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
    if (step === 6) {
      setHasCompletedOnboarding(true);
    }
  };
  
  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-background py-6">
      <div className="w-full max-w-3xl px-4 space-y-6 flex flex-col">
        <div className="flex flex-col items-center space-y-3 mb-4">
          <div 
            className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10"
            onClick={handleLogoClick}
            role={step === 6 ? "button" : "presentation"}
            tabIndex={step === 6 ? 0 : -1}
            aria-label="Logo ScreenCast"
            style={{ cursor: 'default' }}
          >
            <MonitorPlay className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-center">
            Configuration de ScreenCast
          </h1>
          <p className="text-muted-foreground text-center text-sm max-w-md">
            Configurons votre application pour diffuser du contenu sur vos écrans.
          </p>
        </div>
        
        <div className="w-full bg-card rounded-lg border shadow-sm p-5 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
        
        <div className="w-full flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            Étape {step} sur {totalSteps}
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 w-8 rounded-full ${i < step ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
