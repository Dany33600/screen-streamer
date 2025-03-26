
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

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

export default NavItem;
