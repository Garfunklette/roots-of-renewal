// game.js

// Initialize state
const state = {
  seeds: 10, // start with 10 seeds
  plants: {},
  pollinators: {},
  stewardshipPoints: 0,
  discoveredPlants: new Set(),
  discoveredPollinators: new Set()
};

// Helper: Add plant with discovery popup
function addPlant(name){
  if(!state.plants[name]) state.plants[name]=0;
  state.plants[name]++;
  if(!state.discoveredPlants.has(name)){
    state.discoveredPlants.add(name);
    showDiscoveryPopup(name,"plant");
  }
  updateUI();
}

// Helper: Add pollinator with discovery popup
function addPollinator(name){
  if(!state.pollinators[name]) state.pollinators[name]=0;
  state.pollinators[name]++;
  if(!state.discoveredPollinators.has(name)){
    state.discoveredPollinators.add(name);
    showDiscoveryPopup(name,"pollinator");
  }
  updateUI();
}

// Update UI counters
function updateUI(){
  document.getElementById("seedCount").textContent = state.seeds;
  document.getElementById("stewardshipPoints").textContent = state.stewardshipPoints;
}

// Plant a seed (manual action)
function plantSeed(plantName){
  const plant = PLANTS.find(p=>p.name===plantName);
  if(!plant || state.seeds < plant.cost) return;

  state.seeds -= plant.cost;
  addPlant(plantName);

  // Add pollinators if host plant present
  POLLINATORS.forEach(pol=>{
    if(pol.host && state.plants[pol.host] && !state.pollinators[pol.name]){
      addPollinator(pol.name);
    }
  });
}

// Plant a random initial plant, biased toward lower cost
function plantRandomInitialPlant() {
  const weightedPlants = [];
  PLANTS.forEach(plant => {
    const weight = Math.max(1, Math.floor(50 / plant.cost)); // lower cost = higher weight
    for(let i=0; i<weight; i++) weightedPlants.push(plant);
  });
  const randomPlant = weightedPlants[Math.floor(Math.random() * weightedPlants.length)];
  addPlant(randomPlant.name);
}

// Start game
updateUI();
plantRandomInitialPlant();
