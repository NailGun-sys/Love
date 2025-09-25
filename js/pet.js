;(function(){
  const canvas = document.getElementById('petCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const bubble = document.getElementById('petBubble');
  const btnWave = document.getElementById('petWave');
  const btnSnack = document.getElementById('petSnack');

  const SPRITE = {
    idle: [
      // 8x8 simple bear face frames (strings -> pixels, scaled)
      [
        '........',
        '..hhhh..',
        '.hffffh.',
        'hffooffh',
        'hffffffh',
        'hfh..fhh',
        '.hhhhhh.',
        '........'
      ],
      [
        '........',
        '..hhhh..',
        '.hffffh.',
        'hffooffh',
        'hffffffh',
        'hf....hh',
        '.hhhhhh.',
        '........'
      ]
    ],
    sleep: [
      [
        '........',
        '..hhhh..',
        '.hffffh.',
        'hff..ffh',
        'hffffffh',
        'hfzzzzhh',
        '.hhhhhh.',
        '........'
      ]
    ],
    wave: [
      [
        '........',
        '..hhhh..',
        '.hffffh.',
        'hffooffh',
        'hff~ffhh',
        'hf....hh',
        '.hhhhhh.',
        '........'
      ]
    ],
    eat: [
      [
        '........',
        '..hhhh..',
        '.hffffh.',
        'hff**ffh',
        'hffffffh',
        'hf....hh',
        '.hhhhhh.',
        '........'
      ]
    ]
  };

  const COLORS = { '.':'rgba(0,0,0,0)', h:'#7a4a2e', f:'#f7cda2', o:'#39182d', z:'#a0a0a0', '~':'#ff85aa', '*':'#e67e22' };

  let mode = 'idle';
  let frame = 0;
  let last = 0;
  let greetShown = false;

  function timeMode(){
    const h = new Date().getHours();
    return (h >= 23 || h < 6) ? 'sleep' : 'idle';
  }

  function say(text, ms=1500){
    if (!bubble) return;
    bubble.textContent = text; bubble.hidden = false;
    clearTimeout(say._t); say._t = setTimeout(()=>{ bubble.hidden = true; }, ms);
  }

  function drawSprite(mat, scale=12){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (let y=0;y<mat.length;y++){
      for (let x=0;x<mat[y].length;x++){
        const c = COLORS[mat[y][x]] || 'transparent';
        if (c && c !== 'transparent') {
          ctx.fillStyle = c;
          ctx.fillRect(x*scale, y*scale, scale, scale);
        }
      }
    }
  }

  function loop(ts){
    const dt = last ? (ts-last)/1000 : 0; last = ts;
    const seq = SPRITE[mode] || SPRITE.idle;
    if (mode === 'idle') { if (dt>0.4) { frame=(frame+1)%seq.length; last=ts; } }
    drawSprite(seq[frame]);
    requestAnimationFrame(loop);
  }

  // greet on first visit this session
  window.addEventListener('load', () => {
    if (!greetShown) { say('Привет!'); greetShown = true; }
  });

  // react to visibility changes (sleep when tab hidden)
  document.addEventListener('visibilitychange', ()=>{
    if (document.hidden) mode = 'sleep'; else mode = timeMode();
  });

  // change mode by time every few minutes
  setInterval(()=>{ if (mode!=='wave' && mode!=='eat') mode = timeMode(); }, 60*1000);

  // interactions
  canvas.addEventListener('pointerdown', ()=>{ say('Люблю тебя 💖', 1800); });
  btnWave && btnWave.addEventListener('click', ()=>{ mode='wave'; say('Привет! 👋'); setTimeout(()=>{ mode=timeMode(); }, 1000); });
  btnSnack && btnSnack.addEventListener('click', ()=>{ mode='eat'; say('Ням-ням 🍪'); setTimeout(()=>{ mode=timeMode(); }, 1000); });

  // idle/sleep start
  mode = timeMode();
  requestAnimationFrame(loop);
})();


