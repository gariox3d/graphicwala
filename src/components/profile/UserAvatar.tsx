import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarUrl } from '@/lib/avatar';
import { getDefaultAvatar } from '@/lib/defaultAvatar';
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
  const fallbackSrc = getDefaultAvatar(name);

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

  const shown = src || fallbackSrc;

  return (
    <Avatar
      className={cn('h-10 w-10 relative select-none', className)}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {shown && (
        <AvatarImage
          src={shown}
          alt={name ? `${name} profile photo` : 'Profile photo'}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="pointer-events-none select-none"
          style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' } as React.CSSProperties}
        />
      )}
      <AvatarFallback className={cn('bg-primary/10 text-primary font-semibold', fallbackClassName)}>
        {getInitials(name)}
      </AvatarFallback>
      {shown && (
        <span
          aria-hidden="true"
          className="absolute inset-0 z-10 rounded-full"
          style={{ WebkitTouchCallout: 'none' } as React.CSSProperties}
          onContextMenu={(e) => e.preventDefault()}
        />
      )}
    </Avatar>
  );
};

export default UserAvatar;