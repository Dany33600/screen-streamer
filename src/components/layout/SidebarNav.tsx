
import React from 'react';
import NavItem from './NavItem';
import { useAppStore } from '@/store';
import { 
  Layers,
  Settings,
  MonitorPlay,
  Film,
  List,
  PlaySquare,
  Cog
} from 'lucide-react';

interface SidebarNavProps {
  isCollapsed: boolean;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ isCollapsed }) => {
  const isConfigMode = useAppStore((state) => state.isConfigMode);
  const menuOptions = useAppStore((state) => state.menuOptions);

  return (
    <nav className="space-y-1 px-2">
      {menuOptions.dashboard && (
        <NavItem 
          to="/" 
          icon={<Layers size={20} />} 
          text="Tableau de bord" 
          isCollapsed={isCollapsed} 
        />
      )}
      
      {menuOptions.screens && (
        <NavItem 
          to="/screens" 
          icon={<MonitorPlay size={20} />} 
          text="Écrans" 
          isCollapsed={isCollapsed} 
        />
      )}
      
      {menuOptions.content && (
        <NavItem 
          to="/content" 
          icon={<Film size={20} />} 
          text="Contenus" 
          isCollapsed={isCollapsed} 
        />
      )}
      
      {menuOptions.playlists && (
        <NavItem 
          to="/playlists" 
          icon={<List size={20} />} 
          text="Playlists" 
          isCollapsed={isCollapsed} 
        />
      )}
      
      {menuOptions.preview && (
        <NavItem 
          to="/preview" 
          icon={<PlaySquare size={20} />} 
          text="Aperçu" 
          isCollapsed={isCollapsed} 
        />
      )}
      
      {isConfigMode && (
        <NavItem 
          to="/config" 
          icon={<Cog size={20} />} 
          text="Configuration" 
          isCollapsed={isCollapsed} 
        />
      )}
    </nav>
  );
};

export default SidebarNav;
