// --- State ---
let state = {
  seeds: 0,
  plants: {},
  pollinators: {},
  stewardship: 0,
  ecoKnowledge: 0,
  restored: 0,
  newSprouts: [],
  month: 0 // 0 = January
};
let tick = 0;
let firstPlantPurchased = false, firstAutoPlantLogged = false;

// --- Months ---
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

// --- Plants (with seasonal phases) ---
const PLANTS = [
  {
    name:"Milkweed", cost:5, rate:1,
    sproutMonths:[4,5], // April, May
    bloomMonths:[6,7,8], // June–Aug
    seedMonths:[9,10], // Sept–Oct
    hostFor:["Monarch"], foodFor:["Monarch"]
  },
  {
    name:"Purple Coneflower", cost:8, rate:2,
    sproutMonths:[5,6], bloomMonths:[7,8], seedMonths:[9],
    hostFor:[], foodFor:["Bee","Butterfly"]
  },
  {
    name:"Goldenrod", cost:10, rate:3,
    sproutMonths:[4,5], bloomMonths:[8,9], seedMonths:[10],
    hostFor:[], foodFor:["Bee","Butterfly","Moth"]
  }
];

// --- Pollinators ---
const POLLINATORS = [
  { name:"Monarch", host:"Milkweed", food:"Milkweed" },
  { name:"Bee", host:null, food:"Purple Coneflower" },
  { name:"Butterfly", host:null, food:"Purple Coneflower" },
  { name:"Moth", host:null, food:"Goldenrod" }
];

// --- Landmarks ---
const LANDMARKS = [
  {threshold:10,text:"A small patch of green emerges."},
  {threshold:100,text:"The land buzzes with life."},
  {threshold:1000,text:"A thriving ecosystem flourishes!"}
];

// --- Utility: weighted plant choice (prefers cheaper) ---
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
    if(!firstPlantPurchased){
      logEntry(`🌱 First planting: ${plant.name}. The journal begins.`);
      firstPlantPurchased=true;
    }
    render();
  }
}

// --- Pollinator Arrival (scaled by host/food plant counts) ---
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
        logEntry(`🐝 ${pol.name} has arrived!`);
      }
    }
  });
}

// --- Render Functions ---
function renderPlantCounts(){
  const div=document.getElementById("plantCounts");
  div.innerHTML="<h3>🌿 Plant Counts</h3>";
  PLANTS.forEach(plant=>{
    const count=state.plants[plant.name]||0;
    if(count>0){
      const d=document.createElement("div");
      d.textContent=`${plant.name}: ${count}`;
      if(state.newSprouts.includes(plant.name)) d.classList.add("new-sprout");
      div.appendChild(d);
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
      const d=document.createElement("div");
      d.textContent=`${pol.name}: ${count}`;
      if(count>0) d.classList.add("new-pollinator");
      div.appendChild(d);
    }
  });
}
function renderShop(){
  const shop=document.getElementById("shopBody");
  shop.innerHTML="<h3>Plant Shop</h3>";
  PLANTS.forEach(p=>{
    const btn=document.createElement("button");
    btn.textContent=`Buy ${p.name} (${p.cost} seeds)`;
    btn.addEventListener("click",()=>buyPlant(p));
    shop.appendChild(btn);
  });
}
function render(){
  const totalPlants=Object.values(state.plants).reduce((a,b)=>a+b,0);
  document.getElementById("seeds").textContent=state.seeds;
  document.getElementById("plants").textContent=totalPlants;
  document.getElementById("pollinators").textContent=Object.keys(state.pollinators).filter(k=>state.pollinators[k]>0).length;
  document.getElementById("stewardship").textContent=Math.floor(state.stewardship);
  document.getElementById("eco").textContent=state.ecoKnowledge;
  document.getElementById("restored").textContent=state.restored;
  document.getElementById("month").textContent=MONTHS[state.month];
  renderPlantCounts();
  renderPollinatorCounts();
  renderShop();
}

// --- Growth Loop ---
setInterval(()=>{
  tick++;
  // Advance month every 5 ticks
  if(tick % 5===0){
    state.month=(state.month+1)%12;
    logEntry(`📅 It is now ${MONTHS[state.month]}.`);
  }

  // Pollinators check
  checkPollinators();

  // Seed production only in seedMonths
  let plantSeedGain=0;
  PLANTS.forEach(plant=>{
    const count=state.plants[plant.name]||0;
    if(plant.seedMonths.includes(state.month)){
      plantSeedGain+=count*plant.rate;
    }
  });
  state.seeds+=plantSeedGain;

  // Seed → Plant conversion only in sproutMonths
  if(state.seeds>0){
    const available=PLANTS.filter(p=>p.sproutMonths.includes(state.month));
    const chosen=choosePlantByWeight(available);
    if(chosen){
      state.plants[chosen.name]=(state.plants[chosen.name]||0)+1;
      state.seeds--;
      state.newSprouts.push(chosen.name);
      if(!firstAutoPlantLogged){
        logEntry(`🌿 A wild ${chosen.name} sprouts naturally.`);
        firstAutoPlantLogged=true;
      }
    }
  }

  // Pollinator boost (only during bloomMonths)
  let pollinatorBoost=1;
  POLLINATORS.forEach(pol=>{
    const foodPlant=PLANTS.find(p=>p.foodFor.includes(pol.name));
    if(foodPlant && foodPlant.bloomMonths.includes(state.month)){
      pollinatorBoost+=0.1*(state.pollinators[pol.name]||0);
    }
  });

  state.stewardship+=(pollinatorBoost-1)*2;

  render();
},2000);

// --- Events ---
document.getElementById("scatterBtn").addEventListener("click",scatter);
document.getElementById("prestigeBtn").addEventListener("click",()=>logEntry("Prestige not yet implemented."));

// --- Init ---
render();
