// --- Game State ---
let state = {
  seeds: 0,
  stewardship: 0,
  restored: 0,
  ecoKnowledge: 0,
  plants: {},
  pollinators: {},
  month: 0,
  newSprouts: []
};

let tick = 0;
let showKnowledge = false;
let discoveries = { plants: {}, pollinators: {} };
let initialCounts = {};

// --- PLANTS ---
const PLANTS = [
  { name:"Milkweed", cost:5, rate:1, sproutMonths:[4,5], bloomMonths:[6,7,8], seedMonths:[9,10], hostFor:["Monarch"], foodFor:["Monarch"], squareFootage:4 },
  { name:"Purple Coneflower", cost:8, rate:2, sproutMonths:[5,6], bloomMonths:[7,8], seedMonths:[9], hostFor:[], foodFor:["Bee","Butterfly"], squareFootage:6 },
  { name:"Goldenrod", cost:10, rate:3, sproutMonths:[4,5], bloomMonths:[8,9], seedMonths:[10], hostFor:[], foodFor:["Bee","Butterfly","Moth"], squareFootage:8 },
  { name:"Black-eyed Susan", cost:7, rate:2, sproutMonths:[5,6], bloomMonths:[7,8], seedMonths:[9], hostFor:[], foodFor:["Bee","Butterfly"], squareFootage:6 },
  { name:"Butterfly Weed", cost:8, rate:2, sproutMonths:[4,5], bloomMonths:[6,7], seedMonths:[8,9], hostFor:["Monarch"], foodFor:["Monarch","Bee"], squareFootage:5 },
  { name:"Cardinal Flower", cost:9, rate:2, sproutMonths:[5], bloomMonths:[7,8], seedMonths:[9], hostFor:["Hummingbird"], foodFor:["Hummingbird"], squareFootage:5 },
  { name:"Wild Bergamot", cost:6, rate:1, sproutMonths:[5], bloomMonths:[6,7], seedMonths:[8], hostFor:[], foodFor:["Bee","Butterfly"], squareFootage:6 },
  { name:"Golden Alexanders", cost:5, rate:1, sproutMonths:[4,5], bloomMonths:[6], seedMonths:[7], hostFor:[], foodFor:["Bee"], squareFootage:4 },
  { name:"Prairie Blazing Star", cost:10, rate:3, sproutMonths:[5], bloomMonths:[7,8], seedMonths:[9], hostFor:[], foodFor:["Bee","Butterfly"], squareFootage:8 },
  { name:"New England Aster", cost:7, rate:2, sproutMonths:[6], bloomMonths:[8,9], seedMonths:[10], hostFor:[], foodFor:["Bee","Butterfly"], squareFootage:6 },
  { name:"Showy Milkweed", cost:8, rate:2, sproutMonths:[4,5], bloomMonths:[6,7], seedMonths:[8,9], hostFor:["Monarch"], foodFor:["Monarch"], squareFootage:5 }
];

// --- POLLINATORS ---
const POLLINATORS = [
  { name:"Monarch", host:"Milkweed", food:"Milkweed", boost:0.2 },
  { name:"Bee", host:null, food:"Purple Coneflower", boost:0.1 },
  { name:"Butterfly", host:null, food:"Purple Coneflower", boost:0.1 },
  { name:"Moth", host:null, food:"Goldenrod", boost:0.1 },
  { name:"Bumblebee", host:null, food:"Wild Bergamot", boost:0.1 },
  { name:"Hummingbird", host:"Cardinal Flower", food:"Cardinal Flower", boost:0.15 },
  { name:"Swallowtail", host:null, food:"Black-eyed Susan", boost:0.1 },
  { name:"Honeybee", host:null, food:"Butterfly Weed", boost:0.1 },
  { name:"Moth (Luna)", host:null, food:"New England Aster", boost:0.05 },
  { name:"Native Wasp", host:null, food:"Golden Alexanders", boost:0.05 }
];

const POLLINATOR_BIODIVERSITY = {
  "Monarch":10,"Bee":5,"Butterfly":5,"Moth":3,"Bumblebee":5,
  "Hummingbird":10,"Swallowtail":5,"Honeybee":5,"Moth (Luna)":3,"Native Wasp":2
};

// --- INITIALIZATION ---
function initInitialCounts(){
  initialCounts = {};
  PLANTS.forEach(p=>{ initialCounts[p.name] = state.plants[p.name] || 0; });
}

// --- GAME LOGIC ---
function scatter(){
  state.seeds += 10; // simple example
  logEntry("Scattered 10 seeds.");
  render();
}

function prestige(){
  if(Object.values(state.plants).reduce((a,b)=>a+b,0)<50) return;
  state.ecoKnowledge++;
  state.restored += Object.values(state.plants).reduce((a,b)=>a+b,0);
  state.seeds = 0;
  state.plants = {};
  state.pollinators = {};
  state.stewardship = 0;
  initInitialCounts();
  logEntry("🔄 Land rewilded! Prestige gained.");
  render();
}

function logEntry(msg){
  const div = document.getElementById("entries");
  const p = document.createElement("p");
  p.textContent = msg;
  div.prepend(p);
}

// --- RESTORATION STATS ---
function updateRestorationStats(){
  let totalSquare=0;
  let totalBio=0;
  const tbody = document.getElementById("restorationTable").querySelector("tbody");
  tbody.innerHTML = "";

  // Plants
  PLANTS.forEach(p=>{
    const initial=initialCounts[p.name]||0;
    const current=state.plants[p.name]||0;
    const sq=current*(p.squareFootage||5);
    totalSquare+=sq;
    const row=document.createElement("tr");
    row.innerHTML=`<td>${p.name}</td><td>Plant</td><td>${initial}</td><td>${current}</td><td>${sq}</td>`;
    if(state.newSprouts.includes(p.name)) row.classList.add("new-sprout");
    tbody.appendChild(row);
  });

  // Pollinators
  POLLINATORS.forEach(pol=>{
    const count=state.pollinators[pol.name]||0;
    const points=(POLLINATOR_BIODIVERSITY[pol.name]||1)*count;
    totalBio+=points;
    const row=document.createElement("tr");
    row.innerHTML=`<td>${pol.name}</td><td>Pollinator</td><td>-</td><td>${count}</td><td>${points}</td>`;
    if(state.newSprouts.includes(pol.name)) row.classList.add("new-pollinator");
    tbody.appendChild(row);
  });

  state.restored=totalSquare;
  document.getElementById("squareFootage").textContent=totalSquare;
  document.getElementById("biodiversityScore").textContent=totalBio;

  // Clear markers for next tick
  state.newSprouts=[];
}

// --- POLLINATOR ARRIVALS ---
function checkPollinators(){
  POLLINATORS.forEach(pol=>{
    const hostCount = pol.host ? (state.plants[pol.host]||0) : 0;
    const foodCount = pol.food ? (state.plants[pol.food]||0) : 0;
    const relevantPlants =hostCount + foodCount;

    if(relevantPlants > 0){
      const currentCount = state.pollinators[pol.name] || 0;
      const maxAllowed = Math.floor(relevantPlants / 2) + 1; // limit based on plants
      const baseChance = 0.05;
      const probability = baseChance * relevantPlants;

      if(currentCount < maxAllowed && Math.random() < probability){
        state.pollinators[pol.name] = currentCount + 1;
        if(!state.newSprouts.includes(pol.name)) state.newSprouts.push(pol.name);

        // Record in field guide
        if(!discoveries.pollinators[pol.name]) discoveries.pollinators[pol.name] = {};
      }
    }
  });
}

// --- PLANT GROWTH ---
function growPlants(){
  PLANTS.forEach(p=>{
    const month = state.month + 1; // months 1-12
    if(p.sproutMonths.includes(month)){
      // Seed-to-plant conversion: prefer lower cost plants
      const chance = 0.5 / (p.cost || 1);
      if(Math.random() < chance){
        state.plants[p.name] = (state.plants[p.name] || 0) + 1;
        state.newSprouts.push(p.name);

        // Record in field guide
        if(!discoveries.plants[p.name]) discoveries.plants[p.name] = {};
      }
    }
  });
}

// --- FIELD GUIDE ---
function renderFieldGuide(){
  const guide = document.getElementById("fieldGuide");
  const guidePlants = document.getElementById("guidePlants");
  const guidePollinators = document.getElementById("guidePollinators");
  guidePlants.innerHTML="<h3>🌿 Plants</h3>";
  guidePollinators.innerHTML="<h3>🐝 Pollinators</h3>";

  for(const pName in discoveries.plants){
    guidePlants.innerHTML += `<p>${pName}</p>`;
  }
  for(const polName in discoveries.pollinators){
    guidePollinators.innerHTML += `<p>${polName}</p>`;
  }
}

// --- RENDER ---
function render(){
  document.getElementById("seeds").textContent = state.seeds;
  document.getElementById("stewardship").textContent = state.stewardship;
  document.getElementById("restored").textContent = state.restored;
  document.getElementById("ecoKnowledge").textContent = state.ecoKnowledge;
  updateRestorationStats();
}

// --- GAME TICK LOOP ---
function gameTick(){
  tick++;
  state.month = tick % 12;

  growPlants();
  checkPollinators();
  updateRestorationStats();
}

// --- EVENT LISTENERS ---
document.getElementById("scatter").addEventListener("click", scatter);
document.getElementById("prestige").addEventListener("click", prestige);
document.getElementById("guideBtn").addEventListener("click", ()=>document.getElementById("fieldGuide").classList.remove("hidden"));
document.getElementById("closeGuide").addEventListener("click", ()=>document.getElementById("fieldGuide").classList.add("hidden"));
document.getElementById("toggleKnowledge").addEventListener("click", ()=>{
  showKnowledge = !showKnowledge;
});

// --- INIT ---
initInitialCounts();
setInterval(gameTick, 2000); // 2s per tick
render();
