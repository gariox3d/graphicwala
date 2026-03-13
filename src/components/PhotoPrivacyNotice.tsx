import { Shield } from 'lucide-react';

interface PhotoPrivacyNoticeProps {
  className?: string;
}

const PhotoPrivacyNotice = ({ className = '' }: PhotoPrivacyNoticeProps) => {
  return (
    <div className={`flex items-start gap-2 text-xs text-muted-foreground min-w-0 ${className}`}>
      <Shield className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />
      <span className="min-w-0 break-words leading-snug">
        🔒 Your photos are private and automatically deleted after order completion.
      </span>
    </div>
  );
};

export default PhotoPrivacyNotice;
