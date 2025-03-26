
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store';
import { 
  MonitorPlay,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import SidebarNav from './SidebarNav';
import SidebarConfig from './SidebarConfig';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const isConfigMode = useAppStore((state) => state.isConfigMode);
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
        <SidebarNav isCollapsed={isCollapsed} />
      </div>

      <div className="mt-auto border-t p-4">
        <SidebarConfig isCollapsed={isCollapsed} />
      </div>
    </div>
  );
};

export default Sidebar;
