// --- State ---
let state = {
  seeds: 0,
  plants: {},
  pollinators: {},
  stewardship: 0,
  ecoKnowledge: 0,
  restored: 0,
  newSprouts: [],
  month: 0
};
let tick = 0;
let firstPlantPurchased = false, firstAutoPlantLogged = false;

// --- Toggles ---
let showKnowledge = false;

// --- Field Guide / Discoveries (persistent across prestige) ---
let discoveries = {
  plants: {},
  pollinators: {}
};

// --- Months ---
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

// --- Plants ---
const PLANTS = [
  { name:"Milkweed", cost:5, rate:1, sproutMonths:[4,5], bloomMonths:[6,7,8], seedMonths:[9,10], hostFor:["Monarch"], foodFor:["Monarch"] },
  { name:"Purple Coneflower", cost:8, rate:2, sproutMonths:[5,6], bloomMonths:[7,8], seedMonths:[9], hostFor:[], foodFor:["Bee","Butterfly"] },
  { name:"Goldenrod", cost:10, rate:3, sproutMonths:[4,5], bloomMonths:[8,9], seedMonths:[10], hostFor:[], foodFor:["Bee","Butterfly","Moth"] }
];

// --- Pollinators ---
const POLLINATORS = [
  { name:"Monarch", host:"Milkweed", food:"Milkweed", boost:0.2 },
  { name:"Bee", host:null, food:"Purple Coneflower", boost:0.1 },
  { name:"Butterfly", host:null, food:"Purple Coneflower", boost:0.1 },
  { name:"Moth", host:null, food:"Goldenrod", boost:0.1 }
];

// --- Utility: weighted plant choice ---
function choosePlantByWeight(plants){
  if(plants.length===0) return null;
  let total=0;
  const weights=plants.map(p=>{let w=1/(p.cost||1); total+=w; return w;});
  let r=Math.random()*total;
  for(let i=0;i<plants.length;i++){
    if(r<weights[i]) return plants[i];
    r-=weights[i];
  }
  return plants[0];
}

// --- Journal Logging ---
function logEntry(text){
  const div=document.createElement("div");
  div.className="entry";
  div.textContent=text;
  document.getElementById("entries").prepend(div);
}

// --- Scatter Seeds ---
function scatter(){ state.seeds++; render(); }

// --- Buy Plant ---
function buyPlant(plant){
  if(state.seeds>=plant.cost){
    state.seeds-=plant.cost;
    state.plants[plant.name]=(state.plants[plant.name]||0)+1;

    // Discover plant in Field Guide
    if(!discoveries.plants[plant.name]){
      discoveries.plants[plant.name] = {seen:true, sprout:false, bloom:false, seed:false, host:false, food:false};
      logEntry(`📖 Field Guide updated: ${plant.name} added.`);
    }

    if(!firstPlantPurchased){
      logEntry(`🌱 First planting: ${plant.name}. The journal begins.`);
      firstPlantPurchased=true;
    }
    render();
  }
}

// --- Pollinator Arrival ---
function checkPollinators(){
  POLLINATORS.forEach(pol=>{
    const hostCount=pol.host?(state.plants[pol.host]||0):1;
    const foodCount=pol.food?(state.plants[pol.food]||0):1;
    const maxAllowed=Math.min(hostCount,foodCount);
    const currentCount=state.pollinators[pol.name]||0;
    if(maxAllowed>0 && currentCount<maxAllowed){
      const probability=(hostCount+foodCount)*0.01;
      if(Math.random()<probability){
        state.pollinators[pol.name]=currentCount+1;

        // Discover pollinator
        if(!discoveries.pollinators[pol.name]){
          discoveries.pollinators[pol.name]={seen:true, host:false, food:false, boost:false};
        }
        logEntry(`🐝 ${pol.name} has arrived!`);
      }
    }
  });
}

// --- Prestige ---
function prestige(){
  if(Object.values(state.plants).reduce((a,b)=>a+b,0)<50) return;
  state.ecoKnowledge++;
  state.restored+=Object.values(state.plants).reduce((a,b)=>a+b,0);
  state.seeds=0;
  state.plants={};
  state.pollinators={};
  state.stewardship=0;
  logEntry("🔄 Land rewilded! Prestige gained.");
  render();
}

// --- Render Functions ---
function renderPlantCounts(){
  const div=document.getElementById("plantCounts");
  div.innerHTML="<h3>🌿 Plant Counts</h3>";
  PLANTS.forEach(plant=>{
    const count=state.plants[plant.name]||0;
    if(count>0){
      const d=discoveries.plants[plant.name];
      let bonusText="";
      if(showKnowledge && d){
        let bonus=0;
        if(d.sprout) bonus+=10;
        if(d.bloom) bonus+=10;
        if(d.seed) bonus+=10;
        if(d.host) bonus+=10;
        if(d.food) bonus+=10;
        bonusText=` (+${bonus}% Knowledge)`;
      }
      const row=document.createElement("div");
      row.textContent=`${plant.name}: ${count}${bonusText}`;
      if(state.newSprouts.includes(plant.name)) row.classList.add("new-sprout");
      div.appendChild(row);
    }
  });
  state.newSprouts=[];
}

function renderPollinatorCounts(){
  const div=document.getElementById("pollinatorCounts");
  div.innerHTML="<h3>🐝 Pollinators</h3>";
  POLLINATORS.forEach(pol=>{
    const count=state.pollinators[pol.name]||0;
    if(count>0){
      const d=discoveries.pollinators[pol.name];
      let bonusText="";
      if(showKnowledge && d){
        if(d.boost){
          bonusText = ` (Full +${Math.round(pol.boost*100)}%)`;
        } else {
          bonusText = ` (Partial +${Math.round(pol.boost*50)}%)`;
        }
      }
      const row=document.createElement("div");
      row.textContent=`${pol.name}: ${count}${bonusText}`;
      if(count>0) row.classList.add("new-pollinator");
      div.appendChild(row);
    }
  });
}

function renderShop(){
  const shop=document.getElementById("shopBody");
  shop.innerHTML="<h3>Plant Shop</h3>";
  PLANTS.forEach(p=>{
    const d = discoveries.plants[p.name];
    let bonusText="";
    if(showKnowledge && d){
      let bonus=0;
      if(d.sprout) bonus+=10;
      if(d.bloom) bonus+=10;
      if(d.seed) bonus+=10;
      if(d.host) bonus+=10;
      if(d.food) bonus+=10;
      bonusText=` (+${bonus}% Knowledge)`;
    }
    const btn=document.createElement("button");
    btn.textContent=`Buy ${p.name} (${p.cost} seeds)${bonusText}`;
    btn.addEventListener("click",()=>buyPlant(p));
    shop.appendChild(btn);
  });
}

function renderFieldGuide(){
  const gp=document.getElementById("guidePlants");
  gp.innerHTML="<h3>🌿 Plants</h3>";
  PLANTS.forEach(p=>{
    const d = discoveries.plants[p.name];
    const div=document.createElement("div");
    if(d?.seen){
      div.innerHTML=`<b>${p.name}</b><br>`;
      if(d.sprout) div.innerHTML+=`Sprout: ${p.sproutMonths.map(m=>MONTHS[m]).join(", ")}<br>`;
      if(d.bloom) div.innerHTML+=`Bloom: ${p.bloomMonths.map(m=>MONTHS[m]).join(", ")}<br>`;
      if(d.seed) div.innerHTML+=`Seed: ${p.seedMonths.map(m=>MONTHS[m]).join(", ")}<br>`;
      if(d.host) div.innerHTML+=`Host for: ${p.hostFor.length?p.hostFor.join(", "):"—"}<br>`;
      if(d.food) div.innerHTML+=`Food for: ${p.foodFor.length?p.foodFor.join(", "):"—"}`;
    } else {
      div.textContent="???";
    }
    gp.appendChild(div);
  });

  const gpol=document.getElementById("guidePollinators");
  gpol.innerHTML="<h3>🐝 Pollinators</h3>";
  POLLINATORS.forEach(pol=>{
    const d = discoveries.pollinators[pol.name];
    const div=document.createElement("div");
    if(d?.seen){
      div.innerHTML=`<b>${pol.name}</b><br>`;
      if(d.host && pol.host) div.innerHTML+=`Host plant: ${pol.host}<br>`;
      if(d.food && pol.food) div.innerHTML+=`Food plant: ${pol.food}<br>`;
      if(d.boost) div.innerHTML+=`Boost observed`;
    } else {
      div.textContent="???";
    }
    gpol.appendChild(div);
  });
}

function render(){
  renderPlantCounts();
  renderPollinatorCounts();
  renderShop();
}

// --- Game Tick: Seeds → Plants, Pollinators Arrival, Field Updates ---
function gameTick(){
  tick++;
  state.month = tick % 12; // simple month cycle

  // Plants producing seeds
  let plantSeedGain = 0;
  PLANTS.forEach(plant => {
    const count = state.plants[plant.name] || 0;
    if(count>0 && plant.seedMonths.includes(state.month)){
      let rate = plant.rate;
      const d = discoveries.plants[plant.name];
      if(d){
        let bonus=0;
        if(d.sprout) bonus+=0.1;
        if(d.bloom) bonus+=0.1;
        if(d.seed) bonus+=0.1;
        if(d.host) bonus+=0.1;
        if(d.food) bonus+=0.1;
        rate *= 1 + bonus;
      }
      plantSeedGain += count * rate;
      // Update sprout/bloom/seed discoveries if month reached
      if(d && !d.sprout && plant.sproutMonths.includes(state.month)) d.sprout=true;
      if(d && !d.bloom && plant.bloomMonths.includes(state.month)) d.bloom=true;
      if(d && !d.seed && plant.seedMonths.includes(state.month)) d.seed=true;
    }
  });
  state.seeds += plantSeedGain;

  // Pollinator boost (scaled by knowledge)
  let pollinatorBoost = 1;
  POLLINATORS.forEach(pol => {
    const count = state.pollinators[pol.name] || 0;
    if(count>0){
      const d = discoveries.pollinators[pol.name];
      let boost = pol.boost;
      if(!d?.boost) boost *= 0.5; // partial boost if not fully observed
      const foodPlant = PLANTS.find(p => p.foodFor.includes(pol.name));
      if(foodPlant && foodPlant.bloomMonths.includes(state.month)){
        pollinatorBoost += boost*count;
        if(d && !d.boost) d.boost = true; // mark boost as observed
        if(d && !d.food && foodPlant) d.food = true; // record food plant observed
      }
      if(d && !d.host && pol.host && (state.plants[pol.host] || 0)>0) d.host = true; // record host plant observed
    }
  });

  state.seeds *= pollinatorBoost;

  // Check for new pollinator arrivals
  checkPollinators();

  render();
}

// --- Button Listeners ---
document.getElementById("scatter").addEventListener("click", scatter);
document.getElementById("prestige").addEventListener("click", prestige);
document.getElementById("toggleKnowledge").addEventListener("click", ()=>{
  showKnowledge = !showKnowledge;
  document.getElementById("toggleKnowledge").textContent = showKnowledge
    ? "🔍 Hide Knowledge Details"
    : "🔍 Show Knowledge Details";
  render();
});

document.getElementById("guideBtn").addEventListener("click", ()=>{
  document.getElementById("fieldGuide").classList.remove("hidden");
  renderFieldGuide();
});

document.getElementById("closeGuide").addEventListener("click", ()=>{
  document.getElementById("fieldGuide").classList.add("hidden");
});

// --- Start Game Loop ---
setInterval(gameTick, 2000); // every 2 sec
render();
