// ------------------ State ------------------
function defaultState() {
  return {
    seeds: 0,
    visits: 0,
    biodiversity: 0,
    multiplier: 1,
    owned: Object.fromEntries(PLANTS.map(p => [p.id,0])),
    unlockedStories: {},
    unlockedPollinators: {},
    totalPlants: 0,
    uniquePlants: 0,
    lastTick: Date.now(),
    lastSave: null,
    maxPlantSlots: 50,       // field capacity
    seedGrowthRate: 0.5      // base seeds per second per plant
  };
}

let state = load() || defaultState();

const SAVE_KEY = 'roots-of-renewal-phaser-v2';

function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    state.lastSave = new Date().toISOString();
    document.getElementById('saveInfo').textContent = `Last save: ${state.lastSave}`;
  } catch(e){ console.error(e); }
}

function load() {
  try {
    const s = localStorage.getItem(SAVE_KEY);
    return s ? JSON.parse(s) : null;
  } catch(e){ return null; }
}

function saveThrottled(){
  if(saveThrottled._timer) return;
  saveThrottled._timer = setTimeout(() => { save(); saveThrottled._timer=null; }, 500);
}

// Utility
function toast(msg,time=1400){
  const t=document.getElementById('toast');
  t.textContent = msg;
  t.style.transition='none';
  t.style.opacity=1;
  clearTimeout(t._hide);
  t._hide = setTimeout(()=>{ t.style.transition='opacity .3s'; t.style.opacity=0; }, time);
}
