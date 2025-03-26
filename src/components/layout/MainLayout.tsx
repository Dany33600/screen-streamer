
import React from 'react';
import { useAppStore } from '@/store';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme/ThemeProvider';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const isConfigMode = useAppStore((state) => state.isConfigMode);
  const { isDarkMode } = useTheme();

  return (
    <div className={cn("flex min-h-screen bg-background", isDarkMode ? "dark" : "")}>
      <Sidebar />
      <main 
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out p-6 md:p-10",
          isConfigMode ? "bg-background" : "bg-background"
        )}
      >
        <div className="max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
