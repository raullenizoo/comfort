// Shared JS for all pages
(function(){
  // small helper to query
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  // year update
  const y = new Date().getFullYear();
  const yearEl = document.getElementById('year'); if(yearEl) yearEl.textContent = y;

  // Mobile menu
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if(mobileMenuBtn){ mobileMenuBtn.addEventListener('click', ()=> mobileMenu.classList.toggle('hidden')); }

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  const applyTheme = (t) => {
    if(t === 'dark') document.documentElement.style.background = '#06121a';
    else document.documentElement.style.background = '';
  };
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);
  if(themeToggle){ themeToggle.addEventListener('click', ()=>{ const n = (localStorage.getItem('theme')==='dark')?'light':'dark'; localStorage.setItem('theme', n); applyTheme(n); }); }

  // Affirmations & quotes shared data
  const affirmations = [
    "It's okay to feel lost sometimes. Your feelings are valid, and this challenging time won't define your entire career journey.",
    "Your passion and hard work have brought you this far, and they'll continue to guide you.",
    "Your passion and hard work have brought you this far, and they'll continue to guide you",
    "You are not defined by your doubts. You are defined by your strength and commitment to your goals.",
    "This is just a temporary setback, not the end of your story.",
    "Your unique perspective and talents are valuable and necessary in your field.",
    "Have faith in your abilities. You are capable of achieving great things, even if you can't see it right now."
  ];

  // Home page behaviors
  const ga = document.getElementById('generateAffirmation');
  if(ga){
    const output = document.getElementById('affirmationOutput');
    document.getElementById('generateAffirmation').addEventListener('click', () => {
      const pick = affirmations[Math.floor(Math.random() * affirmations.length)];
      output.textContent = pick;
      output.classList.add('fade-in-up');
      setTimeout(()=> output.classList.remove('fade-in-up'), 800);
    });
    document.getElementById('saveAffirmation').addEventListener('click', ()=>{
      const text = output.textContent.trim(); if(!text) return;
      const saved = document.getElementById('savedList'); if(saved){ const li = document.createElement('li'); li.className='p-2 rounded border'; li.textContent=text; saved.appendChild(li); }
    });
  }

  // Populate quotes page
  const quotesGrid = document.getElementById('quotesGrid');
  if(quotesGrid){
    affirmations.concat([
      "You deserve patience, especially from yourself.",
      "This feeling isn't the whole story — you're still writing it.",
    ]).forEach((q, idx)=>{
      const card = document.createElement('div');
      card.className='p-4 bg-white rounded-xl shadow-sm';
      card.innerHTML = `<p class=\"text-sm text-[color:var(--muted)]\">${q}</p><div class=\"mt-3 flex gap-2\"><button data-copy=\"${q.replace(/\"/g,'\\\"')}\" class=\"px-3 py-1 rounded bg-[color:var(--primary)] text-white text-sm copyBtn\">Copy</button><button class=\"px-3 py-1 rounded bg-white border saveQuote\">Save</button></div>`;
      quotesGrid.appendChild(card);
    });

    quotesGrid.addEventListener('click', (e)=>{
      if(e.target.matches('.copyBtn')){
        const t = e.target.getAttribute('data-copy'); navigator.clipboard?.writeText(t).then(()=>{ alert('Copied'); });
      }
      if(e.target.matches('.saveQuote')){
        const text = e.target.closest('div').previousElementSibling.textContent.trim(); const saved = document.getElementById('savedList'); if(saved){ const li = document.createElement('li'); li.className='p-2 rounded border'; li.textContent=text; saved.appendChild(li); }
      }
    });
  }

  // Journal behaviors
  const saveEntryBtn = document.getElementById('saveEntry');
  if(saveEntryBtn) saveEntryBtn.addEventListener('click', ()=>{
    const title = document.getElementById('entryTitle').value.trim();
    const body = document.getElementById('entryBody').value.trim();
    const mood = document.getElementById('entryMood').value;
    if(!body){ alert('No pressure — write anything you can.'); return; }
    const entries = JSON.parse(localStorage.getItem('journalEntries')||'[]');
    entries.unshift({id:Date.now(), title, body, mood, at:new Date().toISOString()});
    localStorage.setItem('journalEntries', JSON.stringify(entries));
    document.getElementById('entryTitle').value=''; document.getElementById('entryBody').value=''; renderEntries();
  });
  const entriesList = document.getElementById('entriesList');
  function renderEntries(filter){
    const entries = JSON.parse(localStorage.getItem('journalEntries')||'[]');
    const out = entries.filter(e => !filter || e.title.includes(filter) || e.body.includes(filter) || e.mood.includes(filter));
    if(!entriesList) return;
    entriesList.innerHTML = out.map(e=> `<div class=\"p-3 rounded border bg-[color:var(--card)]\"><div class=\"flex justify-between\"><strong>${e.title||'Untitled'}</strong><small class=\"text-[color:var(--muted)]\">${new Date(e.at).toLocaleString()}</small></div><div class=\"mt-2 text-sm text-[color:var(--muted)]\">${e.body}</div><div class=\"mt-2 text-xs text-[color:var(--muted)]\">Mood: ${e.mood}</div></div>`).join('');
  }
  if(document.getElementById('searchEntries')){
    document.getElementById('searchEntries').addEventListener('input', (e)=> renderEntries(e.target.value));
  }
  renderEntries();

  // Contact form (local validation + fake send)
  const contactForm = document.getElementById('contactForm');
  if(contactForm){ contactForm.addEventListener('submit', (ev)=>{
    ev.preventDefault(); const msg = document.getElementById('contactMessage').value.trim(); if(!msg){ alert('Please write a short message.'); return; }
    // For demo: store in localStorage; in production, send to server
    const contactList = JSON.parse(localStorage.getItem('contactList')||'[]');
    contactList.unshift({name: document.getElementById('contactName').value || 'Anonymous', email: document.getElementById('contactEmail').value || '', message: msg, at: new Date().toISOString()});
    localStorage.setItem('contactList', JSON.stringify(contactList));
    alert('Thanks — your message is saved locally (demo).');
    contactForm.reset();
  }); }

  // Breathing widget (shared)
  let breathingTimer = null;
  const circle = document.getElementById('breathingCircle');
  const label = document.getElementById('breathLabel');
  const phases = [ ['Inhale', 4], ['Hold', 4], ['Exhale', 6] ];
  function startBreathing(cycles=6){ if(!circle || breathingTimer) return; let cycleCount=0; if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){ label.textContent='Breathing — reduced motion'; return; }
    function runPhase(){
      if(cycleCount>=cycles){ label.textContent='Done'; circle.style.transform=''; clearInterval(breathingTimer); breathingTimer=null; return; }
      let i=0; const inner = ()=>{
        if(i>=phases.length){ i=0; cycleCount++; return; }
        const [name, seconds] = phases[i]; label.textContent=name; circle.style.transition = `transform ${seconds}s ease-in-out`; if(name==='Inhale') circle.style.transform='scale(1.25)'; else if(name==='Hold') circle.style.transform='scale(1.3)'; else circle.style.transform='scale(0.9)'; i++;
      };
      inner(); breathingTimer = setInterval(inner, 4000);
    }
    runPhase();
  }
  const startBtn = document.getElementById('startBreathe'); if(startBtn) startBtn.addEventListener('click', ()=> startBreathing(6));
  const stopBtn = document.getElementById('stopBreathe'); if(stopBtn) stopBtn.addEventListener('click', ()=>{ if(breathingTimer){ clearInterval(breathingTimer); breathingTimer=null; if(label) label.textContent='Stopped'; if(circle) circle.style.transform=''; } });

  // Quotes save to savedList if exists
  // Soft audio
  let audioCtx = null; let toneOsc = null;
  const playAudioBtn = document.getElementById('playAudio'); if(playAudioBtn){ playAudioBtn.addEventListener('click', ()=>{
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); if(toneOsc){ toneOsc.stop(); toneOsc=null; return; } toneOsc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); toneOsc.type='sine'; toneOsc.frequency.value=432; gain.gain.value=0.02; toneOsc.connect(gain).connect(audioCtx.destination); toneOsc.start(); setTimeout(()=>{ if(toneOsc){ toneOsc.stop(); toneOsc=null; } },6000);
  }); }

  // Copy/Save handlers delegated (for pages that load after)
  document.body.addEventListener('click', (e)=>{
    if(e.target.matches('[data-copy]')){ navigator.clipboard?.writeText(e.target.getAttribute('data-copy')); }
  });

  // Focus outlines for keyboard users
  document.addEventListener('keyup', (e)=>{ if(e.key==='Tab') document.documentElement.classList.add('show-focus'); });

})();