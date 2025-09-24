(function() {
  const grid = document.getElementById('harvestGrid');
  const scoreEl = document.getElementById('harvestScore');
  const restart = document.getElementById('harvestRestart');
  const size = 25; // 5x5
  let timers = [];
  let score = 0;

  function clearTimers() { timers.forEach(t => clearTimeout(t)); timers = []; }

  function setup() {
    clearTimers();
    grid.innerHTML = '';
    score = 0; scoreEl.textContent = '0';
    for (let i = 0; i < size; i++) {
      const plot = document.createElement('button');
      plot.className = 'plot';
      plot.dataset.state = 'empty';
      plot.addEventListener('click', () => onPlotClick(plot));
      grid.appendChild(plot);
    }
  }

  function onPlotClick(plot) {
    const state = plot.dataset.state;
    if (state === 'empty') {
      plant(plot);
    } else if (state === 'ready') {
      harvest(plot);
    }
  }

  function plant(plot) {
    plot.dataset.state = 'growing';
    plot.innerHTML = '<div class="sprout">🌱</div>';
    const growT = setTimeout(() => {
      plot.dataset.state = 'ready';
      plot.innerHTML = '<div class="crop">🥕</div>';
      // fade out after some time if not harvested
      const witherT = setTimeout(() => {
        if (plot.dataset.state === 'ready') {
          plot.dataset.state = 'empty'; plot.innerHTML = '';
        }
      }, 4000);
      timers.push(witherT);
    }, 1500 + Math.random()*800);
    timers.push(growT);
  }

  function harvest(plot) {
    plot.dataset.state = 'empty';
    plot.innerHTML = '';
    score += 1; scoreEl.textContent = String(score);
  }

  restart && restart.addEventListener('click', setup);

  // init on first view
  let initialized = false;
  const section = document.getElementById('harvest');
  if (section) {
    const ob = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting && !initialized) { initialized = true; setup(); } });
    }, { threshold: 0.2 });
    ob.observe(section);
  }
})();


