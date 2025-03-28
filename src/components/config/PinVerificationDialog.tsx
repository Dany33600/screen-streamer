
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useAppStore } from "@/store";
import { LockKeyhole, Eye, EyeOff } from "lucide-react";

interface PinVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const PinVerificationDialog: React.FC<PinVerificationDialogProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [pin, setPin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const verifyPin = useAppStore((state) => state.verifyPin);

  // Reset PIN when dialog closes for security
  useEffect(() => {
    if (!isOpen) {
      setPin("");
      setShowPin(false);
    }
  }, [isOpen]);

  const handleVerify = () => {
    setIsVerifying(true);
    
    setTimeout(() => {
      const isValid = verifyPin(pin);
      
      if (isValid) {
        toast({
          title: "Accès autorisé",
          description: "Mode configuration activé",
        });
        onClose();
      } else {
        toast({
          title: "Code PIN incorrect",
          description: "Veuillez réessayer",
          variant: "destructive",
        });
        setPin("");
      }
      
      setIsVerifying(false);
    }, 500);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and limit to 4 digits
    if (/^\d*$/.test(value) && value.length <= 4) {
      setPin(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && pin.length === 4) {
      handleVerify();
    }
  };

  const togglePinVisibility = () => {
    setShowPin(!showPin);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LockKeyhole className="size-5" />
            Mode Configuration
          </DialogTitle>
          <DialogDescription>
            Veuillez entrer le code PIN à 4 chiffres pour accéder au mode configuration.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-full flex justify-center relative">
            <Input
              type={showPin ? "text" : "password"}
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={handlePinChange}
              onKeyDown={handleKeyDown}
              className="text-center text-2xl font-bold h-14 max-w-[200px] bg-white dark:bg-gray-800"
              placeholder="••••"
              autoFocus
            />
            <button 
              type="button"
              onClick={togglePinVisibility}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
              aria-label={showPin ? "Cacher le PIN" : "Afficher le PIN"}
            >
              {showPin ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>

          <Button 
            className="mt-4 w-full" 
            onClick={handleVerify}
            disabled={pin.length !== 4 || isVerifying}
          >
            {isVerifying ? "Vérification..." : "Valider"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PinVerificationDialog;
