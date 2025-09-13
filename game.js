// game.js

// ----- Game State -----
const state = {
  seeds: 1000,
  plants: {},            // { "Milkweed": 3, "Blazing Star": 5 }
  pollinators: {},       // { "Monarch Butterfly": 1, "Bumblebee": 2 }
  prestigeLevel: 0,
  globalImpactPoints: 0,
  discoveredPlants: new Set(),
  discoveredPollinators: new Set(),
  currentMonth: 3        // start in April (0 = Jan)
};

state.seedBank = []; // holds seeds waiting to sprout { plantName, plantedMonth }

// ----- Field Guide Pagination -----
const guideState = {
  activeTab: "plants",
  currentPage: 0,
  entriesPerPage: 3
};

// ----- Species Counts -----
function getSpeciesCounts(){
  return {
    plantCount: Object.keys(state.plants).length,
    pollinatorCount: Object.keys(state.pollinators).length
  };
}

// ----- Plant Helpers -----
function addPlant(name){
  if(!state.plants[name]) state.plants[name] = 0;
  state.plants[name]++;

  if(!state.discoveredPlants.has(name)){
    state.discoveredPlants.add(name);
    showDiscoveryPopup(name, "plant");
  }

  // Check for pollinator arrivals
  POLLINATORS.forEach(p => {
    if(!state.discoveredPollinators.has(p.name)){
      tryPollinatorArrival(p.name);
    }
  });

  buildFieldGuide();
  updateUI();
}

// Plant a seed manually
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

// Plant a random initial plant
function plantRandomInitialPlant() {
  const weightedPlants = [];
  PLANTS.forEach(plant => {
    const weight = Math.max(1, Math.floor(50 / plant.cost));
    for(let i = 0; i < weight; i++) weightedPlants.push(plant);
  });

  const randomPlant = weightedPlants[Math.floor(Math.random() * weightedPlants.length)];
  addPlant(randomPlant.name);
}

// ----- Pollinator Helpers -----
function addPollinator(name){
  if(!state.pollinators[name]) state.pollinators[name] = 0;
  state.pollinators[name]++;

  if(!state.discoveredPollinators.has(name)){
    state.discoveredPollinators.add(name);
    showDiscoveryPopup(name, "pollinator");
  }

  buildFieldGuide();
  updateUI();
}

// Determine if pollinator can arrive based on current plants
function canPollinatorArrive(pollinator){
  const hostPlants = pollinator.host ? [pollinator.host] : [];
  const foodPlants = pollinator.food ? pollinator.food.split(",").map(s => s.trim()) : [];

  const hasHost = hostPlants.some(p => state.plants[p] > 0);
  const hasFood = foodPlants.some(p => state.plants[p] > 0);

  return hasHost || hasFood;
}

// Try to add pollinator if conditions met
function tryPollinatorArrival(pollinatorName){
  const pollinator = POLLINATORS.find(p => p.name === pollinatorName);
  if(!pollinator) return;

  if(canPollinatorArrive(pollinator)){
    addPollinator(pollinator.name);
  }
}

// ----- Debugging / Scatter Seeds -----
function plantSeedDebug(plantName){
  const plant = PLANTS.find(p => p.name === plantName);
  if(!plant) return;

  if(state.seeds < plant.cost) return;
  state.seeds -= plant.cost;

  if(plant.sproutMonths.includes(state.currentMonth)){
    addPlant(plantName);
  } else {
    state.seedBank.push({ plantName, plantedMonth: state.currentMonth });
  }

  updateUI();
}

function scatterSeeds(numSeeds = 5){
  state.seeds = parseInt(state.seeds,10) || 0;
  if(state.seeds < numSeeds) return;

  state.seeds -= numSeeds;

  for(let i=0;i<numSeeds;i++){
    const randomPlant = PLANTS[Math.floor(Math.random()*PLANTS.length)];
    if(randomPlant.sproutMonths.includes(state.currentMonth)){
      addPlant(randomPlant.name);
    } else {
      state.seedBank.push({ plantName: randomPlant.name, plantedMonth: state.currentMonth });
    }
  }

  updateUI();
}

// ----- Month Progression -----
function advanceMonth(){
  state.currentMonth = (state.currentMonth + 1) % 12;

  // Sprout seeds in seedBank
  const sprouting = state.seedBank.filter(s => PLANTS.find(p=>p.name===s.plantName).sproutMonths.includes(state.currentMonth));
  sprouting.forEach(s => addPlant(s.plantName));

  // Remove sprouted seeds
  state.seedBank = state.seedBank.filter(s => !sprouting.includes(s));

  updateUI();
}

// Optional: automated month progression
function startMonthProgression(interval=3000){
  setInterval(advanceMonth, interval);
}

// ----- DOMContentLoaded Wiring -----
document.addEventListener("DOMContentLoaded", ()=>{
  // Scatter Button
  const scatterBtn = document.getElementById("scatterBtn");
  if(scatterBtn) scatterBtn.addEventListener("click",()=>scatterSeeds(5));

  // Plant debug buttons
  const testContainer = document.getElementById("plantButtons");
  if(testContainer){
    PLANTS.forEach(p=>{
      const btn = document.createElement("button");
      btn.textContent = `Debug Plant: ${p.name}`;
      btn.onclick = ()=>plantSeedDebug(p.name);
      testContainer.appendChild(btn);
    });
  }

  // Initialize UI and first plant
  updateUI();
  plantRandomInitialPlant();

  // Month progression
  if(typeof startMonthProgression==="function") startMonthProgression(3000);
});
