// game.js

// --------------------
// State Initialization
// --------------------
const state = {
  seeds: 10,
  plants: {},               // { "Milkweed": 2, "Blazing Star": 1 }
  pollinators: {},          // { "Monarch": 1, "Bumblebee": 2 }
  prestigeLevel: 0,
  globalImpactPoints: 0,
  currentMonth: 0,          // Start in April (0 = April, see time.js)
  discoveredPlants: new Set(),
  discoveredPollinators: new Set()
};

// --------------------
// Helper Functions
// --------------------
function getSpeciesCounts(){
  return {
    plantCount: Object.keys(state.plants).length,
    pollinatorCount: Object.keys(state.pollinators).length
  };
}

// --------------------
// Planting Functions
// --------------------

// Scatter seeds randomly
function scatterSeeds(){
  if(state.seeds <= 0){
    alert("No seeds left!");
    return;
  }

  state.seeds--;

  // Bias toward lower-cost plants for random selection
  const totalWeight = PLANTS.reduce((sum, p) => sum + 1 / p.cost, 0);
  let rand = Math.random() * totalWeight;
  let chosenPlant = null;

  for(const plant of PLANTS){
    rand -= 1 / plant.cost;
    if(rand <= 0){
      chosenPlant = plant;
      break;
    }
  }

  if(chosenPlant){
    if(!state.plants[chosenPlant.name]){
      state.plants[chosenPlant.name] = 1;
      state.discoveredPlants.add(chosenPlant.name);

      // First-time discovery unlocks Field Journal entry
      addJournalEntry(`You planted your first ${chosenPlant.name}. It stands ${chosenPlant.height} tall, with spacing of about ${chosenPlant.spacing}.`);
    } else {
      state.plants[chosenPlant.name]++;
    }
  }

  updateUI();
  buildFieldGuide();
}

// Buy specific plant from shop
function buyPlant(plantName){
  const plant = PLANTS.find(p => p.name === plantName);
  if(!plant) return;

  if(state.seeds < plant.cost){
    alert("Not enough seeds!");
    return;
  }

  state.seeds -= plant.cost;

  if(!state.plants[plant.name]){
    state.plants[plant.name] = 1;
    state.discoveredPlants.add(plant.name);

    // First-time discovery unlocks Field Journal entry
    addJournalEntry(`You planted your first ${plant.name}. It stands ${plant.height} tall, with spacing of about ${plant.spacing}.`);
  } else {
    state.plants[plant.name]++;
  }

  updateUI();
  buildFieldGuide();
}

// Plant initial random plant at game start
function plantRandomInitialPlant(){
  const randomPlant = PLANTS[Math.floor(Math.random() * PLANTS.length)];
  state.plants[randomPlant.name] = 1;
  state.discoveredPlants.add(randomPlant.name);

  addJournalEntry(`Your garden begins with a ${randomPlant.name}, ${randomPlant.height} tall and spaced about ${randomPlant.spacing}.`);

  updateUI();
  buildFieldGuide();
}

// --------------------
// Field Journal
// --------------------
const journal = [];

function addJournalEntry(text){
  journal.push(text);
  renderJournal();
}

function renderJournal(){
  const journalDiv = document.getElementById("journalEntries");
  if(!journalDiv) return;

  journalDiv.innerHTML = "";
  journal.forEach(entry => {
    const p = document.createElement("p");
    p.textContent = entry;
    journalDiv.appendChild(p);
  });
}

// --------------------
// UI Updates
// --------------------
function updateUI(){
  const { plantCount, pollinatorCount } = getSpeciesCounts();

  document.getElementById("seedCount").textContent = state.seeds;
  document.getElementById("plantSpeciesCount").textContent = plantCount;
  document.getElementById("pollinatorSpeciesCount").textContent = pollinatorCount;
  document.getElementById("prestigeLevel").textContent = state.prestigeLevel;
  document.getElementById("prestigeTierName").textContent = getCurrentTier().name;
  document.getElementById("globalImpactPoints").textContent = state.globalImpactPoints;
  document.getElementById("currentMonth").textContent = getMonthName(state.currentMonth);
}

// --------------------
// Game Initialization
// --------------------
window.onload = () => {
  plantRandomInitialPlant();
  updateUI();
  buildFieldGuide();
  startMonthProgression(3000); // 3s per month
};
