const lights = [
  { color: '#d4a017', delay: '0s', height: '55px' },
  { color: '#c0392b', delay: '0.3s', height: '45px' },
  { color: '#27ae60', delay: '0.6s', height: '60px' },
  { color: '#d4a017', delay: '0.9s', height: '40px' },
  { color: '#8e44ad', delay: '1.2s', height: '50px' },
  { color: '#c0392b', delay: '1.5s', height: '58px' },
  { color: '#27ae60', delay: '0.4s', height: '42px' },
  { color: '#d4a017', delay: '0.7s', height: '52px' },
  { color: '#8e44ad', delay: '1.0s', height: '46px' },
  { color: '#c0392b', delay: '0.2s', height: '56px' },
  { color: '#27ae60', delay: '1.3s', height: '48px' },
  { color: '#d4a017', delay: '0.5s', height: '43px' },
  { color: '#c0392b', delay: '0.8s', height: '62px' },
  { color: '#27ae60', delay: '1.1s', height: '44px' },
  { color: '#d4a017', delay: '1.4s', height: '54px' },
  { color: '#8e44ad', delay: '0.1s', height: '47px' },
];

const RamadanHangingLights = () => {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
      aria-hidden="true"
      style={{ height: '80px' }}
    >
      {/* Rope line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #8b6914, #d4a017, #8b6914)',
          boxShadow: '0 1px 4px rgba(212,160,23,0.5)',
        }}
      />

      {/* Lights container */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'flex-start',
          paddingTop: '0px',
          paddingLeft: '1rem',
          paddingRight: '1rem',
        }}
      >
        {lights.map((light, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              animationName: 'ramadanGlow',
              animationDuration: '2s',
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationDirection: 'alternate',
              animationDelay: light.delay,
            }}
          >
            {/* String */}
            <div
              style={{
                width: '1.5px',
                height: light.height,
                background: `linear-gradient(to bottom, #8b6914, ${light.color}88)`,
              }}
            />
            {/* Lantern body */}
            <div
              style={{
                width: '16px',
                height: '22px',
                background: `radial-gradient(ellipse at center, ${light.color}ff 0%, ${light.color}cc 60%, ${light.color}88 100%)`,
                borderRadius: '50% 50% 45% 45%',
                boxShadow: `0 0 8px 3px ${light.color}66, 0 0 16px 5px ${light.color}33`,
                border: `1px solid ${light.color}aa`,
                position: 'relative',
              }}
            >
              {/* Top cap */}
              <div
                style={{
                  position: 'absolute',
                  top: '-4px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '12px',
                  height: '5px',
                  background: '#8b6914',
                  borderRadius: '3px 3px 0 0',
                }}
              />
              {/* Bottom tassel */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '2px',
                  height: '6px',
                  background: light.color,
                  borderRadius: '0 0 2px 2px',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ramadanGlow {
          0% { opacity: 0.7; filter: brightness(0.85); }
          100% { opacity: 1; filter: brightness(1.3); }
        }
      `}</style>
    </div>
  );
};

export default RamadanHangingLights;
