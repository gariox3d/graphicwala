import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarUrl } from '@/lib/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  avatarUrl?: string | null;
  name?: string | null;
  className?: string;
  fallbackClassName?: string;
}

export const getInitials = (name?: string | null) => {
  if (!name) return 'U';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U';
};

const UserAvatar = ({ avatarUrl, name, className, fallbackClassName }: UserAvatarProps) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setSrc(null);
    if (!avatarUrl) return;
    getAvatarUrl(avatarUrl).then((url) => {
      if (active) setSrc(url);
    });
    return () => {
      active = false;
    };
  }, [avatarUrl]);

  return (
    <Avatar className={cn('h-10 w-10', className)}>
      {src && <AvatarImage src={src} alt={name ? `${name} profile photo` : 'Profile photo'} loading="lazy" decoding="async" />}
      <AvatarFallback className={cn('bg-primary/10 text-primary font-semibold', fallbackClassName)}>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;