document.documentElement.classList.add('js');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasIO = 'IntersectionObserver' in window;

// Mobile menu
const nav = document.querySelector('.nav');
const toggle = document.querySelector('.nav__toggle');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
document.querySelectorAll('.nav__links a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', false);
}));
document.getElementById('year').textContent = new Date().getFullYear();

// Hero visibility: everything animated up there sleeps once the hero leaves the screen
const hero = document.querySelector('.hero');
let heroVisible = true;
const heroListeners = [];
if (hero && hasIO) {
  new IntersectionObserver(([e]) => {
    heroVisible = e.isIntersecting;
    hero.classList.toggle('is-off', !heroVisible);
    heroListeners.forEach(fn => fn());
  }).observe(hero);
}
document.addEventListener('visibilitychange', () => heroListeners.forEach(fn => fn()));
const heroActive = () => heroVisible && !document.hidden;

// 3D tin: turns slowly on its own, can be dragged, light follows the angle
const tin = document.getElementById('tin');
if (tin) {
  const faces = { front: 0, right: 90, back: 180, left: -90 };
  const els = Object.fromEntries(Object.keys(faces).map(k => [k, tin.querySelector('.tin__' + k)]));
  let ry = -32, vel = 0, dragging = false, lastX = 0, idleUntil = 0, running = false;
  const render = () => {
    tin.style.setProperty('--ry', ry.toFixed(2) + 'deg');
    for (const k in faces) {
      const c = Math.cos((ry + faces[k]) * Math.PI / 180);          // 1 = facing the viewer
      const light = Math.cos((ry + faces[k] + 30) * Math.PI / 180); // light from front-left
      els[k].style.setProperty('--shade', Math.min(.75, Math.max(0, .55 - light * .55 + (c < 0 ? .3 : 0))).toFixed(3));
    }
  };
  const frame = () => {
    if (!heroActive()) { running = false; return; }
    let moved = false;
    if (!dragging) {
      if (Math.abs(vel) > .02) { ry += vel; vel *= .94; moved = true; }
      else if (!reduce && performance.now() > idleUntil) { ry += .12; moved = true; }
    }
    if (moved) render();
    if (moved || dragging) requestAnimationFrame(frame); else running = false;
  };
  const start = () => { if (!running && heroActive()) { running = true; requestAnimationFrame(frame); } };
  heroListeners.push(start);
  const wrap = tin.parentElement;
  wrap.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; vel = 0; wrap.setPointerCapture(e.pointerId); start(); });
  wrap.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX; ry += dx * .45; vel = dx * .45; render();
  });
  const end = () => { dragging = false; idleUntil = performance.now() + 2500; start(); };
  wrap.addEventListener('pointerup', end); wrap.addEventListener('pointercancel', end);
  render(); start();
  // after a drag pause, the idle spin resumes on its own
  setInterval(() => { if (!dragging) start(); }, 1000);
}

// Hero photos: the first loads with the page, the others only after it has finished loading
const slides = [...document.querySelectorAll('.hero__bg img')];
const loadDeferred = () => {
  document.querySelectorAll('.hero__bg source[data-srcset]').forEach(s => { s.srcset = s.dataset.srcset; s.removeAttribute('data-srcset'); });
  slides.forEach(img => { if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); } });
};
if (document.readyState === 'complete') setTimeout(loadDeferred, 300);
else addEventListener('load', () => setTimeout(loadDeferred, 300));
if (slides.length > 1 && !reduce) {
  let cur = 0;
  setInterval(() => {
    if (!heroActive()) return;
    const next = slides[(cur + 1) % slides.length];
    if (!next.complete || next.naturalWidth < 2) return; // wait until it is really there
    slides[cur].classList.remove('is-active');
    cur = (cur + 1) % slides.length;
    next.classList.add('is-active');
  }, 7000);
}

// Below-the-fold motion: counters and a gentle lift. Content is visible even without it.
if (!reduce && hasIO) {
  const below = el => el.getBoundingClientRect().top > window.innerHeight;
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; io.unobserve(el);
    if (el.dataset.to !== undefined) {
      const to = +el.dataset.to, t0 = performance.now();
      const tick = t => { const p = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    } else el.classList.remove('pending');
  }), { rootMargin: '0px 0px -10% 0px' });
  // read every position first, then write, so the browser lays the page out only once
  const counters = [...document.querySelectorAll('[data-to]')].filter(below);
  const lifts = [...document.querySelectorAll('.section h2, .card, .facts article, .audiences article, .scale li, .producer__media, .compare')].filter(below);
  counters.forEach(el => { el.textContent = '0'; io.observe(el); });
  lifts.forEach(el => { el.classList.add('lift', 'pending'); io.observe(el); });
}

// Process: the fixed photo follows the step being read; its video plays only while shown
const steps = [...document.querySelectorAll('.process__steps li')];
const media = document.querySelector('.process__media');
const shots = media ? [...media.querySelectorAll(':scope > img, :scope > video')] : [];
const count = document.querySelector('.process__count b');
if (steps.length && hasIO) {
  const so = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const i = steps.indexOf(e.target);
    steps.forEach((s, j) => s.classList.toggle('is-active', j === i));
    shots.forEach((s, j) => {
      s.classList.toggle('is-active', j === i);
      if (s.tagName === 'VIDEO') {
        if (j === i && !reduce && media.offsetParent !== null) { s.preload = 'auto'; s.play().catch(() => {}); } else s.pause();
      }
    });
    if (count) count.textContent = '0' + (i + 1);
  }), { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(s => so.observe(s));
}

// Other videos play only while on screen (muted, looping, nothing downloaded before)
if (hasIO) {
  const vo = new IntersectionObserver(entries => entries.forEach(e => {
    const v = e.target;
    if (e.isIntersecting && !reduce) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
  }), { rootMargin: '200px 0px' });
  document.querySelectorAll('video[data-autoplay]').forEach(v => vo.observe(v));
}

// Quote builder: live litres and tons estimate
const form = document.getElementById('quote-form');
if (form) {
  const qty = document.getElementById('f-quantity');
  const unit = document.getElementById('qty-unit');
  const est = document.getElementById('qty-est');
  const hidden = document.getElementById('f-estimate');
  const KG_PER_L = 0.916; // typical density of olive oil
  const fmt = (n, d = 0) => n.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: 0 });
  const chosen = () => form.querySelector('input[name="format"]:checked');
  const read = () => { const v = parseFloat(qty.value); return Number.isFinite(v) && v > 0 ? v : 0; };
  const update = () => {
    const opt = chosen();
    const tons = opt.dataset.l === 'ton';
    const n = tons ? Math.max(0.1, Math.round(read() * 10) / 10) : Math.max(1, Math.round(read()));
    unit.textContent = opt.dataset.unit;
    let text;
    if (tons) {
      text = `≈ ${fmt(n * 1000 / KG_PER_L)} litres of oil (${fmt(n, 1)} ${n === 1 ? 'ton' : 'tons'})`;
    } else if (opt.dataset.l) {
      const litres = n * +opt.dataset.l;
      text = `≈ ${fmt(litres, 2)} litres of oil, about ${fmt(litres * KG_PER_L / 1000, 2)} tons`;
    } else text = 'Describe the format in your message and we will advise you.';
    est.textContent = text;
    hidden.value = `${fmt(n, 1)} ${opt.dataset.unit} of ${opt.value}. ${text}`;
  };
  form.querySelectorAll('input[name="format"]').forEach(r => r.addEventListener('change', () => {
    if (r.dataset.l === 'ton' && read() > 100) qty.value = 20;
    if (r.dataset.unit !== 'tons' && read() < 10) qty.value = 120;
    update();
  }));
  form.querySelectorAll('.qty__btn').forEach(b => b.addEventListener('click', () => {
    const tons = chosen().dataset.l === 'ton';
    const v = read();
    const step = tons ? (v >= 10 ? 5 : 1) : (v >= 1000 ? 100 : v >= 100 ? 10 : 1);
    const next = Math.round(v) + step * +b.dataset.step;
    qty.value = Math.max(1, next);
    update();
  }));
  qty.addEventListener('input', update);
  update();
}
