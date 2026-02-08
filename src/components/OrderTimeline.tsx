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
    <div className="mt-3">
      <div className="flex items-center gap-0.5 overflow-x-auto pb-1">
        {ORDER_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center min-w-[48px]">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 border-2",
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
                    "text-[10px] mt-1 text-center leading-tight whitespace-nowrap",
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
                    "h-0.5 w-4 sm:w-6 mt-[-14px] transition-all duration-500",
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
