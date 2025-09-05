// ------------------ UI ------------------
function renderResources(){
  document.getElementById('seeds').textContent = Math.floor(state.seeds);
  document.getElementById('visits').textContent = state.visits;
  document.getElementById('biodiv').textContent = state.biodiversity;
}

function renderShop(){
  const shopBody = document.getElementById('shopBody');
  shopBody.innerHTML='';
  PLANTS.forEach(p=>{
    const row=document.createElement('div'); row.className='item';
    const left=document.createElement('div');
    left.innerHTML=`<div style="font-weight:700">${p.icon} ${p.name}</div><div style="color:#6a7a6c;font-size:13px">${p.story}</div>`;
    const btn=document.createElement('button');
    const afford = state.seeds>=p.cost;
    btn.textContent=`Buy ${p.cost}🌱`;
    btn.className='buy '+(afford?'enabled':'disabled');
    btn.disabled = !afford;
    btn.addEventListener('click',()=>buyPlant(p));
    row.appendChild(left); row.appendChild(btn);
    shopBody.appendChild(row);
  });
}

function renderJournal(){
  const body = document.getElementById('journalBody');
  body.innerHTML='';
  PLANTS.forEach(p=>{if(state.unlockedStories[p.id]){const div=document.createElement('div');div.className='story-entry';div.innerHTML=`<h5>${p.icon} ${p.name}</h5><div>“${p.story}”</div>`;body.appendChild(div);}});
  Object.keys(state.unlockedPollinators).forEach(pid=>{
    const pol=POLLINATORS.find(p=>p.id===pid);
    const div=document.createElement('div'); div.className='story-entry';
    div.innerHTML=`<h5>${pol.icon} ${pol.name}</h5><div>“${pol.story}”</div>`;
    body.appendChild(div);
  });
}

function checkPrestigeAvailability(){
  const btn=document.getElementById('prestigeBtn');
  const unique = Object.values(state.owned).filter(v=>v>0).length;
  state.uniquePlants = unique;
  btn.disabled = unique<10;
  btn.className = 'buy '+(unique>=10?'enabled':'disabled');
}

function renderAll(){ renderResources(); renderShop(); renderJournal(); checkPrestigeAvailability(); }
