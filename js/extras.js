(function(){
  // MAP
  // (removed per request)

  // ALBUM
  const albumGrid = document.getElementById('albumGrid');
  const albumFile = document.getElementById('albumFile');
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
  albumFile && albumFile.addEventListener('change', async (e)=>{
    const files = Array.from(e.target.files || []);
    for (const f of files) {
      try {
        const dataUrl = await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(f); });
        photos.push(String(dataUrl));
      } catch(_) {}
    }
    saveAlbum(); renderAlbum(); e.target.value='';
  });
  // Support explicit upload button if needed in future; auto-add on select is kept
  albumClear && albumClear.addEventListener('click', ()=>{ if(confirm('Очистить альбом?')){ photos=[]; saveAlbum(); renderAlbum(); }});

  // ACHIEVEMENTS
  const questList = document.getElementById('questList');
  const QUEST_KEY = 'quests_session_v1';
  let done = {}; // session only
  function setBadge(key, val){ done[key]=val; localStorage.setItem(QUEST_KEY, JSON.stringify(done)); const b=document.querySelector(`[data-badge="${key}"]`); if (b) b.classList.toggle('active', !!val); }
  function renderQuests(){ if (!questList) return; ['petal20','petal50','harvest10','fish10'].forEach(k=> setBadge(k, done[k]===true)); }

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
  window.addEventListener('petal:score', (e)=>{
    const s = Number(e.detail||0);
    if (s >= 20) setBadge('petal20', true);
    if (s >= 50) setBadge('petal50', true);
  });
  window.addEventListener('harvest:score', (e)=>{
    const s = Number(e.detail||0); if (s >= 10) setBadge('harvest10', true);
  });
  window.addEventListener('fish:score', (e)=>{
    const s = Number(e.detail||0); if (s >= 10) setBadge('fish10', true);
  });
})();


