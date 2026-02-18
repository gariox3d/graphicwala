const RamadanCrescentWatermark = () => (
  <div
    aria-hidden="true"
    style={{
      position: 'fixed',
      top: '80px',
      right: '-20px',
      width: '180px',
      height: '180px',
      opacity: 0.04,
      pointerEvents: 'none',
      zIndex: 1,
      transform: 'rotate(15deg)',
    }}
  >
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M70 20C55 20 43 32 43 47C43 62 55 74 70 74C62 74 54 70 49 63C44 56 44 38 49 31C54 24 62 20 70 20Z"
        fill="#d4a017"
      />
      <circle cx="72" cy="28" r="5" fill="#d4a017"/>
    </svg>
  </div>
);

export default RamadanCrescentWatermark;
