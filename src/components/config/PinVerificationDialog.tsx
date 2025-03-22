
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/components/ui/use-toast";
import { useAppStore } from "@/store";
import { LockKeyhole } from "lucide-react";

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
  const verifyPin = useAppStore((state) => state.verifyPin);

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
          <div className="w-full flex justify-center">
            <InputOTP
              maxLength={4}
              value={pin}
              onChange={setPin}
              pattern="[0-9]*"
              inputMode="numeric"
              render={({ slots }) => (
                <InputOTPGroup className="flex justify-center gap-3">
                  {slots.map((slot, i) => (
                    <InputOTPSlot 
                      key={i} 
                      index={i} 
                      className="h-14 w-14 border-2 border-primary rounded-md" 
                    />
                  ))}
                </InputOTPGroup>
              )}
            />
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
