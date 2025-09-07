// time.js

// Month progression logic
function startMonthProgression(intervalMs = 3000){
  setInterval(()=>advanceMonth(), intervalMs);
}

// Advance to next month
function advanceMonth(){
  state.currentMonth = (state.currentMonth + 1) % 12;

  handlePlantCycles();
  handlePollinatorArrivals();

  updateUI(); // from ui.js
}

// Handle plant growth cycles
function handlePlantCycles(){
  Object.keys(state.plants).forEach(name=>{
    const plant = PLANTS.find(p=>p.name===name);
    if(!plant) return;

    // Bloom months produce points
    if(plant.bloomMonths.includes(state.currentMonth)){
      // stewardship → biodiversity change
      state.globalImpactPoints += state.plants[name];
    }

    // Seed months generate extra seeds
    if(plant.seedMonths && plant.seedMonths.includes(state.currentMonth)){
      state.seeds += Math.ceil(state.plants[name] * 0.5);
    }
  });
}

// Handle pollinator arrival logic
function handlePollinatorArrivals(){
  POLLINATORS.forEach(pol=>{
    if(state.discoveredPollinators.has(pol.name)) return;

    // Check host and food plants
    const hasHost = pol.hostPlants.some(h=>state.plants[h] > 0);
    const hasFood = pol.foodPlants.some(f=>state.plants[f] > 0);

    if(hasHost && hasFood){
      const hostCount = pol.hostPlants.reduce((sum,h)=>sum+(state.plants[h]||0),0);
      const foodCount = pol.foodPlants.reduce((sum,f)=>sum+(state.plants[f]||0),0);
      const chance = Math.min(0.2, (hostCount + foodCount) * 0.01); // up to 20%

      if(Math.random() < chance){
        addPollinator(pol.name);
      }
    }
  });
}

// Utility: convert month index to name
function getMonthName(index){
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  return months[index % 12];
}
