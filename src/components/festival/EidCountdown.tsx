import { useState, useEffect } from 'react';

interface Props {
  endDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const EidCountdown = ({ endDate }: Props) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const target = new Date(endDate);
    target.setHours(23, 59, 59, 999);

    const calculate = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (!timeLeft) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(10,30,18,0.95) 0%, rgba(5,15,10,0.98) 100%)',
        border: '1px solid rgba(212,160,23,0.4)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(212,160,23,0.1)',
        maxWidth: '480px',
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Gold top border accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent, #d4a017, #f5d060, #d4a017, transparent)',
      }} />

      {/* Islamic pattern background (subtle) */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4a017' fill-rule='evenodd'%3E%3Cpath d='M30 0l30 30-30 30L0 30z'/%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <p style={{
        margin: '0 0 1rem 0',
        fontSize: '0.85rem',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        background: 'linear-gradient(90deg, #d4a017, #f5d060)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        ⏳ Eid Countdown
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {units.map((unit, i) => (
          <div key={unit.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(212,160,23,0.15), rgba(212,160,23,0.05))',
                border: '1px solid rgba(212,160,23,0.3)',
                borderRadius: '10px',
                padding: '0.6rem 0.9rem',
                minWidth: '56px',
              }}>
                <span style={{
                  display: 'block',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  fontVariantNumeric: 'tabular-nums',
                  background: 'linear-gradient(180deg, #f5d060 0%, #d4a017 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1.1,
                }}>
                  {pad(unit.value)}
                </span>
                <span style={{
                  display: 'block',
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(212,160,23,0.7)',
                  marginTop: '2px',
                }}>
                  {unit.label}
                </span>
              </div>
            </div>
            {i < units.length - 1 && (
              <span style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                color: '#d4a017',
                marginBottom: '18px',
                opacity: 0.8,
              }}>:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EidCountdown;
