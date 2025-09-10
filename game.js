// game.js

// Initialize game state
const state = {
  seeds: 1000,
  plants: {}, // { "Milkweed": 3, "Blazing Star": 5 }
  pollinators: {}, // { "Monarch": 1, "Bumblebee": 2 }
  prestigeLevel: 0,
  globalImpactPoints: 0,
  discoveredPlants: new Set(),
  discoveredPollinators: new Set(),
  currentMonth: 3 // start in April (0 = Jan)
};

state.seedBank = []; // holds seeds waiting to sprout { plantName, plantedMonth }

// ----- DEBUG: Manual Planting -----
function plantSeedDebug(plantName){
  console.log("Manual plantSeed called:", plantName);
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
  console.log(`Seeds spent: ${plant.cost}. Seeds left: ${state.seeds}`);

  if(plant.sproutMonths.includes(state.currentMonth)){
    console.log(`${plant.name} sprouts immediately!`);
    addPlant(plant.name);
  } else {
    console.log(`${plant.name} added to seed bank for month ${state.currentMonth}`);
    state.seedBank.push({ plantName: plant.name, plantedMonth: state.currentMonth });
  }

  updateUI();
  console.log("Current seed bank:", state.seedBank);
}

// ----- Scatter Seeds (safe + logging) -----
function scatterSeeds(numSeeds = 5) {
  console.log("Scatter seeds clicked. Current seeds:", state.seeds);

  // Force seeds to be a number
  state.seeds = parseInt(state.seeds, 10) || 0;

  if (state.seeds < numSeeds) {
    console.warn(`Not enough seeds to scatter! Needed: ${numSeeds}, Available: ${state.seeds}`);
    return;
  }

  state.seeds = Math.max(0, state.seeds - numSeeds);
  console.log(`Scattering ${numSeeds} seeds... Remaining seeds: ${state.seeds}`);

  for (let i = 0; i < numSeeds; i++) {
    const randomPlant = PLANTS[Math.floor(Math.random() * PLANTS.length)];
    console.log(`Selected plant: ${randomPlant.name}`);

    if (randomPlant.sproutMonths.includes(state.currentMonth)) {
      console.log(`Sprouting immediately: ${randomPlant.name}`);
      addPlant(randomPlant.name);
    } else {
      console.log(`Adding to seed bank: ${randomPlant.name}`);
      state.seedBank.push({ plantName: randomPlant.name, plantedMonth: state.currentMonth });
    }
  }

  updateUI();
  console.log("Updated seed bank:", state.seedBank);
}

// ----- Attach buttons for testing -----
document.addEventListener("DOMContentLoaded", () => {
  const scatterBtn = document.getElementById("scatterBtn");
  if (scatterBtn) scatterBtn.addEventListener("click", () => scatterSeeds(5));

  // For manual plant testing: create a temporary test button for each plant
  const testContainer = document.getElementById("plantButtons");
  if(testContainer){
    PLANTS.forEach(p => {
      const btn = document.createElement("button");
      btn.textContent = `Debug Plant: ${p.name}`;
      btn.onclick = () => plantSeedDebug(p.name);
      testContainer.appendChild(btn);
    });
  }
});

// Pagination state for Field Guide
const guideState = {
  activeTab: "plants",
  currentPage: 0,
  entriesPerPage: 3 // how many entries per "page"
};

// Returns current number of species
function getSpeciesCounts(){
  return {
    plantCount: Object.keys(state.plants).length,
    pollinatorCount: Object.keys(state.pollinators).length
  };
}

// Plant a seed manually
function plantSeed(plantName){
  const plant = PLANTS.find(p=>p.name===plantName);
  if(!plant || state.seeds < plant.cost) return;

  state.seeds -= plant.cost;

  if(plant.sproutMonths.includes(state.currentMonth)){
    addPlant(plantName); // grows immediately
  } else {
    state.seedBank.push({ plantName, plantedMonth: state.currentMonth });
  }

  updateUI();
}

// Helper: Add plant
function addPlant(name){
  if(!state.plants[name]) state.plants[name]=0;
  state.plants[name]++;
  if(!state.discoveredPlants.has(name)){
    state.discoveredPlants.add(name);
    showDiscoveryPopup(name,"plant"); // now in ui.js
  }
  buildFieldGuide(); // now in ui.js
  updateUI();        // now in ui.js
}

// Helper: Add pollinator
function addPollinator(name){
  if(!state.pollinators[name]) state.pollinators[name]=0;
  state.pollinators[name]++;
  if(!state.discoveredPollinators.has(name)){
    state.discoveredPollinators.add(name);
    showDiscoveryPopup(name,"pollinator"); // now in ui.js
  }
  buildFieldGuide(); // now in ui.js
  updateUI();        // now in ui.js
}

// Plant a random initial plant (weighted toward lower cost)
function plantRandomInitialPlant() {
  const weightedPlants = [];
  PLANTS.forEach(plant => {
    const weight = Math.max(1, Math.floor(50 / plant.cost));
    for(let i=0; i<weight; i++) weightedPlants.push(plant);
  });
  const randomPlant = weightedPlants[Math.floor(Math.random() * weightedPlants.length)];
  addPlant(randomPlant.name);
}

// Initialize game
window.onload = () => {
  updateUI();              // from ui.js
  plantRandomInitialPlant();
  if (typeof startMonthProgression === "function") {
    startMonthProgression(3000); // from time.js
  }
};
