// game.js

// -----------------------------
// Game State
// -----------------------------
const state = {
  seeds: 10,
  plants: {},              // { "Milkweed": 3, "Blazing Star": 5 }
  pollinators: {},         // { "Monarch": 1, "Bumblebee": 2 }
  prestigeLevel: 0,
  globalImpactPoints: 0,
  discoveredPlants: new Set(),
  discoveredPollinators: new Set(),
  currentMonth: 3           // start in April (0 = Jan)
};

// -----------------------------
// Mechanics
// -----------------------------

// Plant a seed manually (buying from shop or debug)
function plantSeed(plantName) {
  const plant = PLANTS.find(p => p.name === plantName);
  if (!plant || state.seeds < plant.cost) return;

  state.seeds -= plant.cost;
  addPlant(plantName);
}

// Scatter multiple seeds at random
function scatterSeeds(count) {
  if (state.seeds < count) return;

  for (let i = 0; i < count; i++) {
    const weightedPlants = [];
    PLANTS.forEach(plant => {
      const weight = Math.max(1, Math.floor(50 / plant.cost));
      for (let j = 0; j < weight; j++) weightedPlants.push(plant);
    });
    const randomPlant = weightedPlants[Math.floor(Math.random() * weightedPlants.length)];
    addPlant(randomPlant.name);
    state.seeds--;
  }
}

// Add a plant to the collection
function addPlant(name) {
  if (!state.plants[name]) state.plants[name] = 0;
  state.plants[name]++;

  if (!state.discoveredPlants.has(name)) {
    state.discoveredPlants.add(name);
    showDiscoveryPopup(name, "plant"); // defined in ui.js
  }

  buildFieldGuide(); // ui.js
  updateUI();        // ui.js
}

// Add a pollinator to the collection
function addPollinator(name) {
  if (!state.pollinators[name]) state.pollinators[name] = 0;
  state.pollinators[name]++;

  if (!state.discoveredPollinators.has(name)) {
    state.discoveredPollinators.add(name);
    showDiscoveryPopup(name, "pollinator"); // ui.js
  }

  buildFieldGuide(); // ui.js
  updateUI();        // ui.js
}

// Random starting plant (weighted toward low cost)
function plantRandomInitialPlant() {
  const weightedPlants = [];
  PLANTS.forEach(plant => {
    const weight = Math.max(1, Math.floor(50 / plant.cost));
    for (let i = 0; i < weight; i++) weightedPlants.push(plant);
  });
  const randomPlant = weightedPlants[Math.floor(Math.random() * weightedPlants.length)];
  addPlant(randomPlant.name);
}

// -----------------------------
// Initialization
// -----------------------------
window.onload = () => {
  updateUI();              // ui.js
  plantRandomInitialPlant();

  if (typeof startMonthProgression === "function") {
    startMonthProgression(3000); // from time.js
  }
};
