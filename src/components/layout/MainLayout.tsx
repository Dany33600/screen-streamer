
import React from 'react';
import { useAppStore } from '@/store';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const isConfigMode = useAppStore((state) => state.isConfigMode);

  return (
    <div className="flex min-h-screen bg-background">
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
