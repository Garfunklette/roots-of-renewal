// game.js



// ---------- Debugging / Manual Planting ----------
function plantSeedDebug(plantName){
  const plant = PLANTS.find(p => p.name === plantName);
  if(!plant){
    console.warn("Plant not found:", plantName);
    return;
  }
  if(state.seeds < plant.cost){
    console.warn(`Not enough seeds! Needed: ${plant.cost}, Available: ${state.seeds}`);
    return;
  }

  state.seeds -= plant.cost;

  if(plant.sproutMonths.includes(state.currentMonth)){
    addPlant(plant.name);
  } else {
    state.seedBank.push({ plantName: plant.name, plantedMonth: state.currentMonth });
  }

  updateUI();
}

// ---------- Scatter Seeds ----------
function scatterSeeds(numSeeds = 5) {
  state.seeds = parseInt(state.seeds, 10) || 0;
  if(state.seeds < numSeeds) return;
  state.seeds -= numSeeds;

  for(let i=0;i<numSeeds;i++){
    const randomPlant = PLANTS[Math.floor(Math.random() * PLANTS.length)];
    if(randomPlant.sproutMonths.includes(state.currentMonth)){
      addPlant(randomPlant.name);
    } else {
      state.seedBank.push({ plantName: randomPlant.name, plantedMonth: state.currentMonth });
    }
  }

  updateUI();
}

// ---------- Species Helpers ----------
function getSpeciesCounts(){
  return {
    plantCount: Object.keys(state.plants).length,
    pollinatorCount: Object.keys(state.pollinators).length
  };
}

function addPlant(name){
  if(!state.plants[name]) state.plants[name]=0;
  state.plants[name]++;
  if(!state.discoveredPlants.has(name)){
    state.discoveredPlants.add(name);
    showDiscoveryPopup(name,"plant");
  }
  buildFieldGuide();
  updateUI();
}

function addPollinator(name){
  if(!state.pollinators[name]) state.pollinators[name]=0;
  state.pollinators[name]++;
  if(!state.discoveredPollinators.has(name)){
    state.discoveredPollinators.add(name);
    showDiscoveryPopup(name,"pollinator");
  }
  buildFieldGuide();
  updateUI();
}

// ---------- Plant Seed Normally ----------
function plantSeed(plantName){
  const plant = PLANTS.find(p => p.name === plantName);
  if(!plant || state.seeds < plant.cost) return;

  state.seeds -= plant.cost;
  if(plant.sproutMonths.includes(state.currentMonth)){
    addPlant(plantName);
  } else {
    state.seedBank.push({ plantName, plantedMonth: state.currentMonth });
  }

  updateUI();
}

// ---------- Pollinator Arrival (Season-Aware) ----------
function canPollinatorArrive(pollinator){
  const hostPlants = pollinator.host ? [pollinator.host] : [];
  const foodPlants = pollinator.food ? pollinator.food.split(",").map(s=>s.trim()) : [];

  const hostBlooming = hostPlants.some(pName => {
    const plant = PLANTS.find(pl => pl.name === pName);
    return plant && state.plants[pName] > 0 && plant.bloomMonths.includes(state.currentMonth);
  });

  const foodBlooming = foodPlants.some(pName => {
    const plant = PLANTS.find(pl => pl.name === pName);
    return plant && state.plants[pName] > 0 && plant.bloomMonths.includes(state.currentMonth);
  });

  return hostBlooming || foodBlooming;
}

function tryPollinatorArrival(pollinatorName){
  const pollinator = POLLINATORS.find(p => p.name === pollinatorName);
  if(!pollinator) return;
  if(canPollinatorArrive(pollinator)){
    addPollinator(pollinator.name);
  }
}

// ---------- Month Progression ----------
function advanceMonth(){
  state.currentMonth = (state.currentMonth + 1) % 12;

  // Sprout seeds
  const sprouting = state.seedBank.filter(s => {
    const plant = PLANTS.find(p => p.name === s.plantName);
    return plant && plant.sproutMonths.includes(state.currentMonth);
  });

  sprouting.forEach(s => addPlant(s.plantName));
  state.seedBank = state.seedBank.filter(s => !sprouting.includes(s));

  // Seasonal pollinator arrivals
  POLLINATORS.forEach(p => {
    if(!state.discoveredPollinators.has(p.name)) tryPollinatorArrival(p.name);
  });

  updateUI();
}

function startMonthProgression(interval = 3000){
  setInterval(advanceMonth, interval);
}

// ---------- Random Initial Plant ----------
function plantRandomInitialPlant(){
  const weightedPlants = [];
  PLANTS.forEach(p => {
    const weight = Math.max(1, Math.floor(50 / p.cost));
    for(let i=0;i<weight;i++) weightedPlants.push(p);
  });
  const randomPlant = weightedPlants[Math.floor(Math.random() * weightedPlants.length)];
  addPlant(randomPlant.name);
}

// ---------- DOM Wiring ----------
document.addEventListener("DOMContentLoaded", () => {
  // Scatter seeds
  const scatterBtn = document.getElementById("scatterBtn");
  if(scatterBtn) scatterBtn.addEventListener("click",()=>scatterSeeds(5));

  // Debug plant buttons
  const testContainer = document.getElementById("plantButtons");
  if(testContainer){
    PLANTS.forEach(p => {
      const btn = document.createElement("button");
      btn.textContent = `Debug Plant: ${p.name}`;
      btn.onclick = ()=>plantSeedDebug(p.name);
      testContainer.appendChild(btn);
    });
  }
});

// ---------- Game Initialization ----------
window.onload = () => {
  updateUI();              // from ui.js
  plantRandomInitialPlant();
  if(typeof startMonthProgression === "function") startMonthProgression(3000);
};
