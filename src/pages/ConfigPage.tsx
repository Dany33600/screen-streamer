
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useAppStore } from '@/store';
import { Settings, Network, MonitorPlay, Bug } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { GeneralSettings } from '@/components/config/GeneralSettings';
import { NetworkSettings } from '@/components/config/NetworkSettings';
import { ScreenSettings } from '@/components/config/ScreenSettings';
import { DebugSettings } from '@/components/config/DebugSettings';

const ConfigPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isConfigMode = useAppStore((state) => state.isConfigMode);
  const [activeTab, setActiveTab] = useState<string>("general");
  
  useEffect(() => {
    if (!isConfigMode) {
      console.log("Redirecting: Not in config mode");
      navigate('/', { replace: true });
      toast({
        title: "Accès restreint",
        description: "Vous devez être en mode configuration pour accéder à cette page",
        variant: "destructive",
      });
    }
  }, [isConfigMode, navigate]);

  useEffect(() => {
    if (!isConfigMode && activeTab === "network") {
      setActiveTab("general");
    }
  }, [isConfigMode, activeTab]);
  
  useEffect(() => {
    const checkAccess = () => {
      if (!isConfigMode && window.location.pathname === '/config') {
        console.log("URL check redirecting to home");
        navigate('/', { replace: true });
      }
    };
    
    checkAccess();
    window.addEventListener('popstate', checkAccess);
    
    return () => {
      window.removeEventListener('popstate', checkAccess);
    };
  }, [isConfigMode, navigate]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (!isConfigMode) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Paramètres de l'application et des écrans
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList>
            <TabsTrigger value="general" className="gap-2">
              <Settings size={16} />
              Général
            </TabsTrigger>
            
            <TabsTrigger value="network" className="gap-2">
              <Network size={16} />
              Réseau
            </TabsTrigger>
            
            <TabsTrigger value="screens" className="gap-2">
              <MonitorPlay size={16} />
              Écrans
            </TabsTrigger>
            
            <TabsTrigger value="debug" className="gap-2">
              <Bug size={16} />
              Debug
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <GeneralSettings />
          </TabsContent>
          
          <TabsContent value="network" className="space-y-4">
            <NetworkSettings />
          </TabsContent>
          
          <TabsContent value="screens" className="space-y-4">
            <ScreenSettings />
          </TabsContent>
          
          <TabsContent value="debug" className="space-y-4">
            <DebugSettings />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ConfigPage;
