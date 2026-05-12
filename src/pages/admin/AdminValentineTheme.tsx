import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useValentineSettings } from '@/hooks/useValentineSettings';
import { toast } from 'sonner';
import {
  Loader2, Heart, Eye, EyeOff, Sparkles, CheckCircle2, Palette
} from 'lucide-react';

const AdminValentineTheme = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { settings, loading, updateSettings, isThemeActive } = useValentineSettings();
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Local state for the form, since it's simpler than Ramadan
  const [isEnabled, setIsEnabled] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#ff69b4');

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate('/auth');
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (settings) {
      setIsEnabled(settings.is_enabled);
      setPrimaryColor(settings.primary_color_override || '#ff69b4');
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateSettings({
      is_enabled: isEnabled,
      primary_color_override: primaryColor,
    });

    if (result.success) {
      if (isEnabled) {
        toast.success('💖 Valentine Theme Activated!', {
          description: 'The romantic theme is now live on your store.',
          duration: 5000,
        });
      } else {
        toast.success('Valentine theme disabled.', {
          description: 'Store is back to normal theme.',
        });
      }
    } else {
      toast.error('Failed to save settings. Please try again.');
    }
    setSaving(false);
  };

  const themeCurrentlyActive = isThemeActive();
  const previewActive = previewMode || themeCurrentlyActive;

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) return null;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-pink-600">
              <Heart className="h-7 w-7 text-pink-500 fill-pink-500" />
              Valentine's Day Theme
            </h1>
            <p className="text-muted-foreground mt-1">
              Transform your entire store into a romantic Valentine's Day experience
            </p>
          </div>
          {themeCurrentlyActive && (
            <Badge className="bg-pink-600 text-white gap-1 px-3 py-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Live
            </Badge>
          )}
        </div>

        {/* Status card */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            background: isEnabled
              ? 'linear-gradient(135deg, rgba(255,105,180,0.1), rgba(255,182,193,0.2))'
              : 'rgba(0,0,0,0.03)',
            border: isEnabled
              ? '1px solid rgba(255,105,180,0.3)'
              : '1px solid hsl(var(--border))',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isEnabled
                    ? 'linear-gradient(135deg, #ff1493, #ff69b4)'
                    : 'hsl(var(--muted))',
                }}
              >
                <Heart className={`h-5 w-5 ${isEnabled ? 'text-white fill-white' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="font-semibold text-sm">Valentine Theme Status</p>
                <p className="text-xs text-muted-foreground">
                  {isEnabled ? 'Will be live on your store' : 'Currently disabled'}
                </p>
              </div>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
          </div>
        </div>

        {/* Preview Mode */}
        <div className="grid gap-5">
          <Card className="border-pink-200/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4 text-pink-500" />
                Preview Mode
              </CardTitle>
              <CardDescription>Test how the romantic theme looks without publishing it live.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="border-pink-300/50 text-pink-700 hover:bg-pink-50"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? (
                  <><EyeOff className="h-4 w-4 mr-2" />Exit Preview</>
                ) : (
                  <><Eye className="h-4 w-4 mr-2" />Preview Valentine Theme</>
                )}
              </Button>

              {previewMode && (
                <div className="mt-4 p-3 rounded-lg bg-pink-50 border border-pink-200 text-sm text-pink-700">
                  <strong>Preview active.</strong> The Valentine's theme effects are now visible on this page. Exit preview when done.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Save button */}
        <div className="flex gap-3 pb-8">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            style={{
              background: 'linear-gradient(135deg, #ff1493, #ff69b4)',
              color: 'white',
              border: '1px solid rgba(255,105,180,0.4)',
              fontWeight: 700,
            }}
          >
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" />Save Theme Settings</>
            )}
          </Button>
        </div>
      </div>

      {/* Preview overlay effect */}
      {previewMode && (
        <style>{`
          body::before {
            content: '';
            position: fixed;
            inset: 0;
            background: linear-gradient(135deg, rgba(255,105,180,0.05) 0%, rgba(255,182,193,0.08) 100%);
            pointer-events: none;
            z-index: 0;
          }
          .valentine-theme body {
            font-family: 'Outfit', sans-serif;
          }
        `}</style>
      )}
    </AdminLayout>
  );
};

export default AdminValentineTheme;