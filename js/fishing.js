(function() {
  const bar = document.getElementById('fishBar');
  const zone = document.getElementById('fishZone');
  const marker = document.getElementById('fishMarker');
  const scoreEl = document.getElementById('fishScore');
  const restart = document.getElementById('fishRestart');
  let score = 0;
  let pos = 0; // 0..1
  let vel = 0.5; // units per second
  let zoneLeft = 0.3; // 0..1
  let zoneWidth = 0.18;
  let running = false;
  let last = 0;

  function layout() {
    if (!bar) return;
    const w = bar.clientWidth;
    marker.style.left = Math.round(pos * w) + 'px';
    zone.style.left = Math.round(zoneLeft * w) + 'px';
    zone.style.width = Math.round(zoneWidth * w) + 'px';
  }

  function reset() {
    score = 0; scoreEl.textContent = '0';
    pos = 0; vel = 0.6;
    zoneLeft = 0.2 + Math.random()*0.6 - 0.1;
    zoneWidth = 0.14 + Math.random()*0.1;
    layout();
  }

  function step(ts) {
    if (!running) return;
    const dt = last ? (ts - last)/1000 : 0.016; last = ts;
    pos += vel * dt;
    if (pos > 1) { pos = 1; vel *= -1; }
    if (pos < 0) { pos = 0; vel *= -1; }
    layout();
    requestAnimationFrame(step);
  }

  function tap() {
    const inZone = pos >= zoneLeft && pos <= zoneLeft + zoneWidth;
    if (inZone) {
      score += 1; scoreEl.textContent = String(score);
      // move zone and speed up slightly
      zoneLeft = Math.max(0.05, Math.min(0.85, Math.random()*0.9));
      vel = Math.min(1.2, vel + 0.05);
      layout();
    } else {
      // small penalty
      vel = Math.max(0.4, vel - 0.05);
    }
  }

  function start() { if (running) return; running = true; last = 0; requestAnimationFrame(step); }
  function stop() { running = false; }

  restart && restart.addEventListener('click', () => { reset(); start(); });
  window.addEventListener('keydown', (e) => { if (e.key === ' '){ e.preventDefault(); tap(); } });
  bar && bar.addEventListener('pointerdown', tap);
  window.addEventListener('resize', layout);

  // init when visible
  let initialized = false;
  const section = document.getElementById('fishing');
  if (section) {
    const ob = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting && !initialized) { initialized = true; reset(); start(); } });
    }, { threshold: 0.2 });
    ob.observe(section);
  }
})();


