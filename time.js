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
  Object.keys(state.plants).forEach(name=>{
    const plant = PLANTS.find(p=>p.name===name);
    if(!plant) return;

    if(plant.bloomMonths.includes(state.currentMonth)){
      state.globalImpactPoints += state.plants[name];
    }

    if(plant.seedMonths && plant.seedMonths.includes(state.currentMonth)){
      state.seeds += Math.ceil(state.plants[name] * 0.5);
    }
  });

  // 🌱 Sprout seeds from the seed bank
  const sprouted = [];
  state.seedBank.forEach((entry, idx)=>{
    const plant = PLANTS.find(p=>p.name===entry.plantName);
    if(plant && plant.sproutMonths.includes(state.currentMonth)){
      addPlant(entry.plantName);
      sprouted.push(idx);
    }
  });

  // Remove sprouted seeds (reverse order to avoid reindexing issues)
  sprouted.reverse().forEach(idx => state.seedBank.splice(idx,1));
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
