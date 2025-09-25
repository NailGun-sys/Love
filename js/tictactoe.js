;(function(){
  const boardEl = document.getElementById('tttBoard');
  const statusEl = document.getElementById('tttStatus');
  const restartBtn = document.getElementById('tttRestart');

  const LINES = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  let cells = Array(9).fill(null); // 'X' (user) or 'O' (ai)
  let userTurn = true;
  let gameOver = false;

  function render(){
    boardEl.innerHTML = '';
    cells.forEach((val, i) => {
      const btn = document.createElement('button');
      btn.className = 'ttt-cell' + (val==='O' ? ' ai' : '');
      btn.textContent = val ? val : '';
      btn.disabled = !!val || gameOver || !userTurn;
      btn.addEventListener('click', () => onUserMove(i));
      boardEl.appendChild(btn);
    });
    const win = getWinner();
    if (win) {
      highlightWin(win.line);
      statusEl.textContent = win.winner === 'X' ? 'Ты победил! 💖' : 'ИИ победил 🙈';
      gameOver = true;
    } else if (cells.every(Boolean)) {
      statusEl.textContent = 'Ничья';
      gameOver = true;
    } else {
      statusEl.textContent = userTurn ? 'Твой ход' : 'Ход ИИ...';
    }
  }

  function getWinner(){
    for (const line of LINES) {
      const [a,b,c] = line;
      if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
        return { winner: cells[a], line };
      }
    }
    return null;
  }

  function highlightWin(line){
    const items = boardEl.querySelectorAll('.ttt-cell');
    line.forEach(i => items[i].classList.add('win'));
  }

  function onUserMove(i){
    if (!userTurn || gameOver || cells[i]) return;
    cells[i] = 'X';
    userTurn = false; render();
    if (!gameOver) setTimeout(aiMove, 350);
  }

  function aiMove(){
    // 1) win if possible
    const winMove = findBestMove('O'); if (winMove != null) { placeAi(winMove); return; }
    // 2) block user's win
    const block = findBestMove('X'); if (block != null) { placeAi(block); return; }
    // 3) take center, then corners, then sides
    const order = [4,0,2,6,8,1,3,5,7];
    for (const i of order) if (!cells[i]) { placeAi(i); return; }
  }

  function findBestMove(mark){
    for (const line of LINES) {
      const [a,b,c] = line;
      const vals = [cells[a],cells[b],cells[c]];
      const countMark = vals.filter(v=>v===mark).length;
      const empties = [a,b,c].filter(i=>!cells[i]);
      if (countMark === 2 && empties.length === 1) return empties[0];
    }
    return null;
  }

  function placeAi(i){
    cells[i] = 'O'; userTurn = true; render();
  }

  function reset(){
    cells = Array(9).fill(null); userTurn = true; gameOver = false; render();
  }

  restartBtn && restartBtn.addEventListener('click', reset);

  // init when visible
  const section = document.getElementById('tictactoe');
  if (section) {
    let initialized = false;
    const ob = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting && !initialized) { initialized = true; reset(); } });
    }, { threshold: 0.2 });
    ob.observe(section);
  }
})();


