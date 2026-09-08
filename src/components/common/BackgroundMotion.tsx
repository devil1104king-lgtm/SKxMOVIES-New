import React, { useEffect, useRef } from 'react';
import { BackgroundMotionStyle } from '../../types';

interface BackgroundMotionProps {
  style?: BackgroundMotionStyle;
}

export const BackgroundMotion: React.FC<BackgroundMotionProps> = ({ style = 'cinematic-particles' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // ==========================================
    // 1. CINEMATIC PARTICLES & EMBERS
    // ==========================================
    const particleCount = Math.min(80, Math.floor(width / 20));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.6,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: -Math.random() * 0.4 - 0.1, // slow upward drift
      alpha: Math.random() * 0.5 + 0.2,
      maxAlpha: Math.random() * 0.5 + 0.3,
      alphaSpeed: (Math.random() * 0.008 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
      hue: Math.random() > 0.7 ? 40 : 210 // amber embers vs cold starlight
    }));

    // ==========================================
    // 2. ANAMORPHIC FLARES & BEAMS
    // ==========================================
    let beamAngle = 0;

    // ==========================================
    // 3. CONSTELLATION NODES
    // ==========================================
    const nodeCount = Math.min(50, Math.floor(width / 35));
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.5 + 0.8
    }));

    let isVisible = true;
    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Base pure black canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      if (style === 'cinematic-particles') {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.speedX;
          p.y += p.speedY;
          p.alpha += p.alphaSpeed;

          if (p.alpha > p.maxAlpha || p.alpha < 0.1) {
            p.alphaSpeed = -p.alphaSpeed;
          }

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          if (p.hue === 40) {
            ctx.fillStyle = `rgba(245, 158, 11, ${p.alpha})`; // Amber cinematic ember
            ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
          } else {
            ctx.fillStyle = `rgba(180, 210, 255, ${p.alpha * 0.8})`; // Cold cinematic star
            ctx.shadowColor = 'rgba(59, 130, 246, 0.3)';
          }
          ctx.shadowBlur = p.size * 3;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      } else if (style === 'anamorphic-flares') {
        beamAngle += 0.003;
        const centerX = width * 0.5 + Math.sin(beamAngle) * (width * 0.25);
        const centerY = height * 0.35 + Math.cos(beamAngle * 0.7) * (height * 0.15);

        // Horizontal anamorphic cinema streak
        const streakGrad = ctx.createLinearGradient(centerX - 400, centerY, centerX + 400, centerY);
        streakGrad.addColorStop(0, 'rgba(59, 130, 246, 0)');
        streakGrad.addColorStop(0.3, 'rgba(59, 130, 246, 0.08)');
        streakGrad.addColorStop(0.5, 'rgba(220, 240, 255, 0.22)');
        streakGrad.addColorStop(0.7, 'rgba(245, 158, 11, 0.08)');
        streakGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

        ctx.fillStyle = streakGrad;
        ctx.fillRect(0, centerY - 2, width, 4);

        // Soft spotlight bloom
        const spotGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 350);
        spotGrad.addColorStop(0, 'rgba(59, 130, 246, 0.09)');
        spotGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.03)');
        spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 350, 0, Math.PI * 2);
        ctx.fill();
      } else if (style === 'cosmic-constellation') {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          n.x += n.vx;
          n.y += n.vy;

          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;

          // Draw node
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fill();

          // Connect with nearby nodes
          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const dx = n.x - n2.x;
            const dy = n.y - n2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 130) {
              const alpha = (1 - dist / 130) * 0.16;
              ctx.beginPath();
              ctx.moveTo(n.x, n.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.strokeStyle = `rgba(147, 197, 253, ${alpha})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [style]);

  return (
    <div id="skx-background-motion" className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-black select-none">
      {/* Dynamic Motion Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Aurora Glow Mode Overlay (CSS Accelerated) */}
      {style === 'aurora-glow' && (
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen overflow-hidden">
          <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-600/20 to-cyan-500/10 blur-[130px] animate-subtle-pulse" />
          <div className="absolute top-1/3 -right-40 w-[700px] h-[700px] rounded-full bg-gradient-to-tl from-amber-600/15 via-rose-600/10 to-transparent blur-[150px] animate-film-drift" />
          <div className="absolute -bottom-20 left-1/3 w-[800px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-700/15 to-emerald-600/10 blur-[140px] animate-subtle-pulse" />
        </div>
      )}

      {/* Cinematic Vignette Overlay to ensure text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.75) 100%)'
        }}
      />
    </div>
  );
};
