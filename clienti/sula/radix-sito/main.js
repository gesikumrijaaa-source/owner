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

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Gentle lift on scroll. Content stays visible even if this never runs.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduce && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.remove('pending'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.section h2, .card, .steps li, .audiences article, .numbers__grid div, .producer__media, .range__label')
    .forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top > window.innerHeight) { el.classList.add('lift', 'pending'); io.observe(el); }
    });

  // Slow parallax on the hero landscape
  const land = document.querySelector('.hero__land');
  addEventListener('scroll', () => {
    const y = scrollY;
    if (y < 900) land.style.transform = `translateX(-50%) translateY(${y * -0.12}px)`;
  }, { passive: true });
}
