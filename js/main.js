(function() {
  // Password gate
  const GATE_KEY = 'gift_unlocked';
  const gate = document.getElementById('gate');
  const gateForm = document.getElementById('gateForm');
  const gateInput = document.getElementById('gateInput');
  function unlock() {
    if (gate) gate.style.display = 'none';
    localStorage.setItem(GATE_KEY, '1');
    document.body.style.overflow = '';
  }
  if (localStorage.getItem(GATE_KEY) === '1') {
    if (gate) gate.style.display = 'none';
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

  // Rotating love quotes
  const quotes = [
    'Ты мое самое любимое чудо. ✨',
    'С тобой каждый день - праздник. 🎀',
    'Ты делаешь мир светлее и теплее. 💗',
    'Я выбираю тебя. Всегда. ♡',
  ];
  const quoteEl = document.getElementById('rotatingQuote');
  if (quoteEl) {
    let qi = 0;
    setInterval(() => {
      qi = (qi + 1) % quotes.length;
      quoteEl.textContent = quotes[qi];
    }, 3500);
  }

  // Hero playful buttons
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t && t.id === 'spawnHearts') {
      for (let i=0;i<6;i++) setTimeout(spawnHeart, i*120);
    }
    if (t && t.id === 'spawnFlowers') {
      for (let i=0;i<6;i++) setTimeout(spawnFlower, i*120);
    }
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



