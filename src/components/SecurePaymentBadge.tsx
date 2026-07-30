import { ShieldCheck, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Trust badge: 100% secure payments via Razorpay. */
const SecurePaymentBadge = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300',
      className,
    )}
  >
    <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
    <span>100% Secure Payments via Razorpay</span>
    <Lock className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
  </div>
);

export default SecurePaymentBadge;
