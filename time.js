// time.js

// Array of month names
const MONTH_NAMES = ["April","May","June","July","August","September",
                     "October","November","December","January","February","March"];

// Auto-advance interval ID
let monthInterval = null;

// Start month progression (call on game start)
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

// Advance month and process plants/pollinators
function processMonth(){
    if(state.currentMonth === undefined) state.currentMonth = 0;

    const month = state.currentMonth;

    // Process each plant
    for(const plantName in state.plants){
        const plant = PLANTS.find(p => p.name === plantName);
        if(!plant) continue;

        const count = state.plants[plantName];
        const multiplier = getPrestigeMultiplier();

        // Sprout
        if(plant.sproutMonths.includes(month)){
            state.seeds += Math.ceil(count * 0.5 * multiplier);
        }

        // Bloom → pollinator arrival
        if(plant.bloomMonths.includes(month)){
            processPollinatorArrivalForPlant(plant, count);
        }

        // Seed production
        if(plant.seedMonths.includes(month)){
            state.seeds += Math.ceil(count * 0.5 * multiplier);
        }
    }

    // Advance month
    state.currentMonth = (state.currentMonth + 1) % 12;

    // Update UI and journal
    updateUI();
    updateFieldJournal(month);
}

// Helper: pollinator arrivals per plant
function processPollinatorArrivalForPlant(plant, count){
    plant.pollinators.forEach(pollinatorName => {
        const pollinator = POLLINATORS.find(p => p.name === pollinatorName);
        if(!pollinator) return;

        const relevantPlantCount = state.plants[plant.name] || 0;
        if(relevantPlantCount > 0){
            const chance = Math.min(0.5, relevantPlantCount * 0.1); // 10% per plant, max 50%
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

// Helper: Get month name
function getMonthName(monthIndex){
    return MONTH_NAMES[monthIndex % 12];
}

// Initialize month progression
if(state.currentMonth === undefined) state.currentMonth = 0;
startMonthProgression(3000); // 3s per month
