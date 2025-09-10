// prestige.js

// Prestige tiers: narrative progression from garden → neighborhood → global
const PRESTIGE_TIERS = [
  { name: "Backyard Gardener", requirement: 5 },
  { name: "Neighborhood Naturalist", requirement: 10 },
  { name: "Community Steward", requirement: 20 },
  { name: "Urban Rewilding Leader", requirement: 40 },
  { name: "Regional Conservationist", requirement: 80 },
  { name: "National Advocate", requirement: 160 },
  { name: "Global Restorationist", requirement: 320 }
];

// Return current prestige tier
function getCurrentTier(){
  return PRESTIGE_TIERS[state.prestigeLevel] || { name: "Beyond Global", requirement: Infinity };
}

// Attempt prestige upgrade
function tryPrestige(){
  const { plantCount, pollinatorCount } = getSpeciesCounts();
  const totalSpecies = plantCount + pollinatorCount;
  const nextTier = PRESTIGE_TIERS[state.prestigeLevel];

  if(nextTier && totalSpecies >= nextTier.requirement){
    state.prestigeLevel++;
    state.globalImpactPoints += totalSpecies * 10; // reward scaling
    resetForPrestige();
    updateUI(); // from ui.js
  }
}

// Reset some progress but keep prestige
function resetForPrestige(){
  state.seeds = 10;
  state.plants = {};
  state.pollinators = {};
  state.discoveredPlants = new Set();
  state.discoveredPollinators = new Set();
  plantRandomInitialPlant(); // from game.js
}
