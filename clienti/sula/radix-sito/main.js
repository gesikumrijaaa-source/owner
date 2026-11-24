document.documentElement.classList.add('js');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

// 3D tin: turns slowly on its own, can be dragged, light follows the angle
const tin = document.getElementById('tin');
if (tin) {
  const faces = { front: 0, right: 90, back: 180, left: -90 };
  const els = Object.fromEntries(Object.keys(faces).map(k => [k, tin.querySelector('.tin__' + k)]));
  let ry = -32, vel = 0, dragging = false, lastX = 0, idleUntil = 0;
  const render = () => {
    tin.style.setProperty('--ry', ry + 'deg');
    for (const k in faces) {
      const c = Math.cos((ry + faces[k]) * Math.PI / 180); // 1 = facing the viewer
      const lightAngle = Math.cos((ry + faces[k] + 30) * Math.PI / 180); // light from front-left
      els[k].style.setProperty('--shade', Math.min(.75, Math.max(0, .55 - lightAngle * .55 + (c < 0 ? .3 : 0))).toFixed(3));
    }
  };
  const loop = () => {
    if (!dragging) {
      if (Math.abs(vel) > .02) { ry += vel; vel *= .94; }
      else if (performance.now() > idleUntil && !reduce) ry += .12;
    }
    render();
    requestAnimationFrame(loop);
  };
  const wrap = tin.parentElement;
  wrap.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; vel = 0; wrap.setPointerCapture(e.pointerId); });
  wrap.addEventListener('pointermove', e => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; ry += dx * .45; vel = dx * .45; });
  const end = () => { dragging = false; idleUntil = performance.now() + 2500; };
  wrap.addEventListener('pointerup', end); wrap.addEventListener('pointercancel', end);
  render(); requestAnimationFrame(loop);
}

// Below-the-fold motion: counters, gentle lift, process photos
if (!reduce && 'IntersectionObserver' in window) {
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
  document.querySelectorAll('[data-to]').forEach(el => { if (below(el)) { el.textContent = '0'; io.observe(el); } });
  document.querySelectorAll('.section h2, .card, .facts article, .audiences article, .scale li, .producer__media, .compare, .nutri')
    .forEach(el => { if (below(el)) { el.classList.add('lift', 'pending'); io.observe(el); } });
}
const steps = [...document.querySelectorAll('.process__steps li')];
const shots = [...document.querySelectorAll('.process__media img')];
const count = document.querySelector('.process__count b');
if (steps.length && 'IntersectionObserver' in window) {
  const so = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const i = steps.indexOf(e.target);
    steps.forEach((s, j) => s.classList.toggle('is-active', j === i));
    shots.forEach((s, j) => s.classList.toggle('is-active', j === i));
    if (count) count.textContent = '0' + (i + 1);
  }), { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(s => so.observe(s));
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
  const update = () => {
    const opt = form.querySelector('input[name="format"]:checked');
    const n = Math.max(1, Math.round(+qty.value || 1));
    unit.textContent = opt.dataset.unit;
    let text;
    if (opt.dataset.l === 'ton') {
      text = `≈ ${fmt(n * 1000 / KG_PER_L)} litres of oil (${fmt(n)} ${n === 1 ? 'ton' : 'tons'})`;
    } else if (opt.dataset.l) {
      const litres = n * +opt.dataset.l;
      text = `≈ ${fmt(litres, 2)} litres of oil, about ${fmt(litres * KG_PER_L / 1000, 2)} tons`;
    } else text = 'Describe the format in your message and we will advise you.';
    est.textContent = text;
    hidden.value = `${n} ${opt.dataset.unit} of ${opt.value}. ${text}`;
  };
  form.querySelectorAll('input[name="format"]').forEach(r => r.addEventListener('change', () => {
    if (r.dataset.l === 'ton' && +qty.value > 100) qty.value = 20;
    if (r.dataset.unit !== 'tons' && +qty.value < 10) qty.value = 120;
    update();
  }));
  form.querySelectorAll('.qty__btn').forEach(b => b.addEventListener('click', () => {
    const v = Math.max(1, Math.round(+qty.value || 0));
    const step = v >= 1000 ? 100 : v >= 100 ? 10 : 1;
    qty.value = Math.max(1, v + step * +b.dataset.step);
    update();
  }));
  qty.addEventListener('input', update);
  update();
}
