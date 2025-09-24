(function() {
  // Animated background: soft particles reacting to pointer
  const bg = document.getElementById('bgCanvas');
  if (bg) {
    const ctx = bg.getContext('2d');
    let W = 0, H = 0;
    let pointer = { x: -9999, y: -9999 };
    const particles = Array.from({ length: 48 }, () => ({ x: Math.random(), y: Math.random(), r: 8+Math.random()*10, vx: (Math.random()-.5)*.0008, vy: (Math.random()-.5)*.0008 }));
    function resize(){ W = bg.width = window.innerWidth; H = bg.height = window.innerHeight; }
    resize(); window.addEventListener('resize', resize);
    window.addEventListener('pointermove', (e)=>{ pointer.x = e.clientX; pointer.y = e.clientY; });
    function loop(){
      ctx.clearRect(0,0,W,H);
      // soft gradient background
      const g = ctx.createLinearGradient(0,0,W,H);
      g.addColorStop(0,'#fff5fa'); g.addColorStop(1,'#ffe9f2');
      ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
      particles.forEach(p=>{
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        const px = p.x * W, py = p.y * H;
        // repel from pointer
        const dx = px - pointer.x, dy = py - pointer.y; const d2 = dx*dx + dy*dy;
        if (d2 < 120*120) { p.vx += (dx/Math.max(80,Math.sqrt(d2))) * 0.0008; p.vy += (dy/Math.max(80,Math.sqrt(d2))) * 0.0008; }
        ctx.beginPath(); ctx.fillStyle = 'rgba(255, 133, 170, .12)'; ctx.arc(px, py, p.r, 0, Math.PI*2); ctx.fill();
      });
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
  // Password gate
  const GATE_KEY = 'gift_unlocked';
  const gate = document.getElementById('gate');
  const gateForm = document.getElementById('gateForm');
  const gateInput = document.getElementById('gateInput');
  function unlock() {
    if (gate) gate.style.display = 'none';
    localStorage.setItem(GATE_KEY, '1');
    document.body.style.overflow = '';
    window.dispatchEvent(new Event('unlocked'));
    // show welcome, then fade away
    const welcome = document.getElementById('welcome');
    if (welcome) {
      welcome.classList.add('show');
      setTimeout(() => {
        welcome.classList.add('hide');
      }, 1000);
      setTimeout(() => {
        welcome.style.display = 'none';
        document.querySelectorAll('main > section, .site-header').forEach(el => el.classList.add('reveal'));
      }, 1800);
    }
  }
  if (localStorage.getItem(GATE_KEY) === '1') {
    if (gate) gate.style.display = 'none';
    const welcome = document.getElementById('welcome');
    if (welcome) setTimeout(() => { welcome.classList.add('show'); setTimeout(()=>{ welcome.classList.add('hide'); }, 600); setTimeout(()=>{ welcome.style.display='none'; }, 1400); }, 50);
  } else if (gate) {
    document.body.style.overflow = 'hidden';
    gate.style.display = 'grid';
    setTimeout(() => gateInput && gateInput.focus(), 50);
  }
  if (gateForm) {
    gateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = (gateInput?.value || '').trim();
      if (val === 'Да это я') {
        unlock();
      } else {
        gateInput.classList.add('shake');
        setTimeout(() => gateInput.classList.remove('shake'), 400);
      }
    });
  }
  // Simple navigation between sections
  function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('section--active'));
    const el = document.querySelector(id);
    if (el) { el.classList.add('section--active');
      // apply reveal to children entering view
      const kids = el.querySelectorAll('.cardx, .pixel-card, .photo, .daily-card');
      kids.forEach((k, i) => setTimeout(()=> k.classList.add('reveal'), i*40));
    }
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-target]');
    if (btn) {
      e.preventDefault();
      const id = btn.getAttribute('data-target');
      showSection(id);
    }
  });

  // Double-tap in bottom-right region to open Admin (within 350ms, small movement)
  (function(){
    let lastTap = 0; let lastX = 0; let lastY = 0;
    window.addEventListener('pointerdown', (e) => {
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
      const w = window.innerWidth, h = window.innerHeight;
      const inBR = (e.clientX >= w - 10) && (e.clientY >= h - 10); // 10px bottom-right corner
      if (!inBR) { lastTap = 0; return; }
      const now = Date.now();
      const dt = now - lastTap;
      const dx = e.clientX - lastX; const dy = e.clientY - lastY;
      if (dt < 350 && (dx*dx + dy*dy) < (42*42)) {
        lastTap = 0; showSection('#admin');
      } else {
        lastTap = now; lastX = e.clientX; lastY = e.clientY;
      }
    }, { passive: true });
  })();

  // Animated flowers field on landing
  const flowersRoot = document.querySelector('.flowers');
  const flowerEmojis = ['🌸','🌷','💮','🌺','🌼','🌻','🌹','🥀','🪷','🌾'];
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
    el.style.bottom = '-40px'; // ensure start from bottom on all devices
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
    const heartChoices = ['💗','💖','💕','💓','💞','💘','❤️','🧡','💜'];
    el.textContent = heartChoices[Math.floor(Math.random()*heartChoices.length)];
    el.style.left = (Math.random()*100) + 'vw';
    el.style.bottom = '0px';
    el.style.setProperty('--s', (12 + Math.random()*16) + 'px');
    heartsRoot.appendChild(el);
    setTimeout(() => el.remove(), 6000);
  }
  setInterval(spawnHeart, 1200);

  // Rotating love quotes
  const quotes = [
    'Ты мое самое любимое чудо',
    'Ты делаешь мир светлее и теплее',
    'Я тебя очень ценю!',
    'Спасибо что ты зажгла во мне тягу ко чтению',
    'Ты прекрасная',
    'Я люблю тебя',
  ];
  const quoteEl = document.getElementById('rotatingQuote');
  if (quoteEl) {
    let qi = 0;
    setInterval(() => {
      qi = (qi + 1) % quotes.length;
      quoteEl.textContent = quotes[qi];
    }, 3500);
  }

  // Daily message
  // Daily short block on home removed per request

  // Daily page render and admin wiring
  const dailyFull = document.getElementById('dailyMessageFull');
  const dailyInput = document.getElementById('dailyInput');
  const dailySave = document.getElementById('dailySave');
  const dailyClear = document.getElementById('dailyClear');
  function renderDaily() {
    const fallback = 'Сегодня я думаю о тебе';
    const val = (localStorage.getItem('dailyMessageCustom') || '').trim();
    if (daily) daily.textContent = val || fallback;
    if (dailyFull) dailyFull.textContent = val || fallback;
    if (dailyInput) dailyInput.value = val;
  }
  renderDaily();
  // Firebase sync (optional)
  (function(){
    const cfg = window.FIREBASE_CONFIG;
    if (!cfg || !window.firebase || !window.firebase.firestore) return;
    try {
      if (!window.firebase.apps.length) window.firebase.initializeApp(cfg);
      const db = window.firebase.firestore();
      const docRef = db.collection('loveApp').doc('dailyMessage');
      docRef.onSnapshot((snap) => {
        const data = snap.data();
        if (data && typeof data.text === 'string') {
          localStorage.setItem('dailyMessageCustom', data.text);
          renderDaily();
        }
      });
      function saveToRemote(text){ docRef.set({ text, updatedAt: Date.now() }).catch(()=>{}); }
      const origSave = dailySave && dailySave.onclick;
      dailySave && dailySave.addEventListener('click', () => { const t=(dailyInput?.value||'').trim(); saveToRemote(t); });
      dailyClear && dailyClear.addEventListener('click', () => { saveToRemote(''); });
    } catch(_) {}
  })();
  dailySave && dailySave.addEventListener('click', () => {
    const val = (dailyInput?.value || '').trim();
    localStorage.setItem('dailyMessageCustom', val);
    renderDaily();
  });
  dailyClear && dailyClear.addEventListener('click', () => {
    localStorage.removeItem('dailyMessageCustom');
    renderDaily();
  });

  // Hero playful buttons
  document.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.id === 'spawnHearts') {
      for (let i=0;i<6;i++) setTimeout(spawnHeart, i*120);
    }
    if (t.id === 'spawnFlowers') {
      for (let i=0;i<20;i++) setTimeout(spawnFlower, i*80);
    }
  });

  // Parallax for farm tiles
  (function(){
    const strip = document.querySelector('.farm-strip');
    if (!strip) return;
    strip.style.perspective = '600px';
    const tiles = Array.from(strip.querySelectorAll('.tile'));
    window.addEventListener('pointermove', (e) => {
      const cx = (e.clientX / window.innerWidth) - .5;
      tiles.forEach((el, i) => {
        const depth = (i%3 - 1) * 6; // -6,0,6
        el.style.transform = `translateZ(${depth}px) translateX(${cx*depth}px)`;
      });
    });
  })();

  // Music playback toggle
  const musicToggle = document.getElementById('musicToggle');
  let audio;
  function ensureAudio(){
    if (!audio) {
      audio = new Audio('assets/Joe Hisaishi - Merry-Go-Round.mp3');
      audio.loop = true;
      audio.volume = 0.35;
    }
    return audio;
  }
  function playMusic(){ ensureAudio().play().catch(()=>{}); musicToggle && (musicToggle.textContent='🔊'); }
  function pauseMusic(){ if(audio){ audio.pause(); } musicToggle && (musicToggle.textContent='🔈'); }
  musicToggle && musicToggle.addEventListener('click', ()=>{ if (audio && !audio.paused) pauseMusic(); else playMusic(); });
  const playMusicBtn = document.getElementById('playMusicBtn');
  const volume = document.getElementById('volume');
  playMusicBtn && playMusicBtn.addEventListener('click', () => playMusic());
  volume && volume.addEventListener('input', () => { ensureAudio(); audio.volume = Number(volume.value || '0.35'); });

  // Try autoplay when unlocked/loaded with user gesture fallbacks
  window.addEventListener('unlocked', () => { setTimeout(playMusic, 200); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(playMusic, 200); });
  window.addEventListener('load', () => {
    // attempt autoplay after a short delay; if blocked, it will be allowed after first tap
    setTimeout(() => playMusic(), 800);
  });

  // Secret letter dialog
  const openLetterBtn = document.getElementById('openLetter');
  if (openLetterBtn) {
    openLetterBtn.addEventListener('click', () => {
      const dlg = document.getElementById('secretLetter');
      try { dlg.showModal(); } catch (e) { dlg.setAttribute('open',''); }
    });
  }

  // Promises checklist persistence
  const promiseList = document.getElementById('promiseList');
  if (promiseList) {
    const inputs = promiseList.querySelectorAll('input[type="checkbox"]');
    inputs.forEach(inp => {
      const key = 'promise_' + inp.dataset.key;
      inp.checked = localStorage.getItem(key) === '1';
      inp.addEventListener('change', () => {
        localStorage.setItem(key, inp.checked ? '1' : '0');
      });
    });
  }
})();



