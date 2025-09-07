// game.js

// Initialize game state
const state = {
  seeds: 10,
  plants: {}, // { "Milkweed": 3 }
  pollinators: {}, // { "Monarch": 1 }
  prestigeLevel: 0,
  globalImpactPoints: 0,
  discoveredPlants: new Set(),
  discoveredPollinators: new Set(),
  currentMonth: 3 // start in April (0 = Jan)
};

// Returns current number of species
function getSpeciesCounts() {
  return {
    plantCount: Object.keys(state.plants).length,
    pollinatorCount: Object.keys(state.pollinators).length
  };
}

// Plant a seed manually
function plantSeed(plantName) {
  const plant = PLANTS.find(p => p.name === plantName);
  if (!plant || state.seeds < plant.cost) return;

  state.seeds -= plant.cost;
  addPlant(plantName);
}

// Helper: Add plant
function addPlant(name) {
  if (!state.plants[name]) state.plants[name] = 0;
  state.plants[name]++;

  if (!state.discoveredPlants.has(name)) {
    state.discoveredPlants.add(name);
    showDiscoveryPopup(name, "plant"); // UI
  }

  buildFieldGuide(); // UI
  updateUI();        // UI
}

// Helper: Add pollinator
function addPollinator(name) {
  if (!state.pollinators[name]) state.pollinators[name] = 0;
  state.pollinators[name]++;

  if (!state.discoveredPollinators.has(name)) {
    state.discoveredPollinators.add(name);
    showDiscoveryPopup(name, "pollinator"); // UI
  }

  buildFieldGuide(); // UI
  updateUI();        // UI
}

// Plant a random initial plant (weighted toward lower cost)
function plantRandomInitialPlant() {
  const weightedPlants = [];
  PLANTS.forEach(plant => {
    const weight = Math.max(1, Math.floor(50 / plant.cost));
    for (let i = 0; i < weight; i++) weightedPlants.push(plant);
  });
  const randomPlant = weightedPlants[Math.floor(Math.random() * weightedPlants.length)];
  addPlant(randomPlant.name);
}

// Initialize game
window.onload = () => {
  updateUI();              // from ui.js
  plantRandomInitialPlant();
  startMonthProgression(3000); // from time.js
};
