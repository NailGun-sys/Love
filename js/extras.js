(function(){
  // MAP
  // (removed per request)

  // ALBUM
  const albumGrid = document.getElementById('albumGrid');
  const albumFile = document.getElementById('albumFile');
  const albumClear = document.getElementById('albumClear');
  const albumExport = document.getElementById('albumExport');
  const albumImport = document.getElementById('albumImport');
  const ALBUM_KEY = 'album_v1';
  let photos = JSON.parse(localStorage.getItem(ALBUM_KEY) || '[]');
  // Preload from assets/album/* if present and local album is empty
  const DEFAULTS = [
    'IMG_0854.JPG',
    'IMG_1010.JPG',
    'IMG_1022.JPG',
    'Screenshot_3.png',
    'photo_2025-08-20_00-46-04.jpg',
    'photo_2025-09-01_20-54-15.jpg',
    'photo_2025-09-01_20-54-19.jpg',
    'photo_2025-09-07_02-07-46.jpg',
    'photo_2025-09-07_15-51-45.jpg',
    'photo_2025-09-15_17-03-14.jpg'
  ];
  if (photos.length === 0 && DEFAULTS.length) {
    photos = DEFAULTS.map(n => 'album/' + n);
    saveAlbum();
  }
  function renderAlbum(){
    if (!albumGrid) return;
    albumGrid.innerHTML='';
    photos.forEach((u,idx)=>{
      const fig = document.createElement('figure'); fig.className = 'photo';
      const img = document.createElement('img'); img.src = u; img.alt = 'photo'; fig.appendChild(img);
      fig.addEventListener('click', ()=>{
        const viewer = document.getElementById('photoViewer');
        const viewerImg = document.getElementById('photoViewerImg');
        if (viewer && viewerImg) {
          viewerImg.src = u;
          try { viewer.showModal(); } catch (_) { viewer.setAttribute('open',''); }
        }
      });
      albumGrid.appendChild(fig);
    });
  }
  function saveAlbum(){ localStorage.setItem(ALBUM_KEY, JSON.stringify(photos)); }
  async function handleFiles(e){
    const files = Array.from(e.target.files || []);
    for (const f of files) {
      try {
        const dataUrl = await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(f); });
        photos.push(String(dataUrl));
      } catch(_) {}
    }
    saveAlbum(); renderAlbum(); e.target.value='';
  }
  albumFile && albumFile.addEventListener('change', handleFiles);
  const albumUpload = document.getElementById('albumUpload');
  albumUpload && albumUpload.addEventListener('click', ()=>{ albumFile && albumFile.files && handleFiles({ target: albumFile }); });
  // Support explicit upload button if needed in future; auto-add on select is kept
  albumClear && albumClear.addEventListener('click', ()=>{ if(confirm('Очистить альбом?')){ photos=[]; saveAlbum(); renderAlbum(); }});

  // Export / Import to share across devices
  albumExport && albumExport.addEventListener('click', () => {
    try {
      const blob = new Blob([JSON.stringify({ photos }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'pixel-album.json'; a.click();
      setTimeout(()=>URL.revokeObjectURL(url), 1500);
    } catch(_) {}
  });
  albumImport && albumImport.addEventListener('click', async () => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'application/json';
    inp.onchange = async (e) => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      try {
        const text = await f.text();
        const data = JSON.parse(text);
        if (Array.isArray(data.photos)) {
          photos = data.photos.filter(x => typeof x === 'string');
          saveAlbum(); renderAlbum();
          alert('Альбом импортирован!');
        } else {
          alert('Файл не похож на альбом.');
        }
      } catch(err) {
        alert('Не удалось импортировать файл.');
      }
    };
    inp.click();
  });

  // ACHIEVEMENTS
  const questList = document.getElementById('questList');
  const QUEST_KEY = 'quests_session_v1';
  let done = {}; // session only
  function setBadge(key, val){ done[key]=val; localStorage.setItem(QUEST_KEY, JSON.stringify(done)); const b=document.querySelector(`[data-badge="${key}"]`); if (b) b.classList.toggle('active', !!val); }
  function renderQuests(){ if (!questList) return; ['petal10','petal20','petal35','petal50','petal75','harvest5','harvest10','harvest15','harvest20','harvest25','fish5','fish10','fish15','fish20','fish25'].forEach(k=> setBadge(k, done[k]===true)); }

  // GUESTBOOK
  const guestForm = document.getElementById('guestForm');
  const guestList = document.getElementById('guestList');
  const GUEST_KEY = 'guestbook_v1';
  let notes = JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
  function renderGuest(){
    if (!guestList) return;
    guestList.innerHTML='';
    notes.forEach((n, idx) => {
      const li = document.createElement('li');
      const txt = document.createElement('span'); txt.textContent = n.m; li.appendChild(txt);
      const del = document.createElement('button'); del.textContent = '✖'; del.style.border='none'; del.style.background='transparent'; del.style.cursor='pointer'; del.style.marginLeft='8px'; del.addEventListener('click', ()=>{ notes.splice(idx,1); localStorage.setItem(GUEST_KEY, JSON.stringify(notes)); renderGuest(); });
      li.appendChild(del);
      guestList.appendChild(li);
    });
  }
  guestForm && guestForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const msg = document.getElementById('guestMsg').value.trim();
    if (!msg) return;
    notes.push({ m:msg, t:Date.now() });
    localStorage.setItem(GUEST_KEY, JSON.stringify(notes));
    (document.getElementById('guestMsg').value = '');
    renderGuest();
  });

  // init when sections visible
  function onView(id, fn){ const s = document.getElementById(id); if(!s) return; const ob = new IntersectionObserver(es=>{ es.forEach(e=>{ if(e.isIntersecting){ fn(); ob.disconnect(); } }); }); ob.observe(s); }
  onView('album', renderAlbum);
  onView('achievements', renderQuests);
  onView('guestbook', renderGuest);

  // Listen to scores from games via custom events
  function celebrate(name){
    try { const a = new Audio('assets/Joe Hisaishi - Merry-Go-Round.mp3'); a.volume = 0.1; a.play().catch(()=>{}); setTimeout(()=>a.pause(), 800); } catch(_) {}
    const toast = document.createElement('div');
    toast.textContent = `Достижение: ${name}!`;
    Object.assign(toast.style, { position:'fixed', left:'50%', top:'14px', transform:'translateX(-50%)', background:'#fff', padding:'10px 14px', borderRadius:'12px', boxShadow:'0 8px 24px rgba(255,77,136,.25)', zIndex:'60', color:'#39182d' });
    document.body.appendChild(toast);
    setTimeout(()=> toast.remove(), 1600);
    // simple confetti
    for (let i=0;i<60;i++) {
      const s = document.createElement('div');
      s.textContent = ['✨','🌸','💖','🌟'][i%4];
      Object.assign(s.style, { position:'fixed', left: (Math.random()*100)+'vw', bottom:'0', fontSize:(12+Math.random()*14)+'px', animation:'conf 1.2s linear forwards', zIndex:'59' });
      document.body.appendChild(s);
      setTimeout(()=> s.remove(), 1500);
    }
  }
  const style = document.createElement('style');
  style.textContent = `@keyframes conf { from { transform: translateY(0); opacity:1 } to { transform: translateY(-90vh); opacity:.1 } }`;
  document.head.appendChild(style);

  window.addEventListener('petal:score', (e)=>{
    const s = Number(e.detail||0);
    if (s >= 10 && !done.petal10) { setBadge('petal10', true); celebrate('Лепестки 10'); }
    if (s >= 20 && !done.petal20) { setBadge('petal20', true); celebrate('Лепестки 20'); }
    if (s >= 35 && !done.petal35) { setBadge('petal35', true); celebrate('Лепестки 35'); }
    if (s >= 50 && !done.petal50) { setBadge('petal50', true); celebrate('Лепестки 50'); }
    if (s >= 75 && !done.petal75) { setBadge('petal75', true); celebrate('Лепестки 75'); }
  });
  window.addEventListener('harvest:score', (e)=>{
    const s = Number(e.detail||0);
    if (s >= 5 && !done.harvest5) { setBadge('harvest5', true); celebrate('Урожай 5'); }
    if (s >= 10 && !done.harvest10) { setBadge('harvest10', true); celebrate('Урожай 10'); }
    if (s >= 15 && !done.harvest15) { setBadge('harvest15', true); celebrate('Урожай 15'); }
    if (s >= 20 && !done.harvest20) { setBadge('harvest20', true); celebrate('Урожай 20'); }
    if (s >= 25 && !done.harvest25) { setBadge('harvest25', true); celebrate('Урожай 25'); }
  });
  window.addEventListener('fish:score', (e)=>{
    const s = Number(e.detail||0);
    if (s >= 5 && !done.fish5) { setBadge('fish5', true); celebrate('Рыбалка 5'); }
    if (s >= 10 && !done.fish10) { setBadge('fish10', true); celebrate('Рыбалка 10'); }
    if (s >= 15 && !done.fish15) { setBadge('fish15', true); celebrate('Рыбалка 15'); }
    if (s >= 20 && !done.fish20) { setBadge('fish20', true); celebrate('Рыбалка 20'); }
    if (s >= 25 && !done.fish25) { setBadge('fish25', true); celebrate('Рыбалка 25'); }
  });
})();


