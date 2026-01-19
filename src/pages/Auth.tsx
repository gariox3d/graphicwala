import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Info, Mail, Lock, User, ArrowLeft, Chrome } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isSignUp = searchParams.get('mode') === 'signup';
  const isReset = searchParams.get('type') === 'recovery';
  
  const [mode, setMode] = useState<AuthMode>(
    isReset ? 'reset-password' : isSignUp ? 'signup' : 'login'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { user, signIn, signUp, loading: authLoading } = useAuth();

  // Handle redirect after login
  useEffect(() => {
    if (user && mode !== 'reset-password') {
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate, mode]);

  // Handle password reset mode from URL
  useEffect(() => {
    if (isReset) {
      setMode('reset-password');
    }
  }, [isReset]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user && mode !== 'reset-password') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password.length < 6) {
          toast({ title: 'Password too short', description: 'Password must be at least 6 characters', variant: 'destructive' });
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          const friendlyMessage = getFriendlyErrorMessage(error.message);
          toast({ title: 'Sign Up Failed', description: friendlyMessage, variant: 'destructive' });
        } else {
          toast({ title: 'Account Created!', description: 'Welcome to Graphic Wala!' });
        }
      } else if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          const friendlyMessage = getFriendlyErrorMessage(error.message);
          toast({ title: 'Login Failed', description: friendlyMessage, variant: 'destructive' });
        }
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });

      if (error) {
        toast({ title: 'Error', description: getFriendlyErrorMessage(error.message), variant: 'destructive' });
      } else {
        toast({ 
          title: 'Reset Email Sent!', 
          description: 'Check your email for a password reset link. It may take a few minutes.',
        });
        setMode('login');
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', description: 'Please make sure both passwords are the same.', variant: 'destructive' });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast({ title: 'Password too short', description: 'Password must be at least 6 characters', variant: 'destructive' });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast({ title: 'Error', description: getFriendlyErrorMessage(error.message), variant: 'destructive' });
      } else {
        toast({ title: 'Password Updated!', description: 'Your password has been reset successfully.' });
        navigate('/dashboard');
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        toast({ title: 'Google Login Failed', description: getFriendlyErrorMessage(error.message), variant: 'destructive' });
        setGoogleLoading(false);
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Something went wrong with Google login.', variant: 'destructive' });
      setGoogleLoading(false);
    }
  };

  const getFriendlyErrorMessage = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('invalid login credentials')) {
      return 'Incorrect email or password. Please try again.';
    }
    if (lowerMessage.includes('email not confirmed')) {
      return 'Please check your email and confirm your account first.';
    }
    if (lowerMessage.includes('user already registered')) {
      return 'An account with this email already exists. Try logging in instead.';
    }
    if (lowerMessage.includes('password')) {
      return 'Password must be at least 6 characters long.';
    }
    if (lowerMessage.includes('rate limit')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }
    if (lowerMessage.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }
    return message;
  };

  const renderForm = () => {
    if (mode === 'forgot-password') {
      return (
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <button
            type="button"
            onClick={() => setMode('login')}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary w-full mt-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </button>
        </form>
      );
    }

    if (mode === 'reset-password') {
      return (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading ? 'Updating...' : 'Reset Password'}
          </Button>
        </form>
      );
    }

    return (
      <>
        {/* Google Login Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full mb-4 h-12 text-base font-medium border-2 hover:bg-muted/50"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setMode('forgot-password')}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" variant="hero" className="w-full h-12 text-base font-medium" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Login'}
          </Button>
        </form>
      </>
    );
  };

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Create Account';
      case 'forgot-password': return 'Reset Password';
      case 'reset-password': return 'Set New Password';
      default: return 'Welcome Back';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signup': return 'Join Graphic Wala for a premium experience';
      case 'forgot-password': return "Enter your email and we'll send you a reset link";
      case 'reset-password': return 'Choose a strong password for your account';
      default: return 'Login to access your orders and designs';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-brand p-8 border border-border">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground">{getTitle()}</h1>
              <p className="text-sm text-muted-foreground mt-1">{getSubtitle()}</p>
            </div>

            {/* Helper text for login/signup */}
            {(mode === 'login' || mode === 'signup') && (
              <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg mb-6">
                <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Login is required for photo upload, order tracking, and reviews. Takes less than 30 seconds.
                </p>
              </div>
            )}

            {/* Form Content */}
            {renderForm()}

            {/* Toggle Login/Signup */}
            {(mode === 'login' || mode === 'signup') && (
              <p className="text-center text-sm text-muted-foreground mt-6">
                {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                  className="text-primary font-semibold hover:underline"
                >
                  {mode === 'signup' ? 'Login' : 'Sign Up'}
                </button>
              </p>
            )}
          </div>

          {/* Trust Badge */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            🔒 Your data is secure with us
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
