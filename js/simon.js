;(function(){
  const startBtn = document.getElementById('simonStart');
  const levelEl = document.getElementById('simonLevel');
  const bestEl = document.getElementById('simonBest');
  const board = document.getElementById('simonBoard');
  const pads = board ? Array.from(board.querySelectorAll('.simon-pad')) : [];

  let seq = [];
  let inputIndex = 0;
  let playing = false;
  let best = Number(localStorage.getItem('simonBest') || '0');
  if (bestEl) bestEl.textContent = String(best);

  function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

  async function flashPad(i){
    const pad = pads[i]; if (!pad) return; pad.classList.add('active');
    await sleep(300); pad.classList.remove('active'); await sleep(100);
  }

  async function playSequence(){
    playing = true;
    startBtn && (startBtn.disabled = true);
    for (let i=0;i<seq.length;i++) {
      await flashPad(seq[i]);
    }
    playing = false;
    startBtn && (startBtn.disabled = false);
  }

  function nextStep(){
    seq.push(Math.floor(Math.random()*4));
    levelEl && (levelEl.textContent = String(seq.length));
    if (seq.length > best) { best = seq.length; bestEl && (bestEl.textContent = String(best)); localStorage.setItem('simonBest', String(best)); }
    playSequence(); inputIndex = 0;
  }

  function reset(){ seq = []; inputIndex = 0; levelEl && (levelEl.textContent = '0'); }

  function onPadPress(i){
    if (playing || seq.length === 0) return;
    const expected = seq[inputIndex];
    if (i === expected) {
      inputIndex += 1;
      if (inputIndex === seq.length) {
        setTimeout(nextStep, 400);
      }
    } else {
      // wrong -> gentle shake effect via board
      board && (board.classList.add('shake'), setTimeout(()=>board.classList.remove('shake'), 400));
      reset();
    }
  }

  startBtn && startBtn.addEventListener('click', () => {
    if (playing) return; reset(); nextStep();
  });
  pads.forEach((pad, idx) => pad.addEventListener('click', () => onPadPress(idx)));

  // lazy init: ensure pads exist only when section visible
  const section = document.getElementById('simon');
  if (section) {
    let initialized = false;
    const ob = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting && !initialized) { initialized = true; reset(); } });
    }, { threshold: 0.2 });
    ob.observe(section);
  }
})();


