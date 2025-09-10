// time.js

// Month names
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

// Start automatic month progression
function startMonthProgression(intervalMs = 3000){
  setInterval(() => advanceMonth(), intervalMs);
}

// Advance to the next month
function advanceMonth(){
  if(state.currentMonth === undefined) state.currentMonth = 0;

  state.currentMonth = (state.currentMonth + 1) % 12;

  handlePlantCycles();
  handlePollinatorArrivals();

  if(typeof updateUI === "function") updateUI(); // from ui.js
}

// Convert month index to name
function getMonthName(index){
  return MONTHS[index % 12] || "Unknown";
}

// Handle plant growth cycles
function handlePlantCycles(){
  if(!state.plants) return;

  Object.keys(state.plants).forEach(name => {
    const plant = PLANTS.find(p => p.name === name);
    if(!plant) return;

    // Sprout months: optional effects (e.g., visual)
    if(plant.sproutMonths && plant.sproutMonths.includes(state.currentMonth)){
      // Could trigger a sprout animation or message
    }

    // Bloom months produce biodiversity points
    if(plant.bloomMonths && plant.bloomMonths.includes(state.currentMonth)){
      state.globalImpactPoints += state.plants[name]; // 1 pt per plant
    }

    // Seed months generate extra seeds
    if(plant.seedMonths && plant.seedMonths.includes(state.currentMonth)){
      state.seeds += Math.ceil((state.plants[name] || 0) * 0.5);
    }
  });
}

// Handle pollinator arrival logic
function handlePollinatorArrivals(){
  if(!state.pollinators) state.pollinators = {};
  if(!state.plants) state.plants = {};

  POLLINATORS.forEach(pol => {
    if(state.discoveredPollinators.has(pol.name)) return;

    const hasHost = pol.hostPlants && pol.hostPlants.some(h => (state.plants[h] || 0) > 0);
    const hasFood = pol.foodPlants && pol.foodPlants.some(f => (state.plants[f] || 0) > 0);

    if(hasHost && hasFood){
      const hostCount = pol.hostPlants.reduce((sum,h) => sum + (state.plants[h] || 0), 0);
      const foodCount = pol.foodPlants.reduce((sum,f) => sum + (state.plants[f] || 0), 0);
      const chance = Math.min(0.2, (hostCount + foodCount) * 0.01); // max 20%

      if(Math.random() < chance && typeof addPollinator === "function"){
        addPollinator(pol.name);
      }
    }
  });
}
