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
    if (lowerMessage.includes('network')) {
      return 'Network error. Please check your connection and try again.';
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

  const renderLoginSignupForm = () => (
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
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            Please wait...
          </div>
        ) : mode === 'signup' ? (
          'Create Account'
        ) : (
          'Login'
        )}
      </Button>
    </form>
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
