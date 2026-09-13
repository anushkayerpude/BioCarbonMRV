import React, { useEffect, useRef } from 'react';

interface CarbonAtomCanvasProps {
  scrollVelocity: number;
  scrollYProgress: number;
  interactive?: boolean;
}

interface Atom {
  x: number;
  y: number;
  z: number; // depth: 0.2 to 2.0
  vx: number;
  vy: number;
  radius: number;
  angle1: number;
  angle2: number;
  angle3: number;
  rotSpeed1: number;
  rotSpeed2: number;
  rotSpeed3: number;
  alpha: number;
  pulse: number;
}

export const CarbonAtomCanvas: React.FC<CarbonAtomCanvasProps> = ({
  scrollVelocity,
  scrollYProgress,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const atomsRef = useRef<Atom[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const animFrameRef = useRef<number>(0);
  const lastScrollVelRef = useRef<number>(0);
  const lastScrollProgRef = useRef<number>(0);

  useEffect(() => {
    lastScrollVelRef.current = scrollVelocity;
    lastScrollProgRef.current = scrollYProgress;
  }, [scrollVelocity, scrollYProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Initialize 36 ambient carbon atoms with depth layers
    const initialAtoms: Atom[] = [];
    const count = 38;
    for (let i = 0; i < count; i++) {
      const z = 0.35 + Math.random() * 1.3;
      initialAtoms.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        vx: (Math.random() - 0.5) * 0.45 * z,
        vy: (-0.3 - Math.random() * 0.6) * z, // gentle upward floating buoyancy
        radius: (14 + Math.random() * 16) * z,
        angle1: Math.random() * Math.PI * 2,
        angle2: Math.random() * Math.PI * 2,
        angle3: Math.random() * Math.PI * 2,
        rotSpeed1: (0.02 + Math.random() * 0.03) * (Math.random() > 0.5 ? 1 : -1),
        rotSpeed2: (0.015 + Math.random() * 0.025) * (Math.random() > 0.5 ? 1 : -1),
        rotSpeed3: (0.01 + Math.random() * 0.02) * (Math.random() > 0.5 ? 1 : -1),
        alpha: 0.35 + Math.random() * 0.55,
        pulse: Math.random() * Math.PI * 2,
      });
    }
    atomsRef.current = initialAtoms;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Scroll speed adds downward impulse or accelerates atom generation
      const scrollPush = (lastScrollVelRef.current || 0) * 0.0008;
      const atoms = atomsRef.current;

      // Spawn new atoms when scrolling actively
      if (Math.abs(lastScrollVelRef.current) > 120 && atoms.length < 65 && Math.random() < 0.4) {
        const z = 0.4 + Math.random() * 1.2;
        atoms.push({
          x: Math.random() * width,
          y: lastScrollVelRef.current > 0 ? height + 20 : -20,
          z,
          vx: (Math.random() - 0.5) * 1.2,
          vy: lastScrollVelRef.current > 0 ? -1.5 - Math.random() * 2 : 1.5 + Math.random() * 2,
          radius: (12 + Math.random() * 14) * z,
          angle1: Math.random() * Math.PI * 2,
          angle2: Math.random() * Math.PI * 2,
          angle3: Math.random() * Math.PI * 2,
          rotSpeed1: (0.02 + Math.random() * 0.04) * (Math.random() > 0.5 ? 1 : -1),
          rotSpeed2: (0.018 + Math.random() * 0.03) * (Math.random() > 0.5 ? 1 : -1),
          rotSpeed3: (0.012 + Math.random() * 0.025) * (Math.random() > 0.5 ? 1 : -1),
          alpha: 0.65,
          pulse: 0,
        });
      }

      // Draw covalent bonds between nearby atoms (molecular lattice)
      for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
          const a1 = atoms[i];
          const a2 = atoms[j];
          const dx = a2.x - a1.x;
          const dy = a2.y - a1.y;
          const distSq = dx * dx + dy * dy;
          const maxDist = 135 * ((a1.z + a2.z) / 2);

          if (distSq < maxDist * maxDist) {
            const dist = Math.sqrt(distSq);
            const bondAlpha = (1 - dist / maxDist) * 0.22 * Math.min(a1.alpha, a2.alpha);
            
            ctx.beginPath();
            ctx.moveTo(a1.x, a1.y);
            ctx.lineTo(a2.x, a2.y);
            ctx.strokeStyle = `rgba(163, 190, 85, ${bondAlpha})`;
            ctx.lineWidth = 1.2 * ((a1.z + a2.z) / 2);
            ctx.stroke();

            // Subtle glowing bond node in the middle
            if (dist < maxDist * 0.6) {
              const midX = (a1.x + a2.x) / 2;
              const midY = (a1.y + a2.y) / 2;
              ctx.beginPath();
              ctx.arc(midX, midY, 1.5, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(205, 225, 130, ${bondAlpha * 1.5})`;
              ctx.fill();
            }
          }
        }
      }

      // Update & Draw each Carbon Atom
      for (let i = atoms.length - 1; i >= 0; i--) {
        const a = atoms[i];

        // Apply scroll physics
        a.y += a.vy * (1 + Math.abs(scrollPush) * 4) + scrollPush * 8;
        a.x += a.vx;
        a.pulse += dt * 2.5;

        // Mouse interaction
        if (mouseRef.current.active) {
          const mdx = mouseRef.current.x - a.x;
          const mdy = mouseRef.current.y - a.y;
          const mDist = Math.hypot(mdx, mdy);
          if (mDist < 180) {
            const force = (1 - mDist / 180) * 0.8;
            a.x -= (mdx / mDist) * force * 3;
            a.y -= (mdy / mDist) * force * 3;
          }
        }

        // Wrap around borders
        if (a.y < -60) a.y = height + 40;
        if (a.y > height + 60) a.y = -40;
        if (a.x < -60) a.x = width + 40;
        if (a.x > width + 60) a.x = -40;

        // Advance orbital angles
        a.angle1 += a.rotSpeed1;
        a.angle2 += a.rotSpeed2;
        a.angle3 += a.rotSpeed3;

        // Render Carbon Atom ($^{12}C$)
        ctx.save();
        ctx.translate(a.x, a.y);

        const currentRadius = a.radius * (1 + 0.06 * Math.sin(a.pulse));
        const effectiveAlpha = a.alpha;

        // --- 1. Outer Valence Electron Shell (L-shell, n=2, 4 electrons) ---
        ctx.save();
        ctx.rotate(a.angle1 * 0.2);
        ctx.beginPath();
        ctx.ellipse(0, 0, currentRadius * 1.7, currentRadius * 0.65, a.angle2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(163, 190, 85, ${effectiveAlpha * 0.28})`;
        ctx.lineWidth = 1 * a.z;
        ctx.stroke();

        // 4 Valence Electrons orbiting on L-shell
        for (let e = 0; e < 4; e++) {
          const eAngle = a.angle1 + (e * Math.PI) / 2;
          const ex = Math.cos(eAngle) * currentRadius * 1.7;
          const ey = Math.sin(eAngle) * currentRadius * 0.65;
          // Rotate by ellipse tilt
          const tilt = a.angle2;
          const rx = ex * Math.cos(tilt) - ey * Math.sin(tilt);
          const ry = ex * Math.sin(tilt) + ey * Math.cos(tilt);

          ctx.beginPath();
          ctx.arc(rx, ry, 2.2 * a.z, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(217, 237, 146, ${effectiveAlpha * 0.95})`;
          ctx.shadowColor = '#99b83c';
          ctx.shadowBlur = 8 * a.z;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        ctx.restore();

        // --- 2. Inner Electron Shell (K-shell, n=1, 2 electrons) ---
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(0, 0, currentRadius * 0.95, currentRadius * 0.45, -a.angle3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(142, 172, 70, ${effectiveAlpha * 0.35})`;
        ctx.lineWidth = 0.9 * a.z;
        ctx.stroke();

        // 2 Inner Electrons
        for (let e = 0; e < 2; e++) {
          const eAngle = a.angle2 * 1.5 + e * Math.PI;
          const ex = Math.cos(eAngle) * currentRadius * 0.95;
          const ey = Math.sin(eAngle) * currentRadius * 0.45;
          const tilt = -a.angle3;
          const rx = ex * Math.cos(tilt) - ey * Math.sin(tilt);
          const ry = ex * Math.sin(tilt) + ey * Math.cos(tilt);

          ctx.beginPath();
          ctx.arc(rx, ry, 1.8 * a.z, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(236, 248, 180, ${effectiveAlpha * 0.9})`;
          ctx.shadowColor = '#8aa834';
          ctx.shadowBlur = 6 * a.z;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        ctx.restore();

        // --- 3. Carbon Nucleus (6 Protons + 6 Neutrons = Carbon-12) ---
        const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, currentRadius * 0.55);
        grad.addColorStop(0, `rgba(163, 190, 85, ${effectiveAlpha * 0.95})`);
        grad.addColorStop(0.4, `rgba(125, 155, 55, ${effectiveAlpha * 0.75})`);
        grad.addColorStop(0.8, `rgba(85, 107, 35, ${effectiveAlpha * 0.35})`);
        grad.addColorStop(1, 'rgba(46, 60, 20, 0)');

        ctx.beginPath();
        ctx.arc(0, 0, currentRadius * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Nucleus core orb
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(205, 225, 130, ${effectiveAlpha * 0.95})`;
        ctx.shadowColor = '#99b83c';
        ctx.shadowBlur = 10 * a.z;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Atomic symbol "C" on prominent foreground atoms
        if (a.z > 0.95) {
          ctx.font = `bold ${Math.round(10 * a.z)}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = `rgba(35, 48, 15, ${effectiveAlpha * 0.95})`;
          ctx.fillText('C', 0, 0.5);
        }

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [interactive]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      style={{ opacity: 0.92 }}
    />
  );
};
