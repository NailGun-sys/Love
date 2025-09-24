(function() {
  const grid = document.getElementById('memoryGrid');
  const movesEl = document.getElementById('moves');
  const matchesEl = document.getElementById('matches');
  const restartBtn = document.getElementById('restartMemory');

  const icons = ['🌸','🌷','🌺','🌼','🌻','💮','💐','🪻'];
  let firstCard = null;
  let lock = false;
  let moves = 0;
  let matches = 0;

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function createCard(icon, index) {
    const card = document.createElement('button');
    card.className = 'card';
    card.setAttribute('aria-label', 'карта');
    card.dataset.icon = icon;
    card.innerHTML = `
      <div class="card__inner">
        <div class="card__face card__face--front">❀</div>
        <div class="card__face card__face--back">${icon}</div>
      </div>
    `;
    card.addEventListener('click', () => flipCard(card));
    return card;
  }

  function setup() {
    grid.innerHTML = '';
    firstCard = null;
    lock = false;
    moves = 0; matches = 0;
    movesEl.textContent = '0';
    matchesEl.textContent = '0';

    const deck = shuffle([...icons, ...icons]);
    deck.forEach((icon, i) => grid.appendChild(createCard(icon, i)));
  }

  function flipCard(card) {
    if (lock || card.classList.contains('is-flipped') || card.classList.contains('matched')) return;
    card.classList.add('is-flipped');
    if (!firstCard) {
      firstCard = card; return;
    }
    moves += 1; movesEl.textContent = String(moves);
    if (firstCard.dataset.icon === card.dataset.icon) {
      // match
      firstCard.classList.add('matched');
      card.classList.add('matched');
      matches += 1; matchesEl.textContent = String(matches);
      firstCard = null;
      if (matches === icons.length) {
        setTimeout(() => {
          const dlg = document.getElementById('loveModal');
          try { dlg.showModal(); } catch (e) { dlg.setAttribute('open', ''); }
        }, 400);
      }
    } else {
      // not a match
      lock = true;
      setTimeout(() => {
        firstCard.classList.remove('is-flipped');
        card.classList.remove('is-flipped');
        firstCard = null; lock = false;
      }, 700);
    }
  }

  restartBtn.addEventListener('click', setup);
  // Initialize when section becomes visible first time
  let initialized = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !initialized) {
        initialized = true; setup();
      }
    });
  }, { threshold: 0.2 });
  const section = document.getElementById('memory');
  if (section) observer.observe(section);
})();



