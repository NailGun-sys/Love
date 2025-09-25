;(function(){
  const listEl = document.getElementById('guestList');
  const formEl = document.getElementById('guestForm');
  const inputEl = document.getElementById('guestMsg');

  async function apiList(){
    const res = await fetch('/api/guestbook', { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('list_failed');
    return await res.json();
  }
  async function apiAdd(text){
    const res = await fetch('/api/guestbook', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error('add_failed');
    return await res.json();
  }

  function render(items){
    listEl.innerHTML = '';
    items.sort((a,b)=>a.createdAt-b.createdAt).forEach(it => {
      const li = document.createElement('li');
      const date = new Date(it.createdAt);
      const ts = date.toLocaleString();
      li.textContent = `${ts}: ${it.text}`;
      listEl.appendChild(li);
    });
  }

  async function load(){
    try { const items = await apiList(); render(items); }
    catch(_) { /* ignore */ }
  }

  if (formEl) {
    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = (inputEl.value||'').trim();
      if (!text) return;
      inputEl.disabled = true;
      try {
        await apiAdd(text);
        inputEl.value='';
        await load();
      } finally { inputEl.disabled = false; inputEl.focus(); }
    });
  }

  // Load when section becomes visible the first time
  const section = document.getElementById('guestbook');
  if (section) {
    let initialized = false;
    const ob = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting && !initialized) { initialized = true; load(); } });
    }, { threshold: 0.15 });
    ob.observe(section);
  }
})();


