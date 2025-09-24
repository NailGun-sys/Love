(function() {
  // Simple navigation between sections
  function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('section--active'));
    const el = document.querySelector(id);
    if (el) el.classList.add('section--active');
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-target]');
    if (btn) {
      e.preventDefault();
      const id = btn.getAttribute('data-target');
      showSection(id);
    }
  });

  // Animated flowers field on landing
  const flowersRoot = document.querySelector('.flowers');
  const flowerEmojis = ['🌸','🌷','💮','🌺','🌼','🌻'];
  function spawnFlower() {
    if (!flowersRoot) return;
    const el = document.createElement('div');
    el.className = 'flower';
    el.textContent = flowerEmojis[Math.floor(Math.random()*flowerEmojis.length)];
    const size = 18 + Math.random()*22; // 18-40 px
    const duration = 10 + Math.random()*10;
    const left = Math.random()*100;
    el.style.setProperty('--s', size+'px');
    el.style.setProperty('--d', duration+'s');
    el.style.left = left + '%';
    el.style.bottom = '-40px';
    flowersRoot.appendChild(el);
    setTimeout(() => el.remove(), duration*1000);
  }
  let flowerTimer = setInterval(spawnFlower, 500);
  window.addEventListener('visibilitychange', () => {
    if (document.hidden) { clearInterval(flowerTimer); }
    else { flowerTimer = setInterval(spawnFlower, 500); }
  });

  // Floating hearts
  const heartsRoot = document.querySelector('.hearts');
  function spawnHeart() {
    if (!heartsRoot) return;
    const el = document.createElement('div');
    el.className = 'heart';
    el.textContent = Math.random() > .5 ? '💗' : '💖';
    el.style.left = (50 + (Math.random()*40-20)) + 'vw';
    el.style.setProperty('--s', (12 + Math.random()*16) + 'px');
    heartsRoot.appendChild(el);
    setTimeout(() => el.remove(), 6000);
  }
  setInterval(spawnHeart, 1200);
})();



