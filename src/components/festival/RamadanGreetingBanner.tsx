import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  greetingText: string;
}

const STORAGE_KEY = 'ramadan_banner_dismissed_2025';

const RamadanGreetingBanner = ({ greetingText }: Props) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9998,
        width: 'calc(100% - 2rem)',
        maxWidth: '700px',
        background: 'linear-gradient(135deg, rgba(15,40,25,0.97) 0%, rgba(5,20,10,0.99) 100%)',
        border: '1px solid rgba(212,160,23,0.5)',
        borderRadius: '12px',
        padding: '14px 48px 14px 20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(212,160,23,0.15)',
        backdropFilter: 'blur(8px)',
      }}
      role="banner"
      aria-label="Ramadan Greeting"
    >
      {/* Gold geometric accent lines */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #d4a017, #f5d060, #d4a017, transparent)',
        borderRadius: '12px 12px 0 0',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #d4a017, #f5d060, #d4a017, transparent)',
        borderRadius: '0 0 12px 12px',
      }} />

      <p style={{
        margin: 0,
        fontSize: '0.9rem',
        fontWeight: 600,
        background: 'linear-gradient(90deg, #d4a017, #f5d060, #e8c04a, #d4a017)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textAlign: 'center',
        lineHeight: 1.5,
        letterSpacing: '0.02em',
        textShadow: 'none',
        filter: 'drop-shadow(0 0 8px rgba(212,160,23,0.3))',
      }}>
        {greetingText}
      </p>

      <button
        onClick={dismiss}
        style={{
          position: 'absolute',
          top: '50%',
          right: '12px',
          transform: 'translateY(-50%)',
          background: 'rgba(212,160,23,0.15)',
          border: '1px solid rgba(212,160,23,0.3)',
          borderRadius: '6px',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#d4a017',
          transition: 'all 0.2s',
        }}
        aria-label="Close banner"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default RamadanGreetingBanner;
