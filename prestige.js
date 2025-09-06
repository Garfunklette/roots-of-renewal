// prestige.js

// Define prestige tiers and narrative messages
const PRESTIGE_TIERS = [
  { level: 0, name: "Own Garden", threshold: 0, message: "You start by nurturing your own garden." },
  { level: 1, name: "Neighborhood Restoration", threshold: 100, message: "Your garden inspires your neighbors! Neighborhood plots bloom with native plants." },
  { level: 2, name: "Urban Renewal", threshold: 500, message: "Urban plots are revitalized; pollinators flourish across the city." },
  { level: 3, name: "Regional Conservation", threshold: 2000, message: "Your conservation efforts now influence ecosystems across the region." },
  { level: 4, name: "Global Impact", threshold: 5000, message: "Your restoration initiatives now have worldwide impact! Rare plants and pollinators are unlocked." }
];

// Initialize prestige state
if (state.prestigeLevel === undefined) state.prestigeLevel = 0;
if (state.globalImpactPoints === undefined) state.globalImpactPoints = 0;

// Returns current tier object
function getCurrentTier() {
  return PRESTIGE_TIERS[Math.min(state.prestigeLevel, PRESTIGE_TIERS.length - 1)];
}

// Check if player can prestige
function canPrestige() {
  const nextTier = PRESTIGE_TIERS[state.prestigeLevel + 1];
  if (!nextTier) return false;
  return state.stewardshipPoints >= nextTier.threshold;
}

// Prestige action
function prestige() {
  if (!canPrestige()) {
    alert("You need more stewardship points to advance to the next tier!");
    return;
  }

  const nextTier = PRESTIGE_TIERS[state.prestigeLevel + 1];

  // Calculate global impact points (example: stewardship points + square footage)
  const totalSquareFootage = Object.keys(state.plants).reduce((sum, name) => {
    const plant = PLANTS.find(p => p.name === name);
    const count = state.plants[name] || 0;
    return sum + (plant ? plant.squareFeet * count : 0);
  }, 0);

  const impact = Math.floor(state.stewardshipPoints + totalSquareFootage);
  state.globalImpactPoints += impact;

  // Increment prestige level
  state.prestigeLevel++;

  // Reset seeds, plants, pollinators, stewardship points, discovered sets
  state.seeds = 10;
  state.plants = {};
  state.pollinators = {};
  state.stewardshipPoints = 0;
  state.discoveredPlants.clear();
  state.discoveredPollinators.clear();

  // Update UI
  document.getElementById("prestigeTierName").textContent = nextTier.name;
  document.getElementById("prestigeLevel").textContent = state.prestigeLevel;
  document.getElementById("globalImpactPoints").textContent = state.globalImpactPoints;
  document.getElementById("prestigeMessage").textContent = nextTier.message;

  // Notify player
  alert(`🌎 Prestige achieved! Global impact +${impact} points. Multiplier now x${1 + state.prestigeLevel*0.1}`);

  // Plant initial random plant for new cycle
  plantRandomInitialPlant();
  updateUI();
  buildFieldGuide();
}

// Returns multiplier based on prestige level
function getPrestigeMultiplier() {
  return 1 + (state.prestigeLevel * 0.1);
}

// Example: modify seed and stewardship gains in processPlantsForMonth
// state.seeds += Math.ceil(count * 0.5 * getPrestigeMultiplier());
// state.stewardshipPoints += count * 0.1 * getPrestigeMultiplier();
