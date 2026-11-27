/* Natasha Rimar · shared page script for the package pages (p1–p3). Pages without a .sky-fx canvas (P2, P3) skip the sky.
   <html data-sky="dawn">  night → sunrise down the page: stars up high, clouds + balloons at dawn (P1, P3)
   <html data-sky="night"> starry all the way down, no daylight (P1)
   <html data-credits="grid|index"> how the credit list is laid out */
(() => {
  const root = document.documentElement, hero = document.querySelector('.hero');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NIGHT = root.dataset.sky === 'night';

  // ---------- credits: the full list ----------
  // the list lives in the page's <template class="credit-src"> (edit.harrisonkeen.tech rewrites it): groups of title + detail
  const SRC = [...(document.querySelector('.credit-src')?.content.querySelectorAll('.g') || [])].map(g => ({
    name: g.querySelector('h3')?.textContent.trim() || '',
    rows: [...g.querySelectorAll('li')].map(li => [li.querySelector('b')?.textContent || '', li.querySelector('i')?.textContent || '']),
  }));
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const cols = document.querySelector('.cols');
  if (cols && root.dataset.credits === 'index') {
    // grouped index: the first group in two balanced columns, then the rest; numbered like a filmography
    let n = 0;
    const row = ([t, p]) => `<li class="credit"><span class="n">${String(++n).padStart(2, '0')}</span><span class="t">${esc(t)}</span><span class="p">${esc(p)}</span></li>`;
    cols.innerHTML = SRC.filter(g => g.rows.length).map((g, gi) => `<div class="grp"><h3>${esc(g.name)} <em>${g.rows.length}</em></h3><ol${gi === 0 ? ' class="two"' : ''}>${g.rows.map(row).join('')}</ol></div>`).join('');
  } else if (cols) {
    SRC.forEach(g => g.rows.forEach(([t, p]) => cols.insertAdjacentHTML('beforeend', `<div class="credit"><span class="t">${esc(t)}</span><span class="r">${esc(g.name)}</span><span class="p">${esc(p)}</span></div>`)));
  }

  // ---------- lightbox: the full-size file is the img's largest srcset entry (an editor-replaced photo), else data-full ----------
  const largest = img => (img.getAttribute('srcset') || '').split(',').map(c => c.trim().split(/\s+/)).filter(c => c[0]).sort((a, b) => parseInt(b[1]) - parseInt(a[1]))[0]?.[0];
  const lb = document.querySelector('.lb'), lbImg = lb.querySelector('img');
  document.addEventListener('click', e => { const b = e.target.closest('.still button'); if (!b) return;
    const img = b.parentElement.querySelector('img'); lbImg.src = largest(img) || img.dataset.full || img.currentSrc || img.src; lbImg.alt = img.alt; lb.classList.add('open'); lb.querySelector('button').focus(); });
  const closeLb = () => lb.classList.remove('open');
  lb.addEventListener('click', e => { if (e.target !== lbImg) closeLb(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

  // ---------- podcast: the thumbnail is a facade; the YouTube player only loads on click ----------
  document.querySelectorAll('[data-yt]').forEach(b => b.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${b.dataset.yt}?autoplay=1&rel=0`;
    f.title = b.getAttribute('aria-label') || 'Podcast'; f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
    b.replaceWith(f);
  }));

  // ---------- opening: loss → love → light (her photo racks into focus and stays) → name → agency line → the sky ----------
  // a page can set its own timing: <header class="hero" data-t="…"> = seconds until her photo is in (P4's openings differ)
  let PHOTO_IN = 6.9, SKY_AT = PHOTO_IN + 1.5;
  let timers = [], skyAt = still ? -1e9 : 1e12;
  const skySince = () => (performance.now() - skyAt) / 1000;
  const ramp = (t, d) => { const k = Math.min(1, Math.max(0, t / d)); return k * k * (3 - 2 * k); };
  function playHero() {
    timers.forEach(clearTimeout); timers = [];
    PHOTO_IN = +(hero.dataset.t || 6.9); SKY_AT = hero.dataset.skyAt != null ? +hero.dataset.skyAt : PHOTO_IN + 1.5;   // data-sky-at: P1's stars come out first
    hero.classList.remove('play', 'done', 'named', 'sky-in');
    if (still) { hero.classList.add('done', 'named', 'sky-in'); return; }
    skyAt = 1e12; void hero.offsetWidth; hero.classList.add('play');
    const at = (s, f) => timers.push(setTimeout(f, s * 1000));
    at(PHOTO_IN - .7, () => hero.classList.add('named'));
    at(SKY_AT, () => { skyAt = performance.now(); hero.classList.add('sky-in'); });
    at(PHOTO_IN + .1, () => { hero.classList.remove('play'); hero.classList.add('done'); });
  }

  // ---------- light motes in the hero ----------
  const mc = document.querySelector('.motes');
  let moteRun = 0;
  function motes() {
    const run = ++moteRun; if (still || !mc) return;
    const W = hero.clientWidth, H = hero.clientHeight, d = Math.min(devicePixelRatio || 1, 2);
    mc.width = W * d; mc.height = H * d; const x = mc.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0);
    const ps = Array.from({ length: Math.round(W * H / 16000) }, () => ({ x: Math.random() * W, y: Math.random() * H, r: .6 + Math.random() * 1.8, v: 6 + Math.random() * 16, w: Math.random() * 6.28, a: .25 + Math.random() * .5, d: Math.random() * 2.4 }));
    let last = performance.now();
    (function f(now) {
      if (run !== moteRun) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      x.clearRect(0, 0, W, H);
      if (scrollY < H) { const t = skySince();
        ps.forEach(p => {
          p.y -= p.v * dt; p.w += dt * .8; p.x += Math.sin(p.w) * .18;
          if (p.y < -6) { p.y = H + 6; p.x = Math.random() * W; }
          x.fillStyle = `rgba(246, 214, 160, ${p.a * ramp(t - p.d, 2.2) * (.6 + .4 * Math.sin(p.w * 2.3))})`;
          x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill();
        }); }
      requestAnimationFrame(f);
    })(last);
  }

  // ---------- the sky's fine detail, placed along the page ----------
  const fx = document.querySelector('.sky-fx'), fc = fx && fx.getContext('2d');
  let world = [], docH = 0, VW = 0, VH = 0;
  const rnd = (a, b) => a + Math.random() * (b - a);
  // where the stars may start (P1: under the self-contained hero, so none are wasted behind it)
  const heroCovers = () => root.dataset.hero === 'full' ? hero.offsetHeight / document.documentElement.scrollHeight : 0;
  function buildSky() {
    if (!fx) return;
    const d = Math.min(devicePixelRatio || 1, 2); VW = innerWidth; VH = innerHeight;
    fx.width = VW * d; fx.height = VH * d; fc.setTransform(d, 0, 0, d, 0, 0);
    docH = document.documentElement.scrollHeight; world = [];
    const phone = VW < 760, top = heroCovers();
    const span = NIGHT ? 1 - top : .55, area = VW * docH * span;
    for (let i = 0; i < area / (phone ? 3200 : 2400) * (NIGHT ? .8 : 1); i++) {
      const f = top + (NIGHT ? Math.random() : Math.pow(Math.random(), 1.6)) * span;
      world.push({ k: 'star', f, x: Math.random() * VW, r: Math.random() < .06 ? rnd(1.1, 1.7) : rnd(.35, .95), tw: rnd(0, 6.28), sp: rnd(.6, 2.2), d: 1, w: rnd(0, 2.6) });
    }
    if (NIGHT) return;
    const clouds = phone ? 9 : 16;
    for (let i = 0; i < clouds; i++) {
      const f = rnd(.5, .95), dd = rnd(.55, .9);
      world.push({ k: 'cloud', f, x: Math.random() * VW, w: rnd(120, 300) * (phone ? .7 : 1), v: rnd(3, 9) * (Math.random() < .5 ? -1 : 1), d: dd, a: rnd(.18, .38),
        puffs: Array.from({ length: 6 }, () => [rnd(-.5, .5), rnd(-.12, .1), rnd(.22, .4)]) });
    }
    const hues = [['#d9848f', '#f6e6d6', '#b9874f'], ['#7f9bc8', '#f2ebdc', '#d6a35c'], ['#e9a274', '#fbf0de', '#9c5a4a'], ['#b48ab8', '#f6e9ef', '#c79a5a'], ['#e7b5a6', '#fbf4ea', '#7f6aa0']];
    for (let i = 0; i < (phone ? 3 : 5); i++) {
      const s = phone ? rnd(15, 24) : rnd(17, 32), dd = .55 + (s - 15) / 17 * .3;
      const o = { k: 'balloon', f: [.5, .56, .9, .62, .94][i], x: (phone ? rnd(.08, .92) : (i % 2 ? rnd(.88, .96) : rnd(.03, .1))) * VW, s, d: dd, bob: rnd(0, 6.28), v: rnd(2, 6), flame: rnd(2, 9) };
      o.img = balloonSprite(s, hues[i % hues.length]); world.push(o);
    }
  }
  function balloonSprite(s, [c0, c1, acc]) {
    const d = Math.min(devicePixelRatio || 1, 2), W = s * 2.6, H = s * 3.5, cv = document.createElement('canvas');
    cv.width = Math.ceil(W * d); cv.height = Math.ceil(H * d); const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, W / 2 * d, s * 1.3 * d);
    const top = -1.2 * s, eq = -.2 * s, throat = 1.05 * s;
    const hw = y => y <= eq ? Math.sqrt(Math.max(0, s * s - (y - eq) ** 2)) : .26 * s + .74 * s * Math.cos(Math.PI / 2 * ((y - eq) / (throat - eq))) ** 1.15;
    const ys = Array.from({ length: 61 }, (_, i) => top + (throat - top) * i / 60);
    const env = new Path2D(); ys.forEach((y, i) => env[i ? 'lineTo' : 'moveTo'](-hw(y), y)); [...ys].reverse().forEach(y => env.lineTo(hw(y), y)); env.closePath();
    c.save(); c.clip(env);
    const N = 10, u = k => Math.sin(-Math.PI / 2 + Math.PI * k / N);
    for (let k = 0; k < N; k++) {
      c.beginPath(); ys.forEach((y, i) => c[i ? 'lineTo' : 'moveTo'](u(k) * hw(y), y)); [...ys].reverse().forEach(y => c.lineTo(u(k + 1) * hw(y), y)); c.closePath();
      c.fillStyle = k % 2 ? c1 : c0; c.fill();
      c.save(); c.clip(); c.fillStyle = k % 2 ? c0 : c1; c.fillRect(-s, eq + .18 * s, 2 * s, .2 * s); c.restore();
    }
    c.fillStyle = acc; c.fillRect(-s, eq + .15 * s, 2 * s, .035 * s); c.fillRect(-s, eq + .38 * s, 2 * s, .035 * s);
    c.beginPath(); c.arc(0, top + .05 * s, .42 * s, 0, 7); c.fill();
    c.strokeStyle = 'rgba(70, 40, 50, .22)'; c.lineWidth = .5;
    for (let k = 1; k < N; k++) { c.beginPath(); ys.forEach((y, i) => c[i ? 'lineTo' : 'moveTo'](u(k) * hw(y), y)); c.stroke(); }
    let g = c.createRadialGradient(-.38 * s, -.62 * s, 0, -.38 * s, -.62 * s, 1.1 * s);
    g.addColorStop(0, 'rgba(255, 252, 245, .55)'); g.addColorStop(1, 'rgba(255, 252, 245, 0)'); c.fillStyle = g; c.fillRect(-s, top, 2 * s, throat - top);
    g = c.createLinearGradient(-s, 0, s, 0); g.addColorStop(0, 'rgba(40, 20, 50, 0)'); g.addColorStop(.55, 'rgba(40, 20, 50, .05)'); g.addColorStop(1, 'rgba(40, 20, 50, .38)');
    c.fillStyle = g; c.fillRect(-s, top, 2 * s, throat - top); c.restore();
    c.strokeStyle = 'rgba(60, 35, 45, .45)'; c.lineWidth = .6; c.stroke(env);
    c.fillStyle = acc; c.beginPath(); c.moveTo(-.26 * s, throat); c.lineTo(.26 * s, throat); c.lineTo(.17 * s, throat + .2 * s); c.lineTo(-.17 * s, throat + .2 * s); c.fill();
    const bt = throat + .62 * s, bw = .36 * s, bh = .3 * s;
    c.strokeStyle = 'rgba(70, 45, 40, .7)'; c.lineWidth = .55; c.beginPath();
    [[-.17, -.5], [-.06, -.22], [.06, .22], [.17, .5]].forEach(([a, b]) => { c.moveTo(a * s, throat + .2 * s); c.lineTo(b * bw, bt); }); c.stroke();
    g = c.createLinearGradient(-bw / 2, 0, bw / 2, 0); g.addColorStop(0, '#a1714a'); g.addColorStop(.4, '#8a5c38'); g.addColorStop(1, '#5e3c26');
    c.fillStyle = g; c.beginPath(); c.moveTo(-bw / 2, bt); c.lineTo(bw / 2, bt); c.lineTo(bw * .42, bt + bh); c.lineTo(-bw * .42, bt + bh); c.fill();
    c.strokeStyle = 'rgba(50, 30, 20, .5)'; c.lineWidth = .4; c.beginPath();
    for (let i = 1; i < 3; i++) { c.moveTo(-bw / 2 + i * .02 * s, bt + bh * i / 3); c.lineTo(bw / 2 - i * .02 * s, bt + bh * i / 3); }
    for (let i = -2; i <= 2; i++) { c.moveTo(i * bw / 5.5, bt); c.lineTo(i * bw / 6.5, bt + bh); } c.stroke();
    c.fillStyle = '#4a2e1e'; c.fillRect(-bw / 2 - .02 * s, bt - .04 * s, bw + .04 * s, .07 * s);
    return { cv, W, H, ox: W / 2, oy: s * 1.3, throat };
  }
  let shooting = null, nextShoot = 4;
  const screenY = o => { const wy = o.f * docH; return wy - scrollY + (scrollY + VH / 2 - wy) * (1 - o.d); };
  function drawBalloon(o, y, t, dt) {
    const b = o.img, by = y + Math.sin(t * .6 + o.bob) * 6;
    fc.save(); fc.globalAlpha = .62 + (o.d - .55) * .9; fc.translate(o.x, by); fc.rotate(Math.sin(t * .45 + o.bob) * .03);
    fc.drawImage(b.cv, -b.ox, -b.oy, b.W, b.H);
    o.flame -= dt;
    if (o.flame < 0) { const p = -o.flame / .8;
      if (p > 1) o.flame = rnd(4, 10); else { const fy = b.throat + o.s * .32, r = o.s * (.16 + .1 * Math.sin(p * Math.PI));
        const g = fc.createRadialGradient(0, fy, 0, 0, fy, r * 2.2); g.addColorStop(0, `rgba(255, 236, 170, ${.95 * Math.sin(p * Math.PI)})`); g.addColorStop(.35, `rgba(255, 160, 70, ${.6 * Math.sin(p * Math.PI)})`); g.addColorStop(1, 'rgba(255, 140, 60, 0)');
        fc.fillStyle = g; fc.beginPath(); fc.arc(0, fy, r * 2.2, 0, 7); fc.fill(); } }
    fc.restore();
  }
  let skyLast = performance.now(), skyT = 0;
  function sky(now) {
    const dt = Math.min(.05, (now - skyLast) / 1000); skyLast = now; skyT += dt;
    fc.clearRect(0, 0, VW, VH);
    const skyT0 = scrollY < VH ? skySince() : 99, heroHidden = skyT0 < 0;
    for (const o of world) {
      const y = screenY(o); if (y < -80 || y > VH + 80) continue;
      if (o.k === 'star') {
        if (heroHidden && o.f * docH < VH) continue;
        const fade = NIGHT ? 1 : (o.f < .3 ? 1 : 1 - (o.f - .3) / .25);
        const a = (o.f * docH < VH ? ramp(skyT0 - o.w, 1.8) : 1) * fade * (.45 + .55 * Math.sin(skyT * o.sp + o.tw) ** 2);
        fc.fillStyle = `rgba(255, 250, 238, ${a * .9})`; fc.beginPath(); fc.arc(o.x, y, o.r, 0, 7); fc.fill();
        if (o.r > 1.1) { fc.fillStyle = `rgba(255, 244, 220, ${a * .12})`; fc.beginPath(); fc.arc(o.x, y, o.r * 4, 0, 7); fc.fill(); }
      } else if (o.k === 'cloud') {
        o.x += o.v * dt; if (o.x > VW + o.w) o.x = -o.w; if (o.x < -o.w) o.x = VW + o.w;
        for (const [px, py, pr] of o.puffs) {
          const cx = o.x + px * o.w, cy = y + py * o.w, r = pr * o.w;
          const g = fc.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, `rgba(255, 246, 240, ${o.a})`); g.addColorStop(1, 'rgba(255, 246, 240, 0)');
          fc.fillStyle = g; fc.beginPath(); fc.arc(cx, cy, r, 0, 7); fc.fill();
        }
      } else if (o.k === 'balloon') { o.x += o.v * dt * .3; if (o.x > VW + 40) o.x = -40; drawBalloon(o, y, skyT, dt); }
    }
    // the odd shooting star while the night is on screen (all the way down on the starry-night page)
    if ((NIGHT || scrollY < docH * .3) && skyT0 > 4.5 && !(root.dataset.hero === 'full' && scrollY < hero.offsetHeight - VH * .5)) {
      nextShoot -= dt;
      if (!shooting && nextShoot < 0) { shooting = { x: rnd(.2, .9) * VW, y: rnd(.05, .4) * VH, t: 0 }; nextShoot = rnd(5, 11); }
      if (shooting) { const s = shooting; s.t += dt; const p = s.t / .9;
        if (p >= 1) shooting = null; else { const hx = s.x - p * 260, hy = s.y + p * 110;
          const g = fc.createLinearGradient(hx, hy, hx + 90, hy - 38); g.addColorStop(0, `rgba(255,250,235,${.8 * (1 - p)})`); g.addColorStop(1, 'rgba(255,250,235,0)');
          fc.strokeStyle = g; fc.lineWidth = 1.2; fc.beginPath(); fc.moveTo(hx, hy); fc.lineTo(hx + 90, hy - 38); fc.stroke(); } }
    }
    requestAnimationFrame(sky);
  }

  // ---------- photo clusters: each print drifts at its own speed as you scroll past ----------
  const SPEEDS = [.07, -.02, .11, .03, -.04];
  const drifts = [...document.querySelectorAll('.drift')];
  function parallax() {
    const k = innerWidth < 760 ? 0 : 1;
    drifts.forEach(d => { const r = d.getBoundingClientRect(), off = r.top + r.height / 2 - innerHeight / 2;
      if (r.bottom < -400 || r.top > innerHeight + 400) return;
      [...d.children].forEach((el, i) => el.style.setProperty('--py', (off * SPEEDS[i % SPEEDS.length] * k).toFixed(1) + 'px')); });
  }
  let pq = 0; if (!still) { addEventListener('scroll', () => { if (!pq) pq = requestAnimationFrame(() => { pq = 0; parallax(); }); }, { passive: true }); parallax(); }

  // ---------- footer: the sun (or moon) rises when you reach it ----------
  const foot = document.querySelector('footer');
  new IntersectionObserver(es => es.forEach(e => e.isIntersecting && foot.classList.add('up')), { threshold: .25 }).observe(foot);

  let rs; addEventListener('resize', () => { clearTimeout(rs); rs = setTimeout(() => { motes(); buildSky(); }, 200); });
  addEventListener('load', buildSky);
  window.anaReplay = playHero;
  buildSky(); playHero(); motes();
  if (!still && fx) requestAnimationFrame(sky);
})();
