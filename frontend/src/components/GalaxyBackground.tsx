import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

interface Star {
  x: number;
  y: number;
  baseRadius: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  vx: number;
  vy: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  active: boolean;
}

export const GalaxyBackground: React.FC = () => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates for interactive stellar constellation effect
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      radius: 140,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize);

    const isLight = theme === 'light';

    // Palette: in Galaxy mode, crisp starlight colors; in Light mode, gentle sun-particles
    const starColors = isLight
      ? ['#94a3b8', '#cbd5e1', '#38bdf8', '#f59e0b', '#6366f1']
      : ['#ffffff', '#f0f4f8', '#e2e8f0', '#cbd5e1', '#e0e7ff', '#fef08a'];

    let stars: Star[] = [];

    const initStars = () => {
      const divisor = isLight ? 14000 : 8500; // Fewer subtle particles in light mode
      const starCount = Math.floor((width * height) / divisor);
      stars = [];
      for (let i = 0; i < starCount; i++) {
        const baseRadius = isLight ? Math.random() * 1.2 + 0.4 : Math.random() * 1.5 + 0.5;
        const baseAlpha = isLight ? Math.random() * 0.35 + 0.15 : Math.random() * 0.6 + 0.25;
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          baseRadius,
          radius: baseRadius,
          baseAlpha,
          alpha: baseAlpha,
          twinkleSpeed: Math.random() * 0.025 + 0.008,
          twinklePhase: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.1,
          color: starColors[Math.floor(Math.random() * starColors.length)],
        });
      }
    };

    initStars();

    // Subtle shooting star mechanism (Galaxy mode only)
    let shootingStar: ShootingStar = {
      x: 0,
      y: 0,
      length: 0,
      speed: 0,
      angle: 0,
      alpha: 0,
      active: false,
    };

    let nextShootingStarTime = Date.now() + Math.random() * 5000 + 4000;

    const triggerShootingStar = () => {
      if (isLight) return;
      shootingStar = {
        x: Math.random() * width * 0.8,
        y: Math.random() * (height * 0.4),
        length: Math.random() * 80 + 70,
        speed: Math.random() * 8 + 9,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
        alpha: 1,
        active: true,
      };
      nextShootingStarTime = Date.now() + Math.random() * 9000 + 6000;
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      // Draw subtle interactive cursor illumination
      if (mouse.x > 0 && mouse.y > 0) {
        const mouseGlow = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          mouse.radius * 1.5
        );
        if (isLight) {
          mouseGlow.addColorStop(0, 'rgba(14, 165, 233, 0.06)');
          mouseGlow.addColorStop(0.5, 'rgba(99, 102, 241, 0.02)');
          mouseGlow.addColorStop(1, 'transparent');
        } else {
          mouseGlow.addColorStop(0, 'rgba(255, 255, 255, 0.045)');
          mouseGlow.addColorStop(0.5, 'rgba(200, 220, 255, 0.02)');
          mouseGlow.addColorStop(1, 'transparent');
        }
        ctx.fillStyle = mouseGlow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update and draw stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        if (!prefersReducedMotion) {
          s.twinklePhase += s.twinkleSpeed;
          const twinkleFactor = Math.sin(s.twinklePhase);
          s.alpha = s.baseAlpha + twinkleFactor * (isLight ? 0.12 : 0.25);

          s.x += s.vx;
          s.y += s.vy;

          if (s.x < 0) s.x = width;
          if (s.x > width) s.x = 0;
          if (s.y < 0) s.y = height;
          if (s.y > height) s.y = 0;
        }

        const dx = mouse.x - s.x;
        const dy = mouse.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let finalRadius = s.radius;
        let finalAlpha = s.alpha;

        if (dist < mouse.radius) {
          const proximity = 1 - dist / mouse.radius;
          finalAlpha = Math.min(1, s.alpha + proximity * 0.5);
          finalRadius = s.radius * (1 + proximity * 0.7);

          // Constellation lines near cursor
          for (let j = i + 1; j < stars.length; j++) {
            const s2 = stars[j];
            const d2x = s.x - s2.x;
            const d2y = s.y - s2.y;
            const distBetween = Math.sqrt(d2x * d2x + d2y * d2y);

            if (distBetween < 80) {
              const lineAlpha = (1 - distBetween / 80) * proximity * (isLight ? 0.15 : 0.25);
              ctx.strokeStyle = isLight
                ? `rgba(71, 85, 105, ${lineAlpha})`
                : `rgba(220, 230, 255, ${lineAlpha})`;
              ctx.lineWidth = 0.6;
              ctx.beginPath();
              ctx.moveTo(s.x, s.y);
              ctx.lineTo(s2.x, s2.y);
              ctx.stroke();
            }
          }
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0.08, Math.min(1, finalAlpha));
        ctx.fillStyle = s.color;

        if (!isLight && (s.baseRadius > 1.2 || dist < mouse.radius)) {
          ctx.shadowBlur = 6;
          ctx.shadowColor = s.color;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, finalRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Check shooting star
      if (!isLight && !prefersReducedMotion) {
        if (!shootingStar.active && Date.now() > nextShootingStarTime) {
          triggerShootingStar();
        }

        if (shootingStar.active) {
          const tailX = shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length;
          const tailY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length;

          const gradient = ctx.createLinearGradient(
            shootingStar.x,
            shootingStar.y,
            tailX,
            tailY
          );
          gradient.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.alpha})`);
          gradient.addColorStop(0.3, `rgba(200, 225, 255, ${shootingStar.alpha * 0.6})`);
          gradient.addColorStop(1, 'transparent');

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(shootingStar.x, shootingStar.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();

          shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
          shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
          shootingStar.alpha -= 0.014;

          if (
            shootingStar.alpha <= 0 ||
            shootingStar.x > width + 100 ||
            shootingStar.y > height + 100
          ) {
            shootingStar.active = false;
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-500">
      {/* Background layer */}
      {isLight ? (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-sky-50/20 to-indigo-50/25">
          {/* Subtle architectural light aura */}
          <div
            className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[140px] opacity-40 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(186, 230, 253, 0.4) 0%, rgba(224, 231, 255, 0.2) 50%, transparent 75%)',
            }}
          />
          <div
            className="absolute top-1/2 -left-[10%] w-[600px] h-[600px] rounded-full blur-[160px] opacity-30 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(219, 234, 254, 0.4) 0%, rgba(241, 245, 249, 0.1) 60%, transparent 80%)',
            }}
          />
        </div>
      ) : (
        <>
          <div className="absolute inset-0 bg-[#050505]" />
          
          {/* Cosmic Nebula Cloud 1: Silver Galactic Core */}
          <div
            className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[140px] opacity-25 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(220, 225, 245, 0.15) 0%, rgba(130, 140, 180, 0.05) 50%, transparent 75%)',
            }}
          />

          {/* Cosmic Nebula Cloud 2: Deep Slate Silver Horizon Glow */}
          <div
            className="absolute top-1/3 -left-[15%] w-[600px] h-[600px] rounded-full blur-[160px] opacity-20 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(180, 190, 220, 0.12) 0%, rgba(90, 100, 140, 0.04) 55%, transparent 80%)',
            }}
          />

          {/* Cosmic Nebula Cloud 3: Lower Starfield Nebula */}
          <div
            className="absolute -bottom-[20%] -right-[10%] w-[700px] h-[700px] rounded-full blur-[170px] opacity-20 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(210, 215, 235, 0.10) 0%, rgba(120, 130, 160, 0.03) 60%, transparent 80%)',
            }}
          />
        </>
      )}

      {/* Interactive Twinkling Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block pointer-events-none" />
    </div>
  );
};
