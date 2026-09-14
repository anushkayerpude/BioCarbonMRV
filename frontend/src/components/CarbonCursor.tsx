import React, { useEffect, useRef, useState, useCallback } from 'react';

interface QuantumRipple {
  id: number;
  x: number;
  y: number;
}

export const CarbonCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const orbitalRef = useRef<HTMLDivElement | null>(null);
  
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTextInput, setIsTextInput] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [ripples, setRipples] = useState<QuantumRipple[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);

  // Position tracking using refs to avoid React re-render lag
  const mousePos = useRef({ x: -100, y: -100 });
  const lastPos = useRef({ x: -100, y: -100 });
  const velocity = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number>(0);
  const rippleCount = useRef(0);

  // Check if device supports fine pointer (mouse/trackpad, not touch)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: fine)');
    if (!mediaQuery.matches) {
      setIsEnabled(false);
    }
    const handler = (e: MediaQueryListEvent) => {
      setIsEnabled(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Manage body class for cursor: none
  useEffect(() => {
    if (!isEnabled) {
      document.documentElement.classList.remove('carbon-cursor-active');
      return;
    }
    document.documentElement.classList.add('carbon-cursor-active');
    return () => {
      document.documentElement.classList.remove('carbon-cursor-active');
    };
  }, [isEnabled]);

  // Smooth render loop with requestAnimationFrame
  const renderLoop = useCallback(() => {
    if (cursorRef.current) {
      const { x, y } = mousePos.current;
      // Direct 0-lag position update for crisp pointer precision
      cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      // Calculate velocity for subtle dynamic orbital tilting
      const vx = x - lastPos.current.x;
      const vy = y - lastPos.current.y;
      velocity.current = {
        x: velocity.current.x * 0.8 + vx * 0.2,
        y: velocity.current.y * 0.8 + vy * 0.2,
      };
      lastPos.current = { x, y };

      if (orbitalRef.current) {
        // Subtle tilt based on movement velocity (max 12 deg)
        const tiltX = Math.max(-12, Math.min(12, -velocity.current.y * 0.4));
        const tiltY = Math.max(-12, Math.min(12, velocity.current.x * 0.4));
        orbitalRef.current.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      }
    }

    animFrameId.current = requestAnimationFrame(renderLoop);
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const handlePointerMove = (e: PointerEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Inspect target to determine interactive/input state
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = Boolean(
          target.closest(
            'button, a, select, [role="button"], [role="link"], [role="checkbox"], [role="tab"], .cursor-pointer, .leaflet-interactive, .leaflet-control, [tabindex]:not([tabindex="-1"])'
          )
        );
        const textInput = Boolean(
          target.closest(
            'input[type="text"], input[type="email"], input[type="search"], input[type="number"], input[type="password"], textarea, [contenteditable="true"]'
          )
        );

        setIsHovered(interactive);
        setIsTextInput(textInput);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      setIsMouseDown(true);
      // Spawn quantum wave ripple
      rippleCount.current += 1;
      const newRipple: QuantumRipple = {
        id: rippleCount.current,
        x: e.clientX,
        y: e.clientY,
      };
      setRipples((prev) => [...prev.slice(-4), newRipple]);

      // Auto-remove ripple after animation ends (500ms)
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 500);
    };

    const handlePointerUp = () => {
      setIsMouseDown(false);
    };

    const handlePointerLeave = () => {
      setIsVisible(false);
    };

    const handlePointerEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);
    document.addEventListener('mouseenter', handlePointerEnter);

    animFrameId.current = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handlePointerLeave);
      document.removeEventListener('mouseenter', handlePointerEnter);
      cancelAnimationFrame(animFrameId.current);
    };
  }, [isEnabled, isVisible, renderLoop]);

  if (!isEnabled) return null;

  return (
    <>
      {/* Dynamic Quantum Pulse Wave Ripples */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="fixed pointer-events-none z-[999998] rounded-full border border-[#d9ed92] shadow-[0_0_15px_#84a948] animate-quantum-pulse"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Main Carbon Atom Cursor Wrapper */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-[999999] transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          willChange: 'transform',
        }}
      >
        <div
          ref={orbitalRef}
          className="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-transform duration-100 ease-out"
          style={{ perspective: 600 }}
        >
          {/* TEXT INPUT CARET MODE */}
          {isTextInput ? (
            <div className="relative flex flex-col items-center justify-center h-7 w-4">
              {/* Vertical Bio-Carbon I-Beam */}
              <div className="w-[2px] h-6 bg-gradient-to-b from-[#d9ed92] via-[#84a948] to-[#d9ed92] shadow-[0_0_8px_#d9ed92] animate-pulse" />
              {/* Top & Bottom Valence Dots */}
              <div className="absolute top-0 w-2 h-2 rounded-full bg-[#d9ed92] shadow-[0_0_6px_#84a948]" />
              <div className="absolute bottom-0 w-2 h-2 rounded-full bg-[#d9ed92] shadow-[0_0_6px_#84a948]" />
              {/* Tiny Carbon Marker */}
              <span className="absolute -right-3 text-[8px] font-mono font-bold text-[#a3be8c] bg-[#141d0b]/80 px-0.5 rounded border border-[#283618]">
                C
              </span>
            </div>
          ) : (
            /* ATOMIC CARBON MODEL (Bohr-Rutherford: 6 Electrons, 3 Orbital Planes) */
            <div
              className={`relative flex items-center justify-center transition-all duration-300 ease-out ${
                isHovered
                  ? 'scale-125'
                  : isMouseDown
                  ? 'scale-90'
                  : 'scale-100'
              }`}
            >
              {/* Outer Energy Field Aura */}
              <div
                className={`absolute rounded-full transition-all duration-300 ${
                  isHovered
                    ? 'w-16 h-16 bg-[#84a948]/15 blur-md scale-110'
                    : 'w-12 h-12 bg-[#84a948]/10 blur-sm'
                }`}
              />

              {/* SVG 3D-Tilted Orbital Rings with 6 Revolving Electrons */}
              <svg
                className={`overflow-visible transition-all duration-300 ${
                  isHovered ? 'w-16 h-16' : 'w-12 h-12'
                }`}
                viewBox="-28 -28 56 56"
              >
                <defs>
                  {/* Glowing Filter */}
                  <filter id="electron-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Nucleus Gradient */}
                  <radialGradient id="carbon-nucleus-grad" cx="40%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#a3be8c" />
                    <stop offset="45%" stopColor="#556b2f" />
                    <stop offset="85%" stopColor="#283618" />
                    <stop offset="100%" stopColor="#0e150d" />
                  </radialGradient>
                </defs>

                {/* --- ORBITAL RING 1: Angle 0° (2 Electrons) --- */}
                <g className={isHovered ? 'animate-spin-fast' : 'animate-spin-slow'}>
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="22"
                    ry="8"
                    fill="none"
                    stroke={isHovered ? '#d9ed92' : '#84a948'}
                    strokeWidth={isHovered ? '1.2' : '0.8'}
                    strokeOpacity={isHovered ? '0.75' : '0.45'}
                    strokeDasharray={isHovered ? 'none' : '3 1.5'}
                  />
                  {/* Electron 1A */}
                  <circle
                    cx="22"
                    cy="0"
                    r="2.2"
                    fill="#d9ed92"
                    filter="url(#electron-glow)"
                    className="shadow-[0_0_8px_#d9ed92]"
                  />
                  {/* Electron 1B (opposite phase) */}
                  <circle
                    cx="-22"
                    cy="0"
                    r="2.2"
                    fill="#d9ed92"
                    filter="url(#electron-glow)"
                    className="shadow-[0_0_8px_#d9ed92]"
                  />
                </g>

                {/* --- ORBITAL RING 2: Angle 60° (2 Electrons) --- */}
                <g
                  transform="rotate(60)"
                  className={isHovered ? 'animate-spin-fast-reverse' : 'animate-spin-reverse'}
                >
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="22"
                    ry="8"
                    fill="none"
                    stroke={isHovered ? '#d9ed92' : '#84a948'}
                    strokeWidth={isHovered ? '1.2' : '0.8'}
                    strokeOpacity={isHovered ? '0.75' : '0.45'}
                    strokeDasharray={isHovered ? 'none' : '3 1.5'}
                  />
                  {/* Electron 2A */}
                  <circle
                    cx="22"
                    cy="0"
                    r="2.2"
                    fill="#ecf8b4"
                    filter="url(#electron-glow)"
                  />
                  {/* Electron 2B (opposite phase) */}
                  <circle
                    cx="-22"
                    cy="0"
                    r="2.2"
                    fill="#ecf8b4"
                    filter="url(#electron-glow)"
                  />
                </g>

                {/* --- ORBITAL RING 3: Angle 120° (2 Electrons) --- */}
                <g
                  transform="rotate(120)"
                  className={isHovered ? 'animate-spin-medium' : 'animate-spin-medium-slow'}
                >
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="22"
                    ry="8"
                    fill="none"
                    stroke={isHovered ? '#d9ed92' : '#84a948'}
                    strokeWidth={isHovered ? '1.2' : '0.8'}
                    strokeOpacity={isHovered ? '0.75' : '0.45'}
                    strokeDasharray={isHovered ? 'none' : '3 1.5'}
                  />
                  {/* Electron 3A */}
                  <circle
                    cx="22"
                    cy="0"
                    r="2.2"
                    fill="#d9ed92"
                    filter="url(#electron-glow)"
                  />
                  {/* Electron 3B (opposite phase) */}
                  <circle
                    cx="-22"
                    cy="0"
                    r="2.2"
                    fill="#d9ed92"
                    filter="url(#electron-glow)"
                  />
                </g>

                {/* --- CENTRAL CARBON NUCLEUS (${^6}C) --- */}
                {/* Nucleus Outer Border Halo */}
                <circle
                  cx="0"
                  cy="0"
                  r="8.5"
                  fill="url(#carbon-nucleus-grad)"
                  stroke={isHovered ? '#d9ed92' : '#a3be8c'}
                  strokeWidth="1.2"
                  filter="url(#electron-glow)"
                  className="transition-colors duration-200"
                />

                {/* Nucleus Inner Glow Core */}
                <circle
                  cx="0"
                  cy="0"
                  r="7.5"
                  fill="none"
                  stroke={isHovered ? '#d9ed92' : '#84a948'}
                  strokeWidth="0.8"
                  strokeOpacity="0.8"
                />

                {/* Carbon Symbol "C" */}
                <text
                  x="0"
                  y="0"
                  dominantBaseline="central"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="7.5"
                  fontWeight="900"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  letterSpacing="-0.5"
                >
                  C
                </text>

                {/* Atomic Number "6" Superscript Badge */}
                <text
                  x="-4.5"
                  y="-4"
                  dominantBaseline="central"
                  textAnchor="middle"
                  fill="#d9ed92"
                  fontSize="4.2"
                  fontWeight="bold"
                  fontFamily="ui-monospace, monospace"
                >
                  6
                </text>

                {/* EXACT PINPOINT CENTER RETICLE DOT (Zero Ambiguity for Clicks) */}
                <circle
                  cx="0"
                  cy="0"
                  r="0.9"
                  fill="#ffffff"
                  className="animate-ping opacity-75"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="0.75"
                  fill="#ffffff"
                />

                {/* Micro Crosshair Guide Lines (length 1.5px) */}
                <line x1="-2.5" y1="0" x2="-1.2" y2="0" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.8" />
                <line x1="1.2" y1="0" x2="2.5" y2="0" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.8" />
                <line x1="0" y1="-2.5" x2="0" y2="-1.2" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.8" />
                <line x1="0" y1="1.2" x2="0" y2="2.5" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.8" />
              </svg>

              {/* Hover Badge: "C⁶ EXCITED" Indicator on Interactive Hover */}
              {isHovered && (
                <div className="absolute -top-6 px-1.5 py-0.5 rounded-full bg-[#10170d]/90 border border-[#84a948]/80 text-[8px] font-mono font-bold text-[#d9ed92] shadow-[0_0_10px_rgba(132,169,72,0.4)] whitespace-nowrap animate-in fade-in zoom-in duration-150">
                  C⁶ • VALENCE
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CarbonCursor;
