import { Check, Clock, Palette, ThumbsUp, Printer, Truck, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const ORDER_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'designing', label: 'Designing', icon: Palette },
  { key: 'approved', label: 'Approved', icon: ThumbsUp },
  { key: 'printing', label: 'Printing', icon: Printer },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'completed', label: 'Delivered', icon: Package },
];

interface OrderTimelineProps {
  currentStatus: string;
}

const OrderTimeline = ({ currentStatus }: OrderTimelineProps) => {
  if (currentStatus === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-destructive text-sm font-medium mt-2">
        <span className="inline-block w-3 h-3 rounded-full bg-destructive" />
        Order Cancelled
      </div>
    );
  }

  const currentIndex = ORDER_STEPS.findIndex(s => s.key === currentStatus);

  return (
    <div className="mt-3 overflow-hidden">
      <div className="flex items-center justify-between pb-1">
        {ORDER_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center min-w-0 w-full">
                <div
                  className={cn(
                    "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-500 border-2 shrink-0",
                    isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : isCurrent
                      ? "bg-primary border-primary text-primary-foreground animate-pulse"
                      : "bg-muted border-muted-foreground/20 text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[9px] sm:text-[10px] mt-1 text-center leading-tight truncate w-full px-0.5",
                    isCompleted
                      ? "text-green-600 font-medium"
                      : isCurrent
                      ? "text-primary font-semibold"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < ORDER_STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 min-w-1 mt-[-14px] transition-all duration-500",
                    index < currentIndex
                      ? "bg-green-500"
                      : "bg-muted-foreground/20"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
