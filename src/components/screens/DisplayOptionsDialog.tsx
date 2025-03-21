
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Content } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DisplayOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: Content | undefined;
  onConfirm: (displayOptions: any) => void;
  initialOptions?: any;
}

const DisplayOptionsDialog: React.FC<DisplayOptionsDialogProps> = ({
  open,
  onOpenChange,
  content,
  onConfirm,
  initialOptions = {}
}) => {
  const [options, setOptions] = useState<any>({
    // Vidéo options
    autoplay: true,
    loop: true,
    controls: true,
    muted: true,
    fullscreen: false,
    
    // Image options
    interval: 5000,
    
    // PowerPoint options
    autoSlide: 5000,
    powerPointLoop: true
  });
  
  // Load initial options when dialog opens
  useEffect(() => {
    if (open && initialOptions) {
      setOptions(prev => ({
        ...prev,
        ...initialOptions
      }));
    }
  }, [open, initialOptions]);
  
  if (!content) return null;
  
  const handleConfirm = () => {
    onConfirm(options);
    onOpenChange(false);
  };
  
  const getTabFromContentType = () => {
    switch(content.type) {
      case 'video': return 'video';
      case 'image': return 'image';
      case 'powerpoint': return 'powerpoint';
      case 'pdf': return 'pdf';
      default: return 'general';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Options d'affichage</DialogTitle>
          <DialogDescription>
            Configurez les paramètres d'affichage pour {content.name}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={getTabFromContentType()} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            {content.type === 'video' && <TabsTrigger value="video">Vidéo</TabsTrigger>}
            {content.type === 'image' && <TabsTrigger value="image">Image</TabsTrigger>}
            {content.type === 'powerpoint' && <TabsTrigger value="powerpoint">PowerPoint</TabsTrigger>}
            {content.type === 'pdf' && <TabsTrigger value="pdf">PDF</TabsTrigger>}
            <TabsTrigger value="general">Général</TabsTrigger>
          </TabsList>
          
          {content.type === 'video' && (
            <TabsContent value="video" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="autoplay" 
                  checked={options.autoplay} 
                  onCheckedChange={(checked) => 
                    setOptions({...options, autoplay: checked})
                  }
                />
                <Label htmlFor="autoplay">Lecture automatique</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="loop" 
                  checked={options.loop} 
                  onCheckedChange={(checked) => 
                    setOptions({...options, loop: checked})
                  }
                />
                <Label htmlFor="loop">Lecture en boucle</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="controls" 
                  checked={options.controls} 
                  onCheckedChange={(checked) => 
                    setOptions({...options, controls: checked})
                  }
                />
                <Label htmlFor="controls">Afficher les contrôles</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="muted" 
                  checked={options.muted} 
                  onCheckedChange={(checked) => 
                    setOptions({...options, muted: checked})
                  }
                />
                <Label htmlFor="muted">Couper le son</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="fullscreen" 
                  checked={options.fullscreen} 
                  onCheckedChange={(checked) => 
                    setOptions({...options, fullscreen: checked})
                  }
                />
                <Label htmlFor="fullscreen">Démarrer en plein écran</Label>
              </div>
            </TabsContent>
          )}
          
          {content.type === 'image' && (
            <TabsContent value="image" className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="interval">Intervalle (ms)</Label>
                <Input
                  id="interval"
                  type="number"
                  min="1000"
                  step="1000"
                  value={options.interval}
                  onChange={(e) => setOptions({...options, interval: parseInt(e.target.value)})}
                />
                <p className="text-xs text-muted-foreground">
                  Intervalle de temps pour le diaporama (en millisecondes)
                </p>
              </div>
            </TabsContent>
          )}
          
          {content.type === 'powerpoint' && (
            <TabsContent value="powerpoint" className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="autoSlide">Temps par diapositive (ms)</Label>
                <Input
                  id="autoSlide"
                  type="number"
                  min="1000"
                  step="1000"
                  value={options.autoSlide}
                  onChange={(e) => setOptions({...options, autoSlide: parseInt(e.target.value)})}
                />
                <p className="text-xs text-muted-foreground">
                  Temps d'affichage de chaque diapositive (en millisecondes)
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="powerPointLoop" 
                  checked={options.powerPointLoop} 
                  onCheckedChange={(checked) => 
                    setOptions({...options, powerPointLoop: checked})
                  }
                />
                <Label htmlFor="powerPointLoop">Lecture en boucle</Label>
              </div>
            </TabsContent>
          )}
          
          {content.type === 'pdf' && (
            <TabsContent value="pdf" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Aucune option spécifique disponible pour les PDF.
              </p>
            </TabsContent>
          )}
          
          <TabsContent value="general" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Options générales pour tout type de contenu.
              Actuellement aucune option générale n'est disponible.
            </p>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleConfirm}>
            Appliquer et démarrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DisplayOptionsDialog;
