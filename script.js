(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // Theme
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved) root.dataset.theme = saved;
  $('#themeToggle').addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', root.dataset.theme);
  });

  // Mobile menu
  const burger = $('#burger'), links = $('#navLinks');
  burger.addEventListener('click', () => { burger.classList.toggle('open'); links.classList.toggle('open'); });
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => { burger.classList.remove('open'); links.classList.remove('open'); }));

  // Scroll progress, nav state, back-to-top
  const progress = $('#progress'), nav = $('#nav'), toTop = $('#toTop');
  const onScroll = () => {
    const h = document.documentElement;
    progress.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
    nav.classList.toggle('scrolled', h.scrollTop > 40);
    toTop.classList.toggle('show', h.scrollTop > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Active nav link
  const secs = $$('main section[id]');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) $$('#navLinks a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(s => spy.observe(s));

  // Reveal on scroll + counters + skill bars
  const countUp = el => {
    const target = +el.dataset.count, suf = el.dataset.suffix || '';
    let n = 0; const step = Math.max(1, Math.ceil(target / 50));
    const t = setInterval(() => { n = Math.min(target, n + step); el.textContent = n + suf; if (n >= target) clearInterval(t); }, 28);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    $$('[data-count]', e.target).forEach(countUp);
    $$('.track i', e.target).forEach(i => i.style.width = i.dataset.w + '%');
    io.unobserve(e.target);
  }), { threshold: 0.15 });
  $$('.reveal').forEach(el => io.observe(el));

  // Typing effect
  const words = ['actionable insights.', 'interactive dashboards.', 'smarter decisions.', 'automated reports.', 'predictive models.'];
  const typed = $('#typed'); let w = 0, c = 0, del = false;
  (function type() {
    const word = words[w];
    typed.textContent = word.slice(0, c);
    if (!del && c === word.length) { del = true; return setTimeout(type, 1500); }
    if (del && c === 0) { del = false; w = (w + 1) % words.length; }
    c += del ? -1 : 1;
    setTimeout(type, del ? 35 : 70);
  })();

  // Project filter
  $('#filters').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('#filters button').forEach(x => x.classList.toggle('active', x === b));
    $$('.project').forEach(p => p.classList.toggle('hide', b.dataset.filter !== 'all' && p.dataset.cat !== b.dataset.filter));
  });

  // Contact form -> mailto
  $('#contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const n = $('#fName').value, em = $('#fEmail').value, m = $('#fMsg').value;
    location.href = `mailto:vipinparameswaran1985@gmail.com?subject=${encodeURIComponent('Portfolio enquiry from ' + n)}&body=${encodeURIComponent(m + '\n\n— ' + n + ' (' + em + ')')}`;
  });

  $('#year').textContent = new Date().getFullYear();

  // Animated data-network background
  const cv = $('#bg-canvas'), ctx = cv.getContext('2d');
  let W, H, pts; const mouse = { x: -999, y: -999 };
  const init = () => {
    W = cv.width = innerWidth; H = cv.height = innerHeight;
    const n = Math.min(90, Math.floor(W * H / 20000));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 }));
  };
  addEventListener('resize', init); init();
  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  (function draw() {
    ctx.clearRect(0, 0, W, H);
    const dark = root.dataset.theme === 'dark';
    const col = dark ? '99,179,255' : '37,99,235';
    pts.forEach((p, i) => {
      if (!reduce) { p.x += p.vx; p.y += p.vy; }
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 7); ctx.fillStyle = `rgba(${col},.7)`; ctx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 130) { ctx.strokeStyle = `rgba(${col},${.16 * (1 - d / 130)})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
      const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (dm < 160) { ctx.strokeStyle = `rgba(167,139,250,${.4 * (1 - dm / 160)})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    });
    requestAnimationFrame(draw);
  })();
})();
