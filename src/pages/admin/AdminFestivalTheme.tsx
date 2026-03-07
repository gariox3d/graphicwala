import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useFestivalSettings } from '@/hooks/useFestivalSettings';
import { useAdminDraftState } from '@/hooks/useAdminDraftState';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Loader2, Moon, Calendar, Eye, EyeOff, Upload, Clock,
  Sparkles, CheckCircle2, Palette, AlignLeft, ImageIcon, X
} from 'lucide-react';
import EidCountdown from '@/components/festival/EidCountdown';

const AdminFestivalTheme = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { settings, loading, updateSettings, isThemeActive } = useFestivalSettings();
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const createInitialForm = useCallback(() => ({
    is_enabled: false,
    start_date: '',
    end_date: '',
    greeting_text: '🌙 Ramadan Mubarak! May this holy month bring peace and blessings to you and your family.',
    show_countdown: true,
    auto_enable_by_date: false,
    banner_image_url: '',
    primary_color_override: '#d4a017',
  }), []);

  const {
    state: form,
    setState: setForm,
    initializeFromServer,
    clearDraft,
  } = useAdminDraftState('admin:festival-theme:draft:v1', createInitialForm);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate('/auth');
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (settings) {
      initializeFromServer({
        is_enabled: settings.is_enabled,
        start_date: settings.start_date || '',
        end_date: settings.end_date || '',
        greeting_text: settings.greeting_text || '',
        show_countdown: settings.show_countdown,
        auto_enable_by_date: settings.auto_enable_by_date,
        banner_image_url: settings.banner_image_url || '',
        primary_color_override: settings.primary_color_override || '#d4a017',
      });
    }
  }, [settings, initializeFromServer]);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateSettings({
      is_enabled: form.is_enabled,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      greeting_text: form.greeting_text,
      show_countdown: form.show_countdown,
      auto_enable_by_date: form.auto_enable_by_date,
      banner_image_url: form.banner_image_url || null,
      primary_color_override: form.primary_color_override,
    });

    if (result.success) {
      clearDraft();
      if (form.is_enabled) {
        toast.success('🌙 Ramadan Theme Activated Successfully!', {
          description: 'The festival theme is now live on your store.',
          duration: 5000,
        });
      } else {
        toast.success('Festival theme settings saved.', {
          description: 'Theme is currently disabled.',
        });
      }
    } else {
      toast.error('Failed to save settings. Please try again.');
    }
    setSaving(false);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `festival/ramadan-banner-${Date.now()}.${ext}`;

    const { error, data } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: true });

    if (!error && data) {
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
      setForm(f => ({ ...f, banner_image_url: urlData.publicUrl }));
      toast.success('Banner image uploaded successfully.');
    } else {
      toast.error('Upload failed. Please try again.');
    }
    setUploading(false);
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
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Moon className="h-7 w-7 text-amber-500" />
              Festival Theme Manager
            </h1>
            <p className="text-muted-foreground mt-1">
              Control Ramadan and festival themes across your entire store
            </p>
          </div>
          {themeCurrentlyActive && (
            <Badge className="bg-emerald-600 text-white gap-1 px-3 py-1">
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
            background: form.is_enabled
              ? 'linear-gradient(135deg, rgba(10,40,20,0.08), rgba(212,160,23,0.06))'
              : 'rgba(0,0,0,0.03)',
            border: form.is_enabled
              ? '1px solid rgba(212,160,23,0.3)'
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
                  background: form.is_enabled
                    ? 'linear-gradient(135deg, #0a2814, #1a4a28)'
                    : 'hsl(var(--muted))',
                }}
              >
                <Moon className={`h-5 w-5 ${form.is_enabled ? 'text-amber-400' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="font-semibold text-sm">Ramadan Theme</p>
                <p className="text-xs text-muted-foreground">
                  {form.is_enabled ? 'Will be live on your store' : 'Currently disabled'}
                </p>
              </div>
            </div>
            <Switch
              checked={form.is_enabled}
              onCheckedChange={(v) => setForm(f => ({ ...f, is_enabled: v }))}
            />
          </div>
        </div>

        {/* Main controls */}
        <div className="grid gap-5">
          {/* Dates & auto-enable */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-amber-500" />
                Schedule & Auto-Enable
              </CardTitle>
              <CardDescription>Set the Ramadan period. Enable auto-activate to show theme within the date range automatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm(f => ({ ...f, start_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>End Date (Eid al-Fitr)</Label>
                  <Input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm(f => ({ ...f, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <Label className="text-sm font-medium">Auto Enable by Date</Label>
                  <p className="text-xs text-muted-foreground">Theme activates & deactivates automatically within the date range</p>
                </div>
                <Switch
                  checked={form.auto_enable_by_date}
                  onCheckedChange={(v) => setForm(f => ({ ...f, auto_enable_by_date: v }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Greeting message */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlignLeft className="h-4 w-4 text-amber-500" />
                Greeting Banner Message
              </CardTitle>
              <CardDescription>Shown as a dismissible banner on the website. Gold gradient styling applied automatically.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={form.greeting_text}
                onChange={(e) => setForm(f => ({ ...f, greeting_text: e.target.value }))}
                rows={2}
                placeholder="🌙 Ramadan Mubarak! May this holy month..."
              />
            </CardContent>
          </Card>

          {/* Countdown toggle */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Eid Countdown Timer
              </CardTitle>
              <CardDescription>Shows a live countdown to Eid (based on End Date above). Auto-hides after Eid.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Eid Countdown</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Displayed on the homepage hero section</p>
                </div>
                <Switch
                  checked={form.show_countdown}
                  onCheckedChange={(v) => setForm(f => ({ ...f, show_countdown: v }))}
                />
              </div>

              {form.show_countdown && form.end_date && (
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-3 font-medium">PREVIEW:</p>
                  <EidCountdown endDate={form.end_date} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Color override */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4 text-amber-500" />
                Accent Color Override
              </CardTitle>
              <CardDescription>Gold is recommended for Ramadan. This color affects lights and UI accents.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.primary_color_override}
                  onChange={(e) => setForm(f => ({ ...f, primary_color_override: e.target.value }))}
                  style={{ width: '48px', height: '40px', borderRadius: '8px', cursor: 'pointer', border: '1px solid hsl(var(--border))' }}
                />
                <Input
                  value={form.primary_color_override}
                  onChange={(e) => setForm(f => ({ ...f, primary_color_override: e.target.value }))}
                  className="font-mono w-36"
                  placeholder="#d4a017"
                />
                <button
                  onClick={() => setForm(f => ({ ...f, primary_color_override: '#d4a017' }))}
                  className="text-xs text-amber-600 hover:text-amber-700 underline"
                >
                  Reset to Gold
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Banner image upload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-amber-500" />
                Ramadan Banner Image <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
              </CardTitle>
              <CardDescription>Upload a custom banner image for the hero section. Recommended: 1920×500px.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {form.banner_image_url ? (
                <div className="relative rounded-lg overflow-hidden border">
                  <img src={form.banner_image_url} alt="Ramadan banner" className="w-full h-32 object-cover" />
                  <button
                    onClick={() => setForm(f => ({ ...f, banner_image_url: '' }))}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-28 border-2 border-dashed border-amber-300/50 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-amber-400 hover:bg-amber-50/5 transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-amber-500" />
                      <span className="text-sm text-muted-foreground">Click to upload banner image</span>
                    </>
                  )}
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
            </CardContent>
          </Card>

          {/* Preview Mode */}
          <Card className="border-amber-200/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4 text-amber-500" />
                Preview Mode
              </CardTitle>
              <CardDescription>Test how the theme looks without publishing it live.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="border-amber-300/50 text-amber-700 hover:bg-amber-50"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? (
                  <><EyeOff className="h-4 w-4 mr-2" />Exit Preview</>
                ) : (
                  <><Eye className="h-4 w-4 mr-2" />Preview Ramadan Theme</>
                )}
              </Button>

              {previewMode && (
                <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
                  <strong>Preview active.</strong> The Ramadan theme effects are now visible on this page. Exit preview when done.
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
              background: 'linear-gradient(135deg, #0a2814, #1a4a28)',
              color: '#d4a017',
              border: '1px solid rgba(212,160,23,0.4)',
              fontWeight: 700,
            }}
          >
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" />Save Festival Settings</>
            )}
          </Button>

          {form.is_enabled && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Theme will go live after saving
            </div>
          )}
        </div>
      </div>

      {/* Preview overlay effect */}
      {previewMode && (
        <style>{`
          body::before {
            content: '';
            position: fixed;
            inset: 0;
            background: linear-gradient(135deg, rgba(10,40,20,0.04) 0%, rgba(5,20,10,0.06) 100%);
            pointer-events: none;
            z-index: 0;
          }
        `}</style>
      )}
    </AdminLayout>
  );
};

export default AdminFestivalTheme;
