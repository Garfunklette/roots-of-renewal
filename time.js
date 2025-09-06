// time.js

// Array of month names
const MONTH_NAMES = ["April","May","June","July","August","September","October","November","December","January","February","March"];

// Auto-advance interval (ms)
let monthInterval = null;

// Start month progression
function startMonthProgression(intervalMs = 3000){
  if(monthInterval) clearInterval(monthInterval);
  monthInterval = setInterval(() => {
    processMonth();
  }, intervalMs);
}

// Stop month progression
function stopMonthProgression(){
  if(monthInterval) clearInterval(monthInterval);
}

// Advance month
function advanceMonth(){
  state.currentMonth = (state.currentMonth + 1) % 12;
}

// Process monthly plant and pollinator updates
function processMonth(){
  const month = state.currentMonth;
  const multiplier = getPrestigeMultiplier();

  // Plants
  for(const plantName in state.plants){
    const plant = PLANTS.find(p => p.name === plantName);
    const count = state.plants[plantName];
    if(!plant) continue;

    // Sprout
    if(plant.sproutMonths.includes(month)){
      const newSeeds = Math.ceil(count * 0.5 * multiplier);
      state.seeds += newSeeds;
    }

    // Bloom
    if(plant.bloomMonths.includes(month)){
      processPollinatorArrivalForPlant(plant, count);
    }

    // Seed production
    if(plant.seedMonths.includes(month)){
      const extraSeeds = Math.ceil(count * 0.5 * multiplier);
      state.seeds += extraSeeds;
    }
  }

  // Advance month
  advanceMonth();

  // Update UI
  updateUI();

  // Update Field Journal
  updateFieldJournal(month);
}

// Pollinator arrival per plant
function processPollinatorArrivalForPlant(plant, count){
  plant.pollinators.forEach(pollinatorName => {
    const pollinator = POLLINATORS.find(p => p.name === pollinatorName);
    if(!pollinator) return;

    const relevantPlantCount = state.plants[plant.name] || 0;
    if(relevantPlantCount > 0){
      const chance = Math.min(0.5, relevantPlantCount * 0.1);
      if(Math.random() < chance){
        if(!state.pollinators[pollinatorName]){
          state.pollinators[pollinatorName] = 1;
          state.discoveredPollinators.add(pollinatorName);
        } else {
          state.pollinators[pollinatorName]++;
        }
      }
    }
  });
}

// Helper: get month name
function getMonthName(monthIndex){
  return MONTH_NAMES[monthIndex % 12];
}

// Update Field Journal
function updateFieldJournal(month){
  const monthName = getMonthName(month);
  const { plantCount, pollinatorCount } = getSpeciesCounts();
  const journalEntry = `Month: ${monthName} | Plants: ${plantCount} | Pollinators: ${pollinatorCount}`;
  console.log(journalEntry); // replace with UI Field Journal update
}

// Start auto-progression when game starts
if(state.currentMonth === undefined) state.currentMonth = 0; // start in April
startMonthProgression(3000); // default 3 seconds per month
