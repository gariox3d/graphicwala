import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Info, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';

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
      // Always show success message to prevent email enumeration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });

      // Don't reveal if email exists or not - always show success
      toast({ 
        title: 'Check Your Email', 
        description: 'If an account exists with this email, you will receive a password reset link shortly.',
      });
      setMode('login');
    } catch (err) {
      // Still show success to prevent enumeration
      toast({ 
        title: 'Check Your Email', 
        description: 'If an account exists with this email, you will receive a password reset link shortly.',
      });
      setMode('login');
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
        toast({ title: 'Password Updated!', description: 'Your password has been reset successfully. You are now logged in.' });
        navigate('/dashboard');
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    }

    setLoading(false);
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
      return 'Too many attempts. Please wait a few minutes and try again.';
    }
    if (lowerMessage.includes('failed to fetch') || lowerMessage.includes('network')) {
      return 'Server se connection nahi ban pa raha. Thodi der baad dubara try karein.';
    }
    return message;
  };

  const renderForgotPasswordForm = () => (
    <form onSubmit={handleForgotPassword} className="space-y-4">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you a secure link to reset your password.
        </p>
      </div>

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

      <Button type="submit" variant="hero" className="w-full h-12" disabled={loading}>
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            Sending...
          </div>
        ) : (
          'Send Reset Link'
        )}
      </Button>

      <button
        type="button"
        onClick={() => setMode('login')}
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary w-full mt-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Login
      </button>
    </form>
  );

  const renderResetPasswordForm = () => (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Lock className="h-8 w-8 text-green-600" />
        </div>
        <p className="text-sm text-muted-foreground">
          Create a strong new password for your account.
        </p>
      </div>

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
        <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
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

      <Button type="submit" variant="hero" className="w-full h-12" disabled={loading}>
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            Updating...
          </div>
        ) : (
          'Reset Password'
        )}
      </Button>
    </form>
  );

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast({ title: 'Google Sign-In Failed', description: error.message, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Something went wrong with Google sign-in.', variant: 'destructive' });
    }
    setLoading(false);
  };

  const renderLoginSignupForm = () => (
    <div className="space-y-4">
      {/* Google Sign-In Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 text-base font-medium gap-3"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>

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
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
              Please wait...
            </div>
          ) : mode === 'signup' ? (
            'Create Account'
          ) : (
            'Login'
          )}
        </Button>
      </form>
    </div>
  );

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Create Account';
      case 'forgot-password': return 'Forgot Password?';
      case 'reset-password': return 'Set New Password';
      default: return 'Welcome Back';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signup': return 'Join Graphic Wala for a premium experience';
      case 'forgot-password': return "No worries, we'll help you recover it";
      case 'reset-password': return 'Almost there! Create your new password';
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
            {mode === 'forgot-password' && renderForgotPasswordForm()}
            {mode === 'reset-password' && renderResetPasswordForm()}
            {(mode === 'login' || mode === 'signup') && renderLoginSignupForm()}

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
