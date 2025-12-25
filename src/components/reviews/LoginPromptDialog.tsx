import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, Info } from 'lucide-react';

interface LoginPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

const LoginPromptDialog: React.FC<LoginPromptDialogProps> = ({
  open,
  onOpenChange,
  title = "Login Required",
  description = "Please login to continue. This helps us track your orders and reviews."
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleEmailLogin = () => {
    // Store current path for redirect after login
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    onOpenChange(false);
    navigate('/auth');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>
        
        {/* Helper text */}
        <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Login is required for photo upload, order tracking, and reviews. Takes less than 30 seconds.
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <Button onClick={handleEmailLogin} className="w-full h-12">
            <Mail className="mr-2 h-5 w-5" />
            Continue with Email
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPromptDialog;