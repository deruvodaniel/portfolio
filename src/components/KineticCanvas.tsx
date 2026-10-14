import { useEffect, useRef } from 'react';

export default function KineticCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = canvas?.closest<HTMLElement>('.type-scene');
    const hero = scene?.closest('.hero') as HTMLElement | null;
    const frame = scene?.closest('.hero-frame') as HTMLElement | null;
    if (!canvas || !scene || !hero || !frame) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const nodes = Array.from({ length: 28 }, (_, index) => {
      const ring = index < 12 ? 0 : index < 20 ? 1 : 2;
      const angle = index * 2.39996;
      const radius = [0.24, 0.38, 0.52][ring];
      return { x: .52 + Math.cos(angle) * radius, y: .49 + Math.sin(angle) * radius * .72, red: index % 5 === 0 };
    });
    let pointer = { x: .5, y: .5, active: false };
    let smooth = { x: .5, y: .5 };
    let trail: { x: number; y: number; alpha: number }[] = [];
    let frameId = 0;
    let visible = true;
    let paused = document.documentElement.dataset.motion === 'off';
    let time = 0;
    const reduced = () => motion.matches || paused;
    const running = () => !reduced() && visible && !document.hidden;

    function resize() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!running()) draw();
    }
    function scroll() {
      if (!hero || !frame) return;
      const extent = Math.max(hero.offsetHeight - innerHeight, 1);
      const progress = Math.max(0, Math.min(1, (scrollY - hero.offsetTop) / extent));
      frame.style.setProperty('--scroll', progress.toFixed(3));
      if (!running()) draw();
    }
    function draw() {
      if (!canvas || !ctx || !scene) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);
      if (!reduced()) {
        smooth.x += (pointer.x - smooth.x) * .07;
        smooth.y += (pointer.y - smooth.y) * .07;
        (scene as HTMLElement).style.setProperty('--mx', ((smooth.x - .5) * 2).toFixed(3));
        (scene as HTMLElement).style.setProperty('--my', ((smooth.y - .5) * 2).toFixed(3));
      }
      time += running() ? .008 : 0;
      const shiftX = (smooth.x - .5) * 48;
      const shiftY = (smooth.y - .5) * 33;
      const points = nodes.map((node, index) => ({
        x: node.x * w + shiftX * (index % 3 + 1) / 3 + (reduced() ? 0 : Math.sin(time + index) * 8),
        y: node.y * h + shiftY * (index % 4 + 1) / 4 + (reduced() ? 0 : Math.cos(time + index * .7) * 8),
        red: node.red,
      }));
      points.forEach((node, index) => {
        const next = points[(index + 9) % points.length];
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.quadraticCurveTo((node.x + next.x) / 2 + 20, (node.y + next.y) / 2 - 22, next.x, next.y);
        ctx.strokeStyle = node.red ? 'rgba(227,23,18,.48)' : 'rgba(11,11,11,.27)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.red ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = node.red ? '#e31712' : '#0b0b0b';
        ctx.fill();
        if (index % 4 === 0) {
          ctx.strokeStyle = node.red ? '#e31712' : 'rgba(11,11,11,.55)';
          ctx.strokeRect(node.x - 6, node.y - 6, 12, 12);
        }
      });
      if (!reduced() && pointer.active) {
        trail.push({ x: smooth.x * w, y: smooth.y * h, alpha: .7 });
        if (trail.length > 22) trail.shift();
      }
      trail.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(227,23,18,${point.alpha})`;
        ctx.fill();
        point.alpha *= .93;
      });
      trail = trail.filter((point) => point.alpha > .04);
      if (running()) frameId = requestAnimationFrame(draw);
    }
    function move(event: PointerEvent) {
      if (!scene || reduced() || event.pointerType === 'touch') return;
      const rect = scene.getBoundingClientRect();
      pointer = {
        x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
        y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
        active: true,
      };
    }
    function leave() { pointer.active = false; pointer.x = .5; pointer.y = .5; }
    function change() { cancelAnimationFrame(frameId); draw(); }
    function onMotion(event: Event) {
      paused = (event as CustomEvent<{ paused: boolean }>).detail.paused;
      if (paused) { smooth = { x: .5, y: .5 }; trail = []; }
      change();
    }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; change(); });
    observer.observe(hero);
    document.addEventListener('ddra:motion', onMotion);
    document.addEventListener('visibilitychange', change);
    hero.addEventListener('pointermove', move);
    hero.addEventListener('pointerleave', leave);
    addEventListener('resize', resize, { passive: true });
    addEventListener('scroll', scroll, { passive: true });
    motion.addEventListener('change', change);
    resize(); scroll(); draw();
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      document.removeEventListener('ddra:motion', onMotion);
      document.removeEventListener('visibilitychange', change);
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', leave);
      removeEventListener('resize', resize);
      removeEventListener('scroll', scroll);
      motion.removeEventListener('change', change);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
