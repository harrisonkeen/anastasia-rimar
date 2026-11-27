/* MOCKUP ONLY: package picker. Client-review build: shows at the plain URL (?nooptions hides); strip this file when a package is locked. */
(() => {
  const q = location.search;
  if (/[?&]nooptions/.test(q)) return;
  const PKGS = [['1', 'Midnight', 'Plum velvet under a starry sky · her name gathers from the stars · photos float as constellations'], ['2', 'Golden hour', 'White hero, her name writes first · sunlit linen page · a fanned hand of photos'], ['3', 'Velvet', 'Plum velvet · her name opens into her portrait · scroll montage · photos through the page']];
  const cur = (location.pathname.match(/p([1-3])\.html$/) || [, '1'])[1];
  const css = document.createElement('style');
  css.textContent = `
  .pk{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:9999;width:252px;background:#fff;color:#16171a;border-radius:12px;
      box-shadow:0 18px 50px rgba(0,0,0,.35);font:500 13px/1.3 system-ui,-apple-system,sans-serif;overflow:hidden}
  .pk h6{margin:0;padding:11px 14px;font:700 11px system-ui;letter-spacing:.12em;text-transform:uppercase;display:flex;justify-content:space-between;align-items:center;background:#16171a;color:#fff;cursor:pointer}
  .pk a{display:block;padding:10px 14px;text-decoration:none;color:inherit;border-top:1px solid #eee}
  .pk a b{display:block;font-size:14px}.pk a span{color:#777;font-size:12px}
  .pk a.on{background:#f6efe6;box-shadow:inset 3px 0 #a4804c}.pk a:hover{background:#f6f6f6}
  .pk.min a{display:none}
  @media (max-width:700px){.pk{width:auto;left:12px;right:12px}}`;
  document.head.append(css);
  const el = document.createElement('div'); el.className = 'pk';
  el.innerHTML = `<h6>Pick a look <span>&#9662;</span></h6>` + PKGS.map(([n, t, s]) =>
    `<a href="p${n}.html?options" class="${n === cur ? 'on' : ''}"><b>Package ${n} · ${t}</b><span>${s}</span></a>`).join('');
  if (innerWidth < 700) el.classList.add('min');
  el.querySelector('h6').addEventListener('click', () => el.classList.toggle('min'));
  document.body.append(el);
})();
