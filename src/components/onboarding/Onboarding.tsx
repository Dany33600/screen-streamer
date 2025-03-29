
import React, { useState } from 'react';
import { useAppStore } from '@/store';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from './OnboardingLayout';
import StepWelcome from './StepWelcome';
import StepNetworkConfig from './StepNetworkConfig';
import StepAdminConfig from './StepAdminConfig';
import StepScreenConfig from './StepScreenConfig';
import StepMenuConfig from './StepMenuConfig';
import StepServerCheck from './StepServerCheck';

const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const setHasCompletedOnboarding = useAppStore((state) => state.setHasCompletedOnboarding);
  
  const totalSteps = 6;
  
  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };
  
  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleComplete = () => {
    console.log('Onboarding terminé, redirection vers le tableau de bord');
    setHasCompletedOnboarding(true);
    // Redirection forcée vers le tableau de bord
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 100);
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepWelcome onNext={handleNext} />;
      case 2:
        return <StepNetworkConfig onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <StepAdminConfig onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <StepScreenConfig onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <StepMenuConfig onNext={handleNext} onBack={handleBack} />;
      case 6:
        return <StepServerCheck onComplete={handleComplete} onBack={handleBack} />;
      default:
        return <StepWelcome onNext={handleNext} />;
    }
  };
  
  return (
    <OnboardingLayout step={currentStep} totalSteps={totalSteps}>
      {renderStep()}
    </OnboardingLayout>
  );
};

export default Onboarding;
