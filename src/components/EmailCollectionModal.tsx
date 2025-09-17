import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface EmailCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmailCollectionModal = ({ isOpen, onClose }: EmailCollectionModalProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error("Por favor ingresa un email válido");
      return;
    }

    setIsSubmitting(true);
    
    // Here you would typically send the email to your backend
    // For now, we'll just show a success message
    setTimeout(() => {
      toast.success("¡Gracias! Te contactaremos pronto con tu curso gratuito");
      setEmail("");
      setIsSubmitting(false);
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-montserrat text-xl text-center">
            ¡Obtén tu primer curso gratis!
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Button 
              type="submit" 
              className="w-full bg-pixel-dark text-white hover:bg-pixel-orange"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "¡Quiero mi curso gratis!"}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={onClose}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmailCollectionModal;