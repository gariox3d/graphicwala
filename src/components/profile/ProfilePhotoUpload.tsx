import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteAvatar, uploadAvatar, validateAvatarFile } from '@/lib/avatar';
import UserAvatar from './UserAvatar';

interface ProfilePhotoUploadProps {
  userId: string;
  avatarUrl?: string | null;
  name?: string | null;
  onChanged?: () => void | Promise<void>;
  size?: 'md' | 'lg';
}

const ProfilePhotoUpload = ({ userId, avatarUrl, name, onChanged, size = 'lg' }: ProfilePhotoUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    const error = validateAvatarFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    setBusy(true);
    try {
      await uploadAvatar(userId, file);
      toast.success('Profile photo updated');
      await onChanged?.();
    } catch (err: any) {
      toast.error(err?.message || 'Could not upload photo');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    try {
      await deleteAvatar(userId);
      toast.success('Profile photo removed');
      await onChanged?.();
    } catch (err: any) {
      toast.error(err?.message || 'Could not remove photo');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
      <div className="relative">
        <UserAvatar
          avatarUrl={avatarUrl}
          name={name}
          className={size === 'lg' ? 'h-20 w-20 sm:h-24 sm:w-24 ring-2 ring-primary/20' : 'h-16 w-16 ring-2 ring-primary/20'}
          fallbackClassName="text-xl"
        />
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 w-full sm:w-auto">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            <Camera className="h-4 w-4 mr-1" />
            {avatarUrl ? 'Change Photo' : 'Add Photo'}
          </Button>
          {avatarUrl && (
            <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={handleRemove}>
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">JPG, PNG or WebP · up to 5MB · optional</p>
      </div>
    </div>
  );
};

export default ProfilePhotoUpload;