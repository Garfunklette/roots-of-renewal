// prestige.js

// Prestige tiers based on species counts
const PRESTIGE_TIERS = [
  { level: 0, name: "Own Garden", minPlants: 1, minPollinators: 0, message: "Your garden hosts a few native species." },
  { level: 1, name: "Neighborhood Restoration", minPlants: 4, minPollinators: 1, message: "Your plants attract neighbors and local pollinators." },
  { level: 2, name: "Urban Renewal", minPlants: 7, minPollinators: 3, message: "City plots bloom, bringing urban wildlife back." },
  { level: 3, name: "Regional Conservation", minPlants: 11, minPollinators: 5, message: "Your regional projects restore ecosystems." },
  { level: 4, name: "Global Impact", minPlants: 16, minPollinators: 9, message: "You’ve created a thriving network of native species worldwide." }
];

// Ensure state variables exist
if(state.prestigeLevel === undefined) state.prestigeLevel = 0;
if(state.globalImpactPoints === undefined) state.globalImpactPoints = 0;

// Get current tier
function getCurrentTier(){
  return PRESTIGE_TIERS[Math.min(state.prestigeLevel, PRESTIGE_TIERS.length-1)];
}

// Count species
function getSpeciesCounts(){
  return {
    plantCount: Object.keys(state.plants).length,
    pollinatorCount: Object.keys(state.pollinators).length
  };
}

// Check if player can prestige
function canPrestige(){
  const nextTier = PRESTIGE_TIERS[state.prestigeLevel+1];
  if(!nextTier) return false;

  const {plantCount, pollinatorCount} = getSpeciesCounts();
  return plantCount >= nextTier.minPlants && pollinatorCount >= nextTier.minPollinators;
}

// Prestige action
function prestige(){
  if(!canPrestige()){
    alert("You need more species to advance to the next tier!");
    return;
  }

  const nextTier = PRESTIGE_TIERS[state.prestigeLevel+1];

  // Calculate global impact: sum of species counts
  const {plantCount, pollinatorCount} = getSpeciesCounts();
  const impact = plantCount + pollinatorCount;
  state.globalImpactPoints += impact;

  // Increment prestige level
  state.prestigeLevel++;

  // Reset seeds, plants, pollinators, discoveries
  state.seeds = 10;
  state.plants = {};
  state.pollinators = {};
  state.discoveredPlants.clear();
  state.discoveredPollinators.clear();

  // Update UI
  document.getElementById("prestigeTierName").textContent = nextTier.name;
  document.getElementById("prestigeLevel").textContent = state.prestigeLevel;
  document.getElementById("globalImpactPoints").textContent = state.globalImpactPoints;
  document.getElementById("prestigeMessage").textContent = nextTier.message;

  // Optional: Show alert
  alert(`🌎 Prestige achieved! Global impact +${impact} species. You are now at "${nextTier.name}".`);

  // Plant initial random plant for new cycle
  plantRandomInitialPlant();
  updateUI();
  buildFieldGuide();
}

// Multiplier for seed and biodiversity gains
function getPrestigeMultiplier(){
  return 1 + state.prestigeLevel * 0.1;
}
