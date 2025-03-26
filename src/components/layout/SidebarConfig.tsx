
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Settings } from 'lucide-react';
import { useAppStore } from '@/store';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import PinVerificationDialog from '../config/PinVerificationDialog';

interface SidebarConfigProps {
  isCollapsed: boolean;
}

const SidebarConfig: React.FC<SidebarConfigProps> = ({ isCollapsed }) => {
  const [isPinDialogOpen, setIsPinDialogOpen] = React.useState(false);
  const isConfigMode = useAppStore((state) => state.isConfigMode);
  const isPinVerified = useAppStore((state) => state.isPinVerified);
  const toggleConfigMode = useAppStore((state) => state.toggleConfigMode);
  const resetPinVerification = useAppStore((state) => state.resetPinVerification);
  const navigate = useNavigate();
  const location = useLocation();

  const isOnRestrictedRoute = location.pathname === '/config';

  const handleConfigButtonClick = () => {
    if (isConfigMode) {
      toggleConfigMode();
      resetPinVerification();
      
      if (isOnRestrictedRoute) {
        navigate('/', { replace: true });
        toast({
          title: "Mode configuration désactivé",
          description: "Vous avez été redirigé vers la page d'accueil",
        });
      }
    } else if (!isPinVerified) {
      setIsPinDialogOpen(true);
    } else {
      toggleConfigMode();
    }
  };

  return (
    <>
      <Button 
        variant={isConfigMode ? "default" : "outline"}
        onClick={handleConfigButtonClick} 
        className={cn(
          "w-full justify-start gap-2 transition-all", 
          isCollapsed ? "px-2" : "px-4"
        )}
      >
        {isConfigMode ? <Settings size={18} /> : <Lock size={18} />}
        {!isCollapsed && <span>{isConfigMode ? "Mode Utilisation" : "Mode Configuration"}</span>}
      </Button>
      
      <PinVerificationDialog 
        isOpen={isPinDialogOpen} 
        onClose={() => setIsPinDialogOpen(false)} 
      />
    </>
  );
};

export default SidebarConfig;
