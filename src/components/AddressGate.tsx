import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MapPin, Phone, Home, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddressGateProps {
  children: React.ReactNode;
}

const AddressGate = ({ children }: AddressGateProps) => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [showGate, setShowGate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    pincode: '',
    address: '',
    city: '',
    state: '',
    landmark: '',
  });

  // Check if profile is complete (has required fields)
  const isProfileComplete = (prof: typeof profile) => {
    if (!prof) return false;
    return !!(prof.phone && prof.pincode && prof.address && prof.city && prof.state);
  };

  useEffect(() => {
    // Only show gate for logged-in users with incomplete profile
    if (!loading && user && profile !== null) {
      const complete = isProfileComplete(profile);
      setShowGate(!complete);
      
      // Pre-fill form with existing data
      if (!complete && profile) {
        setFormData({
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          pincode: profile.pincode || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          landmark: '',
        });
      }
    }
  }, [loading, user, profile]);

  // Pre-fill name from user email if not set
  useEffect(() => {
    if (user && !formData.full_name) {
      const emailName = user.email?.split('@')[0] || '';
      setFormData(prev => ({
        ...prev,
        full_name: prev.full_name || emailName,
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Special handling for phone and pincode
    if (name === 'phone') {
      const sanitized = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, phone: sanitized }));
      return;
    }
    if (name === 'pincode') {
      const sanitized = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, pincode: sanitized }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { full_name, phone, pincode, address, city, state } = formData;
    
    if (!full_name.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!phone || phone.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return false;
    }
    if (!pincode || pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    if (!address.trim()) {
      toast.error('Please enter your full address');
      return false;
    }
    if (!city.trim()) {
      toast.error('Please enter your city');
      return false;
    }
    if (!state.trim()) {
      toast.error('Please enter your state');
      return false;
    }
    return true;
  };

  const handleSaveAddress = async () => {
    if (!validateForm()) return;
    if (!user) return;

    setSaving(true);
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            phone: formData.phone,
            pincode: formData.pincode,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            full_name: formData.full_name,
            phone: formData.phone,
            pincode: formData.pincode,
            address: formData.address,
            city: formData.city,
            state: formData.state,
          });

        if (error) throw error;
      }

      // Refresh profile in auth context
      await refreshProfile();
      
      toast.success('Address saved successfully!');
      setShowGate(false);
    } catch (error: any) {
      console.error('Error saving address:', error);
      toast.error(error.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  // If loading auth, show nothing (children will handle their loading)
  if (loading) {
    return <>{children}</>;
  }

  // If not logged in, just show children (auth pages will handle login)
  if (!user) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      <Dialog open={showGate} onOpenChange={() => {}}>
        <DialogContent 
          className="sm:max-w-md max-h-[90vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <MapPin className="h-5 w-5 text-primary" />
              Complete Your Profile
            </DialogTitle>
            <DialogDescription>
              Please add your delivery address to continue shopping. This helps us show accurate delivery times and charges.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-1">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Mobile Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="10-digit mobile number"
                maxLength={10}
              />
            </div>

            {/* Pincode */}
            <div className="space-y-2">
              <Label htmlFor="pincode" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Pincode <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="6-digit pincode"
                maxLength={6}
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Full Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="House/Flat, Street, Area"
              />
            </div>

            {/* City & State */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">
                  State <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State"
                />
              </div>
            </div>

            {/* Landmark (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="landmark" className="text-muted-foreground">
                Landmark (Optional)
              </Label>
              <Input
                id="landmark"
                name="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
                placeholder="Nearby landmark for easy delivery"
              />
            </div>
          </div>

          <Button 
            onClick={handleSaveAddress} 
            disabled={saving}
            className="w-full"
            size="lg"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save & Continue Shopping
              </>
            )}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddressGate;
