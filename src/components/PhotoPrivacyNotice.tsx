import { Shield } from 'lucide-react';

interface PhotoPrivacyNoticeProps {
  className?: string;
}

const PhotoPrivacyNotice = ({ className = '' }: PhotoPrivacyNoticeProps) => {
  return (
    <div className={`flex items-center gap-1.5 text-xs text-muted-foreground ${className}`}>
      <Shield className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
      <span>
        🔒 Your photos are private and automatically deleted after order completion.
      </span>
    </div>
  );
};

export default PhotoPrivacyNotice;
