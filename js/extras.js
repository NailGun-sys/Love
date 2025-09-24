(function(){
  // MAP
  const mapGrid = document.getElementById('mapGrid');
  const mapAdd = document.getElementById('mapAdd');
  const mapClear = document.getElementById('mapClear');
  const MAP_KEY = 'mapPins_v1';
  let pins = JSON.parse(localStorage.getItem(MAP_KEY) || '[]');

  function renderMap() {
    if (!mapGrid) return;
    mapGrid.innerHTML = '';
    for (let i=0;i<12*8;i++) {
      const cell = document.createElement('button');
      cell.className = 'cell';
      cell.dataset.idx = String(i);
      const pin = pins.find(p=>p.i===i);
      if (pin) {
        const pinEl = document.createElement('div'); pinEl.className = 'pin'; pinEl.textContent = '📍'; cell.appendChild(pinEl);
        cell.title = pin.t || '';
      }
      cell.addEventListener('click', () => editPin(i));
      mapGrid.appendChild(cell);
    }
  }
  function editPin(i){
    const current = pins.find(p=>p.i===i) || { i, t:'', u:'' };
    const t = prompt('Описание места', current.t || '');
    if (t===null) return;
    const u = prompt('URL фото (необязательно)', current.u || '');
    const idx = pins.findIndex(p=>p.i===i);
    const data = { i, t:t.trim(), u:u?.trim()||'' };
    if (t.trim()==='' && u.trim()==='') {
      if (idx>=0) pins.splice(idx,1);
    } else if (idx>=0) { pins[idx]=data; } else { pins.push(data); }
    localStorage.setItem(MAP_KEY, JSON.stringify(pins));
    renderMap();
  }
  mapAdd && mapAdd.addEventListener('click', ()=> editPin(0));
  mapClear && mapClear.addEventListener('click', ()=>{ if(confirm('Очистить все метки?')){ pins=[]; localStorage.setItem(MAP_KEY,'[]'); renderMap(); }});

  // ALBUM
  const albumGrid = document.getElementById('albumGrid');
  const albumAdd = document.getElementById('albumAdd');
  const albumClear = document.getElementById('albumClear');
  const ALBUM_KEY = 'album_v1';
  let photos = JSON.parse(localStorage.getItem(ALBUM_KEY) || '[]');
  function renderAlbum(){
    if (!albumGrid) return;
    albumGrid.innerHTML='';
    photos.forEach((u,idx)=>{
      const fig = document.createElement('figure'); fig.className = 'photo';
      const img = document.createElement('img'); img.src = u; img.alt = 'photo'; fig.appendChild(img);
      fig.addEventListener('click', ()=>{ if(confirm('Удалить фото?')){ photos.splice(idx,1); saveAlbum(); renderAlbum(); }});
      albumGrid.appendChild(fig);
    });
  }
  function saveAlbum(){ localStorage.setItem(ALBUM_KEY, JSON.stringify(photos)); }
  albumAdd && albumAdd.addEventListener('click', ()=>{
    const u = prompt('Вставь URL изображения'); if(!u) return; photos.push(u.trim()); saveAlbum(); renderAlbum();
  });
  albumClear && albumClear.addEventListener('click', ()=>{ if(confirm('Очистить альбом?')){ photos=[]; saveAlbum(); renderAlbum(); }});

  // ACHIEVEMENTS
  const questList = document.getElementById('questList');
  const QUEST_KEY = 'quests_v1';
  let done = JSON.parse(localStorage.getItem(QUEST_KEY) || '{}');
  function renderQuests(){
    if (!questList) return;
    questList.querySelectorAll('input[type="checkbox"]').forEach(cb=>{
      const k = cb.dataset.quest; cb.checked = done[k]===true;
      const badge = document.querySelector(`[data-badge="${k}"]`);
      if (badge) badge.classList.toggle('active', cb.checked);
      cb.addEventListener('change', ()=>{ done[k]=cb.checked; localStorage.setItem(QUEST_KEY, JSON.stringify(done)); if (badge) badge.classList.toggle('active', cb.checked); });
    });
  }

  // GUESTBOOK
  const guestForm = document.getElementById('guestForm');
  const guestList = document.getElementById('guestList');
  const GUEST_KEY = 'guestbook_v1';
  let notes = JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
  function renderGuest(){
    if (!guestList) return;
    guestList.innerHTML='';
    notes.forEach(n => {
      const li = document.createElement('li');
      li.textContent = `${n.n}: ${n.m}`;
      guestList.appendChild(li);
    });
  }
  guestForm && guestForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = document.getElementById('guestName').value.trim();
    const msg = document.getElementById('guestMsg').value.trim();
    if (!name || !msg) return;
    notes.push({ n:name, m:msg, t:Date.now() });
    localStorage.setItem(GUEST_KEY, JSON.stringify(notes));
    (document.getElementById('guestMsg').value = '');
    renderGuest();
  });

  // init when sections visible
  function onView(id, fn){ const s = document.getElementById(id); if(!s) return; const ob = new IntersectionObserver(es=>{ es.forEach(e=>{ if(e.isIntersecting){ fn(); ob.disconnect(); } }); }); ob.observe(s); }
  onView('map', renderMap);
  onView('album', renderAlbum);
  onView('achievements', renderQuests);
  onView('guestbook', renderGuest);
})();


