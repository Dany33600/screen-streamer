
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useAppStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, MonitorPlay, Film, Settings, List, PlusCircle } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const screens = useAppStore((state) => state.screens);
  const contents = useAppStore((state) => state.contents);
  const playlists = useAppStore((state) => state.playlists);
  const isConfigMode = useAppStore((state) => state.isConfigMode);

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos écrans, contenus et playlists
            </p>
          </div>
          {isConfigMode && (
            <Button onClick={() => navigate('/screens/add')} className="gap-2">
              <PlusCircle size={16} />
              Ajouter un écran
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Écrans" 
            value={screens.length.toString()} 
            description="Écrans configurés"
            icon={<MonitorPlay className="text-blue-500" />}
            onClick={() => navigate('/screens')}
          />
          <StatsCard 
            title="Contenus" 
            value={contents.length.toString()} 
            description="Fichiers importés"
            icon={<Film className="text-emerald-500" />}
            onClick={() => navigate('/content')}
          />
          <StatsCard 
            title="Playlists" 
            value={playlists.length.toString()} 
            description="Playlists créées"
            icon={<List className="text-purple-500" />}
            onClick={() => navigate('/playlists')}
          />
          <StatsCard 
            title="Configuration" 
            value={isConfigMode ? "Activé" : "Désactivé"} 
            description="Mode de l'application"
            icon={<Settings className="text-amber-500" />}
            onClick={() => navigate('/config')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Écrans récents</CardTitle>
              <CardDescription>État des écrans configurés</CardDescription>
            </CardHeader>
            <CardContent>
              {screens.length > 0 ? (
                <div className="space-y-4">
                  {screens.slice(0, 3).map((screen) => (
                    <div key={screen.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${screen.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div>
                          <p className="font-medium">{screen.name}</p>
                          <p className="text-sm text-muted-foreground">{screen.ipAddress}:{screen.port}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/screens/${screen.id}`)}>
                        Détails
                      </Button>
                    </div>
                  ))}
                  {screens.length > 3 && (
                    <Button variant="link" className="w-full" onClick={() => navigate('/screens')}>
                      Voir tous les écrans
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <MonitorPlay size={48} className="text-muted-foreground" />
                  <p className="text-muted-foreground">Aucun écran configuré</p>
                  {isConfigMode && (
                    <Button variant="outline" onClick={() => navigate('/screens/add')}>
                      Ajouter un écran
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contenus récents</CardTitle>
              <CardDescription>Derniers fichiers importés</CardDescription>
            </CardHeader>
            <CardContent>
              {contents.length > 0 ? (
                <div className="space-y-4">
                  {contents.slice(0, 5).map((content) => (
                    <div key={content.id} className="flex items-center gap-3 p-2">
                      {content.type === 'image' ? (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                          <img src={content.url} alt={content.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                          <Film size={20} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{content.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {contents.length > 5 && (
                    <Button variant="link" className="w-full" onClick={() => navigate('/content')}>
                      Voir tous les contenus
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Film size={48} className="text-muted-foreground" />
                  <p className="text-muted-foreground">Aucun contenu importé</p>
                  <Button variant="outline" onClick={() => navigate('/content')}>
                    Importer un contenu
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, description, icon, onClick }) => {
  return (
    <Card className="hover-scale cursor-pointer" onClick={onClick}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="p-2 border rounded-md">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Index;
