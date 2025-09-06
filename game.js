// game.js

// Initialize game state
const state = {
  seeds: 10,
  plants: {}, // { "Milkweed": 3, "Blazing Star": 5 }
  pollinators: {}, // { "Monarch": 1, "Bumblebee": 2 }
  prestigeLevel: 0,
  globalImpactPoints: 0,
  discoveredPlants: new Set(),
  discoveredPollinators: new Set()
};

// Returns current number of species
function getSpeciesCounts(){
  return {
    plantCount: Object.keys(state.plants).length,
    pollinatorCount: Object.keys(state.pollinators).length
  };
}

// Update UI counters
function updateUI(){
  // Seeds
  document.getElementById("seedCount").textContent = state.seeds;

  // Species counts
  const { plantCount, pollinatorCount } = getSpeciesCounts();
  document.getElementById("plantSpeciesCount").textContent = plantCount;
  document.getElementById("pollinatorSpeciesCount").textContent = pollinatorCount;

  // Prestige info
  document.getElementById("prestigeLevel").textContent = state.prestigeLevel;
  document.getElementById("prestigeTierName").textContent = getCurrentTier().name;
  document.getElementById("globalImpactPoints").textContent = state.globalImpactPoints;

  // Optional: current month display
  document.getElementById("currentMonth").textContent = getMonthName(state.currentMonth);
}

// Plant a seed manually
function plantSeed(plantName){
  const plant = PLANTS.find(p=>p.name===plantName);
  if(!plant || state.seeds < plant.cost) return;

  state.seeds -= plant.cost;
  addPlant(plantName);
}

// Helper: Add plant
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

// Helper: Add pollinator
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

// Discovery popup
function showDiscoveryPopup(name,type){
  let blurb="";
  if(type==="plant"){
    const plant = PLANTS.find(p=>p.name===name);
    if(plant && plant.blurb) blurb = plant.blurb.split(".")[0]+".";
  } else {
    const pol = POLLINATORS.find(p=>p.name===name);
    if(pol && pol.blurb) blurb = pol.blurb.split(".")[0]+".";
  }

  const popup = document.createElement("div");
  popup.className="discoveryPopup";
  popup.innerHTML=`
    <h3>📖 New Entry Discovered!</h3>
    <p><strong>${name}</strong> (${type === "plant" ? "Plant" : "Pollinator"})</p>
    <p><em>${blurb}</em></p>
    <button onclick="this.parentElement.remove()">Close</button>
  `;
  document.body.appendChild(popup);
  setTimeout(()=>popup.remove(),6000);
}

// Initialize game
updateUI();
plantRandomInitialPlant();
