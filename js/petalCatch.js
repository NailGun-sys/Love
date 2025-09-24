(function() {
  const canvas = document.getElementById('petalCanvas');
  const ctx = canvas.getContext('2d');
  const restartBtn = document.getElementById('restartPetal');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');

  const W = canvas.width;
  const H = canvas.height;

  let petals = [];
  let basketX = W/2;
  let score = 0;
  let best = Number(localStorage.getItem('petalBest') || '0');
  bestEl.textContent = String(best);
  let running = false;
  let rafId = 0;

  function reset() {
    petals = [];
    score = 0; scoreEl.textContent = '0';
    basketX = W/2;
  }

  function spawnPetal() {
    const x = Math.random()*W;
    petals.push({ x, y: -20, r: 10 + Math.random()*8, vy: 1.4 + Math.random()*1.2 });
  }

  function drawBackground() {
    const grd = ctx.createLinearGradient(0,0,0,H);
    grd.addColorStop(0, '#ffffff');
    grd.addColorStop(1, '#fff7fb');
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,W,H);
  }

  function drawBasket() {
    const y = H - 30;
    ctx.fillStyle = '#ff6b9a';
    ctx.beginPath();
    ctx.ellipse(basketX, y, 40, 10, 0, 0, Math.PI*2);
    ctx.fill();
  }

  function drawPetals() {
    ctx.font = '20px serif';
    petals.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.y/50) % (Math.PI*2));
      ctx.fillText('🌸', -10, 10);
      ctx.restore();
    });
  }

  function update(dt) {
    // spawn
    if (Math.random() < 0.04) spawnPetal();
    // move petals
    petals.forEach(p => p.y += p.vy * dt * 60);

    // collisions with basket
    const basketY = H - 30;
    petals = petals.filter(p => {
      const dx = Math.abs(p.x - basketX);
      const dy = Math.abs(p.y - basketY);
      if (dy < 18 && dx < 40) {
        score += 1; scoreEl.textContent = String(score);
        if (score > best) { best = score; bestEl.textContent = String(best); localStorage.setItem('petalBest', String(best)); }
        return false;
      }
      return p.y < H + 20;
    });
  }

  let last = 0;
  function loop(ts) {
    if (!running) return;
    const dt = last ? (ts - last)/1000 : 0.016;
    last = ts;
    update(dt);
    drawBackground();
    drawPetals();
    drawBasket();
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true; last = 0; rafId = requestAnimationFrame(loop);
  }
  function stop() { running = false; cancelAnimationFrame(rafId); }

  // Controls: keyboard
  window.addEventListener('keydown', (e) => {
    if (!running) return;
    if (e.key === 'ArrowLeft') basketX = Math.max(40, basketX - 24);
    if (e.key === 'ArrowRight') basketX = Math.min(W-40, basketX + 24);
  });
  // Controls: touch / mouse drag
  function setXFromClient(clientX) {
    const rect = canvas.getBoundingClientRect();
    basketX = Math.max(40, Math.min(W-40, (clientX - rect.left) * (W/rect.width)));
  }
  canvas.addEventListener('pointerdown', (e) => { setXFromClient(e.clientX); });
  canvas.addEventListener('pointermove', (e) => { if (e.buttons) setXFromClient(e.clientX); });

  restartBtn.addEventListener('click', () => { reset(); start(); });

  // Start when section visible
  let initialized = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      if (ent.isIntersecting && !initialized) {
        initialized = true; reset(); start();
      }
    });
  }, { threshold: 0.2 });
  const section = document.getElementById('petal');
  if (section) observer.observe(section);
})();



