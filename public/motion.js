// Progressive enhancement: content stays visible when JavaScript is unavailable.
(() => {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const button = document.querySelector('[data-motion-toggle]');
  const label = button?.querySelector('[data-motion-label]');
  const es = root.lang === 'es';
  let paused = false;
  try { paused = sessionStorage.getItem('ddra-motion') === 'paused'; } catch {}
  let frameId = 0;
  const sections = [...document.querySelectorAll('[data-motion-section]')];
  const active = new Set();
  const reveals = [...document.querySelectorAll('[data-reveal]')];
  const animations = new Set();
  const reduce = () => paused || media.matches;

  function sync() {
    root.dataset.motion = reduce() ? 'off' : 'on';
    if (button) {
      button.hidden = false;
      button.setAttribute('aria-pressed', String(reduce()));
      button.disabled = media.matches;
      const icon = button.querySelector('[aria-hidden]');
      if (icon) icon.textContent = reduce() ? '▶' : 'Ⅱ';
      if (label) label.textContent = media.matches ? (es ? 'Movimiento reducido' : 'Reduced motion') : paused ? (es ? 'Activar movimiento' : 'Enable motion') : (es ? 'Pausar movimiento' : 'Pause motion');
    }
    if (reduce()) animations.forEach(animation => animation.finish());
    document.dispatchEvent(new CustomEvent('ddra:motion', { detail: { paused: reduce() } }));
    schedule();
  }
  button?.addEventListener('click', () => {
    paused = !paused;
    try { sessionStorage.setItem('ddra-motion', paused ? 'paused' : 'playing'); } catch {}
    sync();
  });

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle('is-active', entry.isIntersecting);
      if (entry.isIntersecting) active.add(entry.target); else active.delete(entry.target);
    });
    schedule();
  });
  sections.forEach(section => sectionObserver.observe(section));

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      revealObserver.unobserve(entry.target);
      if (reduce()) return;
      const siblings = [...(entry.target.parentElement?.children || [])];
      const stagger = Math.min(siblings.indexOf(entry.target), 3) * 70;
      const animation = entry.target.animate([
        { opacity: .25, transform: 'translateY(42px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: 850, delay: stagger, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
      animations.add(animation);
      animation.onfinish = () => animations.delete(animation);
    });
  }, { threshold: .08 });
  reveals.forEach(element => revealObserver.observe(element));

  function render() {
    frameId = 0;
    if (reduce()) return;
    active.forEach(section => {
      const rect = section.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (innerHeight / 2 - rect.top - rect.height / 2) / (innerHeight / 2 + rect.height / 2)));
      section.style.setProperty('--section-progress', progress.toFixed(3));
    });
  }
  function schedule() { if (!frameId && !document.hidden) frameId = requestAnimationFrame(render); }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  document.addEventListener('visibilitychange', () => {
    root.classList.toggle('tab-hidden', document.hidden);
    schedule();
  });
  media.addEventListener('change', sync);
  sync();
})();
