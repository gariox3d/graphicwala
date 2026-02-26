import { useState, useRef, useEffect } from 'react';
import { X, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const SEGMENTS = [
  { label: '10% OFF', color: '#e74c3c', textColor: '#fff' },
  { label: 'Try Again', color: '#3498db', textColor: '#fff' },
  { label: '5% OFF', color: '#2ecc71', textColor: '#fff' },
  { label: 'Free Design', color: '#9b59b6', textColor: '#fff' },
  { label: '₹50 OFF', color: '#f39c12', textColor: '#fff' },
  { label: 'Try Again', color: '#1abc9c', textColor: '#fff' },
  { label: '15% OFF', color: '#e91e63', textColor: '#fff' },
  { label: '₹25 OFF', color: '#ff9800', textColor: '#fff' },
];

const SpinWheel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [showTrigger, setShowTrigger] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Show trigger after 5 seconds, only once per session
  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('spinWheelShown');
    if (alreadyShown) return;
    const timer = setTimeout(() => {
      setShowTrigger(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Draw wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;
    const segAngle = (2 * Math.PI) / SEGMENTS.length;

    ctx.clearRect(0, 0, size, size);

    SEGMENTS.forEach((seg, i) => {
      const startAngle = i * segAngle;
      const endAngle = startAngle + segAngle;

      // Segment
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + segAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = seg.textColor;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(seg.label, radius - 16, 5);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(center, center, 22, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#333';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPIN', center, center + 4);
  }, [isOpen]);

  const handleSpin = () => {
    if (isSpinning || hasSpun) return;
    setIsSpinning(true);
    setResult(null);

    const segAngle = 360 / SEGMENTS.length;
    const winIndex = Math.floor(Math.random() * SEGMENTS.length);
    // Calculate rotation to land on winIndex
    const targetAngle = 360 - (winIndex * segAngle + segAngle / 2);
    const totalRotation = rotation + 360 * 5 + targetAngle;

    setRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setHasSpun(true);
      const won = SEGMENTS[winIndex].label;
      setResult(won);

      if (won.includes('Try Again')) {
        toast.info('Better luck next time! Browse our products 🛒');
      } else {
        toast.success(`🎉 You won ${won}! Screenshot this & send on WhatsApp to claim.`);
      }
    }, 4500);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setShowTrigger(false);
    sessionStorage.setItem('spinWheelShown', 'true');
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const claimOnWhatsApp = () => {
    const msg = `🎉 Hi Graphic Wala! I won "${result}" on the Spin Wheel on your website. Please apply this to my next order!`;
    window.open(`https://wa.me/916207142994?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (!showTrigger && !isOpen) return null;

  return (
    <>
      {/* Floating Trigger Button */}
      {showTrigger && !isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-24 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-3 rounded-full shadow-xl hover:scale-110 transition-all animate-bounce"
          aria-label="Spin the wheel for discounts"
        >
          <Gift className="h-5 w-5" />
          <span className="font-bold text-sm hidden sm:inline">Spin & Win!</span>
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-scale-in">
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-center mb-1">🎡 Spin & Win!</h2>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Try your luck — win discounts on your next order!
            </p>

            {/* Wheel */}
            <div className="relative flex items-center justify-center mb-4">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
                <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-red-500" />
              </div>
              <div
                className="transition-transform"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transitionDuration: isSpinning ? '4.5s' : '0s',
                  transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)',
                }}
              >
                <canvas ref={canvasRef} width={280} height={280} />
              </div>
            </div>

            {/* Result */}
            {result && (
              <div className="text-center mb-3 animate-fade-in">
                {result.includes('Try Again') ? (
                  <p className="text-muted-foreground font-medium">😅 Better luck next time!</p>
                ) : (
                  <>
                    <p className="text-lg font-bold text-green-600">🎉 You won {result}!</p>
                    <Button
                      onClick={claimOnWhatsApp}
                      className="mt-2 bg-green-500 hover:bg-green-600 text-white"
                      size="sm"
                    >
                      Claim on WhatsApp
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Spin Button */}
            {!hasSpun && (
              <Button
                onClick={handleSpin}
                disabled={isSpinning}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold"
                size="lg"
              >
                {isSpinning ? '🎡 Spinning...' : '🎰 Spin Now!'}
              </Button>
            )}

            {hasSpun && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                You can spin once per visit. Come back tomorrow for another chance!
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SpinWheel;
