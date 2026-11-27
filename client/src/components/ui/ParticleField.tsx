import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

// Deliberately minimal: few, small, slow, faint.
const AREA_PER_PARTICLE = 16000; // px² of panel per dot
const MIN_PARTICLES = 14;
const MAX_PARTICLES = 42;
const MAX_SPEED = 0.25; // px per frame
const LINK_DISTANCE = 100; // px
const LINK_ALPHA = 0.1;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * Subtle drifting-particle background (particles.js style, no dependency).
 * Colour comes from the CSS `text-*` token on the canvas, so it follows the theme.
 * Holds still when the user prefers reduced motion.
 */
export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;

    function resize() {
      if (!canvas || !context) return;
      const ratio = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const count = Math.min(MAX_PARTICLES, Math.max(MIN_PARTICLES, Math.round((width * height) / AREA_PER_PARTICLE)));
      particles = width && height
        ? Array.from({ length: count }, () => ({
            x: rand(0, width),
            y: rand(0, height),
            vx: rand(-MAX_SPEED, MAX_SPEED),
            vy: rand(-MAX_SPEED, MAX_SPEED),
            radius: rand(0.8, 1.8),
            alpha: rand(0.2, 0.5),
          }))
        : [];
      draw();
    }

    function draw() {
      if (!canvas || !context) return;
      context.clearRect(0, 0, width, height);
      context.fillStyle = getComputedStyle(canvas).color;
      context.strokeStyle = context.fillStyle;

      for (const [i, p] of particles.entries()) {
        context.globalAlpha = p.alpha;
        context.beginPath();
        context.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        context.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const distance = Math.hypot(p.x - q.x, p.y - q.y);
          if (distance < LINK_DISTANCE) {
            context.globalAlpha = LINK_ALPHA * (1 - distance / LINK_DISTANCE);
            context.beginPath();
            context.moveTo(p.x, p.y);
            context.lineTo(q.x, q.y);
            context.stroke();
          }
        }
      }
      context.globalAlpha = 1;
    }

    function tick() {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }
      draw();
      frame = requestAnimationFrame(tick);
    }

    function start() {
      cancelAnimationFrame(frame);
      if (!reduceMotion.matches) frame = requestAnimationFrame(tick);
    }

    const observer = new ResizeObserver(() => {
      resize();
      start();
    });
    observer.observe(canvas);
    reduceMotion.addEventListener('change', start);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      reduceMotion.removeEventListener('change', start);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 -z-10 size-full text-white" />;
}
