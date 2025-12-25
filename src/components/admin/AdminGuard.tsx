import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Shield, Home, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const handleContactOwner = () => {
    window.open('https://wa.me/916207142994', '_blank');
  };

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not admin, show restricted access page
  if (!user || !isAdmin) {
    return (
      <>
        <Helmet>
          <meta name="robots" content="noindex, nofollow" />
          <title>Restricted Access | Graphic Wala</title>
        </Helmet>
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-destructive" />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-foreground">
                Restricted Access
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                This admin panel is private.<br />
                Only the website owner is allowed to log in and manage the store.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                onClick={() => navigate('/')}
                variant="default"
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go to Home
              </Button>
              <Button
                onClick={handleContactOwner}
                variant="outline"
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Contact Owner
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Admin user - render children
  return <>{children}</>;
};

export default AdminGuard;
