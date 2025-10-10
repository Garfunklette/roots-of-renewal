// game.js

// ==================== GAME STATE ====================

const state = {
  lots: [
    {
      name: "Lot 1",
      capacitySqFt: 50,
      usedSqFt: 0,
      plants: {},       // { speciesName: count }
      pollinators: {},  // { pollinatorName: count }
      seedBank: []      // [{ plantName, plantedMonth }]
    }
  ],
  activeLot: 0,
  currentMonth: 5, // May start
  year: 1,

  discoveredPlants: new Set(),
  discoveredPollinators: new Set()
};

// ==================== HELPERS ====================

function getActiveLot() {
  return state.lots[state.activeLot];
}

function findPlantDef(name) {
  return PLANTS.find(p => p.name === name);
}

function findPollinatorDef(name) {
  return POLLINATORS.find(p => p.name === name);
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
// ==================== PLANTING ====================

function addPlant(name) {
  const lot = getActiveLot();
  const plantDef = findPlantDef(name);
  if (!plantDef) return;

  const size = plantDef.squareFootage || 1;

  if (lot.usedSqFt + size > lot.capacitySqFt) {
    // Overflow to seed bank
    lot.seedBank.push({ plantName: name, plantedMonth: state.currentMonth });
    return;
  }

  if (!lot.plants[name]) lot.plants[name] = 0;
  lot.plants[name]++;
  lot.usedSqFt += size;

  if (!state.discoveredPlants.has(name)) {
    state.discoveredPlants.add(name);
    showDiscoveryPopup(name, "plant");
  }

  // Pollinator checks
  POLLINATORS.forEach(p => {
    if (!state.discoveredPollinators.has(p.name)) {
      tryPollinatorArrival(p.name);
    }
  });

  buildFieldGuide();
  updateUI();
}

function plantSeed(name) {
  const lot = getActiveLot();
  const index = lot.seedBank.findIndex(s => s.plantName === name);
  if (index !== -1) {
    addPlant(name);
    lot.seedBank.splice(index, 1);
  }
}

// ==================== ADVANCEMENT ====================

function advanceMonth() {
  state.currentMonth++;
  if (state.currentMonth > 12) {
    state.currentMonth = 1;
    state.year++;
  }

  const lot = getActiveLot();

  // Sprout seeds if in sprout season
  for (let i = lot.seedBank.length - 1; i >= 0; i--) {
    const seed = lot.seedBank[i];
    const plantDef = findPlantDef(seed.plantName);
    if (plantDef && plantDef.sproutMonths.includes(state.currentMonth)) {
      addPlant(seed.plantName);
      lot.seedBank.splice(i, 1);
    }
  }

  // Self-seeding: plants spread a fraction each month
  Object.keys(lot.plants).forEach(speciesName => {
    const plantDef = findPlantDef(speciesName);
    if (!plantDef) return;
    const count = lot.plants[speciesName];
    const spreadCount = Math.floor(count * 0.2);
    for (let i = 0; i < spreadCount; i++) {
      addPlant(speciesName);
    }
  });

  // Pollinator arrival check
  POLLINATORS.forEach(p => {
    if (!state.discoveredPollinators.has(p.name)) {
      tryPollinatorArrival(p.name);
    }
  });

  buildFieldGuide();
  updateUI();
}

// ==================== POLLINATORS ====================

function canPollinatorArrive(pollinator) {
  const lot = getActiveLot();
  const hostPlants = pollinator.host ? [pollinator.host] : [];
  const foodPlants = pollinator.food
    ? pollinator.food.split(",").map(s => s.trim())
    : [];

  const hostAvailable = hostPlants.some(pName => {
    const def = findPlantDef(pName);
    return def && lot.plants[pName] > 0 && def.bloomMonths.includes(state.currentMonth);
  });

  const foodAvailable = foodPlants.some(pName => {
    const def = findPlantDef(pName);
    return def && lot.plants[pName] > 0 && def.bloomMonths.includes(state.currentMonth);
  });

  return hostAvailable || foodAvailable;
}

// -----------------------------
// Initialization
// -----------------------------
window.onload = () => {
  updateUI();              // ui.js
  plantRandomInitialPlant();

  if (typeof startMonthProgression === "function") {
    startMonthProgression(3000); // from time.js
function tryPollinatorArrival(name) {
  const lot = getActiveLot();
  const poll = findPollinatorDef(name);
  if (!poll) return;

  if (canPollinatorArrive(poll)) {
    if (!lot.pollinators[name]) lot.pollinators[name] = 0;
    lot.pollinators[name]++;

    if (!state.discoveredPollinators.has(name)) {
      state.discoveredPollinators.add(name);
      showDiscoveryPopup(name, "pollinator");
    }
  }
}

// ==================== LOT MANAGEMENT ====================

function switchLot(index) {
  if (index < 0 || index >= state.lots.length) return;
  state.activeLot = index;
  buildFieldGuide();
  updateUI();
}

function addLot(name, capacitySqFt) {
  state.lots.push({
    name: name,
    capacitySqFt: capacitySqFt,
    usedSqFt: 0,
    plants: {},
    pollinators: {},
    seedBank: []
  });
  updateUI();
      }
