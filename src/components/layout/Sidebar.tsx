import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store';
import { 
  Layers,
  Settings,
  MonitorPlay,
  Film,
  List,
  PlaySquare,
  ChevronLeft,
  ChevronRight,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import PinVerificationDialog from '../config/PinVerificationDialog';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const isConfigMode = useAppStore((state) => state.isConfigMode);
  const isPinVerified = useAppStore((state) => state.isPinVerified);
  const toggleConfigMode = useAppStore((state) => state.toggleConfigMode);
  const resetPinVerification = useAppStore((state) => state.resetPinVerification);
  const navigate = useNavigate();
  const location = useLocation();

  const isOnRestrictedRoute = location.pathname === '/config';

  useEffect(() => {
    if (!isConfigMode && isOnRestrictedRoute) {
      navigate('/', { replace: true });
      toast({
        title: "Mode configuration désactivé",
        description: "Vous avez été redirigé vers la page d'accueil",
      });
    }
  }, [isConfigMode, isOnRestrictedRoute, navigate]);

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
    <div 
      className={cn(
        "h-screen sticky top-0 flex flex-col bg-card border-r transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div className={cn("flex items-center space-x-2", isCollapsed && "justify-center w-full")}>
          <MonitorPlay size={24} className="text-primary" />
          {!isCollapsed && <span className="font-semibold text-xl">ScreenCast</span>}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn("rounded-full", isCollapsed && "hidden")}
        >
          <ChevronLeft size={18} />
        </Button>
        {isCollapsed && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-full absolute -right-3 top-5 bg-card shadow-sm border"
          >
            <ChevronRight size={18} />
          </Button>
        )}
      </div>

      <div className="flex-1 py-6">
        <nav className="space-y-1 px-2">
          <NavItem 
            to="/" 
            icon={<Layers size={20} />} 
            text="Tableau de bord" 
            isCollapsed={isCollapsed} 
          />
          <NavItem 
            to="/screens" 
            icon={<MonitorPlay size={20} />} 
            text="Écrans" 
            isCollapsed={isCollapsed} 
          />
          <NavItem 
            to="/content" 
            icon={<Film size={20} />} 
            text="Contenus" 
            isCollapsed={isCollapsed} 
          />
          <NavItem 
            to="/playlists" 
            icon={<List size={20} />} 
            text="Playlists" 
            isCollapsed={isCollapsed} 
          />
          <NavItem 
            to="/preview" 
            icon={<PlaySquare size={20} />} 
            text="Aperçu" 
            isCollapsed={isCollapsed} 
          />
        </nav>
      </div>

      <div className="mt-auto border-t p-4">
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
      </div>
      
      <PinVerificationDialog 
        isOpen={isPinDialogOpen} 
        onClose={() => setIsPinDialogOpen(false)} 
      />
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, text, isCollapsed }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        cn(
          "flex items-center px-3 py-2 rounded-md transition-all",
          isActive 
            ? "bg-primary/10 text-primary" 
            : "text-foreground/70 hover:bg-muted hover:text-foreground",
          isCollapsed && "justify-center"
        )
      }
    >
      {icon}
      {!isCollapsed && <span className="ml-3">{text}</span>}
    </NavLink>
  );
};

export default Sidebar;
