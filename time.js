// time.js

// Months and starting month (April)
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
let currentMonthIndex = 3; // 0-based index, April

// Display current month
function updateMonthDisplay() {
  document.getElementById("currentMonth").textContent = MONTHS[currentMonthIndex];
}

// Advance month
function advanceMonth() {
  currentMonthIndex = (currentMonthIndex + 1) % 12;
  const monthNumber = currentMonthIndex + 1; // 1-based for plant data
  processPlantsForMonth(monthNumber);
  updateMonthDisplay();
}

// Process plants each month
function processPlantsForMonth(month) {
  PLANTS.forEach(plant => {
    const count = state.plants[plant.name] || 0;
    if(count === 0) return;

    // Sprouting
    if(plant.sproutMonths.includes(month)){
      const newSeeds = Math.ceil(count * 0.5);
      state.seeds += newSeeds;
    }

    // Blooming
    if(plant.bloomMonths.includes(month)){
      state.stewardshipPoints += count * 0.1;
    }

    // Seeding
    if(plant.seedMonths.includes(month)){
      state.seeds += count;
    }

    // Pollinator arrival
    POLLINATORS.forEach(pol => {
      if(!state.pollinators[pol.name]){
        const hostCount = pol.host ? state.plants[pol.host] || 0 : 0;
        const foodCount = pol.food ? pol.food.split(",").reduce((sum,f)=>{
          return sum + (state.plants[f.trim()] || 0);
        },0) : 0;
        if(hostCount>0 && foodCount>0){
          addPollinator(pol.name);
        }
      }
    });
  });

  updateUI();
}

// Auto-advance every 5 seconds (testing speed)
setInterval(advanceMonth, 5000);
updateMonthDisplay(); // show initial month
