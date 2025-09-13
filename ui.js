// ui.js

// -----------------------------
// Helper Functions
// -----------------------------

// Safely set textContent if element exists
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// Update UI counters and debug panels
function updateUI() {
  setText("seedCount", state.seeds);
  const { plantCount, pollinatorCount } = getSpeciesCounts();
  setText("plantSpeciesCount", plantCount);
  setText("pollinatorSpeciesCount", pollinatorCount);
  setText("prestigeLevel", state.prestigeLevel);
  if (typeof getCurrentTier === "function") {
    const tier = getCurrentTier();
    if (tier) setText("prestigeTierName", tier.name);
  }
  setText("globalImpactPoints", state.globalImpactPoints);
  if (typeof getMonthName === "function") setText("currentMonth", getMonthName(state.currentMonth));

  // Debug Panels
  updateDebugUI();
}

// Update debug panels
function updateDebugUI() {
  const seedBankEl = document.getElementById("debugSeedBank");
  if (seedBankEl) {
    seedBankEl.innerHTML = state.seedBank.length
      ? state.seedBank.map(s => `<li>${s.plantName} (planted ${getMonthName(s.plantedMonth)})</li>`).join("")
      : "<li>[empty]</li>";
  }

  const plantsEl = document.getElementById("debugPlants");
  if (plantsEl) {
    const names = Object.keys(state.plants);
    plantsEl.innerHTML = names.length
      ? names.map(n => `<li>${n}: ${state.plants[n]}</li>`).join("")
      : "<li>[none]</li>";
  }

  const pollinatorsEl = document.getElementById("debugPollinators");
  if (pollinatorsEl) {
    const names = Object.keys(state.pollinators);
    pollinatorsEl.innerHTML = names.length
      ? names.map(n => `<li>${n}: ${state.pollinators[n]}</li>`).join("")
      : "<li>[none]</li>";
  }
}

// Show discovery popup
function showDiscoveryPopup(name, type) {
  let blurb = "";
  if (type === "plant") {
    const plant = PLANTS.find(p => p.name === name);
    if (plant && plant.blurb) blurb = plant.blurb.split(".")[0] + ".";
  } else {
    const pol = POLLINATORS.find(p => p.name === name);
    if (pol && pol.blurb) blurb = pol.blurb.split(".")[0] + ".";
  }

  const popup = document.createElement("div");
  popup.className = "discoveryPopup";
  popup.innerHTML = `
    <h3>📖 New Entry Discovered!</h3>
    <p><strong>${name}</strong> (${type})</p>
    <p><em>${blurb}</em></p>
    <button onclick="this.parentElement.remove()">Close</button>
  `;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 6000);
}

// Build Plant Shop buttons
function buildPlantShopUI() {
  const container = document.getElementById("plantButtons");
  if (!container) return;
  container.innerHTML = "";

  PLANTS.forEach(plant => {
    const btn = document.createElement("button");
    btn.textContent = `🌱 ${plant.name} (${plant.cost} seeds)`;
    btn.onclick = () => plantSeed(plant.name); // from game.js
    container.appendChild(btn);
  });
}

// Field Guide builder
function buildFieldGuide(tab = guideState.activeTab) {
  guideState.activeTab = tab;
  const guide = document.getElementById("fieldGuideContent");
  if (!guide) return;
  guide.innerHTML = "";

  let entries = [];
  if (tab === "plants") {
    entries = Array.from(state.discoveredPlants).sort().map(name => PLANTS.find(p => p.name === name));
  } else {
    entries = Array.from(state.discoveredPollinators).sort().map(name => POLLINATORS.find(p => p.name === name));
  }

  if (!entries.length) {
    guide.innerHTML = "<p>No entries discovered yet.</p>";
    return;
  }

  const start = guideState.currentPage * guideState.entriesPerPage;
  const pageEntries = entries.slice(start, start + guideState.entriesPerPage);

  pageEntries.forEach(entry => {
    if (!entry) return;
    const div = document.createElement("div");
    div.className = "guideEntry";

    if (tab === "plants") {
      div.innerHTML = `
        <h3>${entry.name}</h3>
        <p>${entry.blurb}</p>
        <p><strong>Bloom:</strong> ${
          entry.bloomMonths.length === 1
            ? "Blooms in " + getMonthName(entry.bloomMonths[0])
            : "Blooms from " + getMonthName(entry.bloomMonths[0]) + " to " + getMonthName(entry.bloomMonths[entry.bloomMonths.length - 1])
        }</p>
        <p><strong>Height:</strong> ${entry.height}</p>
        <p><strong>Spacing:</strong> ${entry.spacing}</p>
        <details>
          <summary>More details</summary>
          <p><strong>Square Ft:</strong> ${entry.squareFeet}</p>
          <p><strong>Cost:</strong> ${entry.cost} seeds</p>
        </details>
      `;
    } else {
      div.innerHTML = `
        <h3>${entry.name}</h3>
        <p>${entry.blurb}</p>
        <p><strong>Host Plants:</strong> ${entry.hostPlants.join(", ")}</p>
        <p><strong>Food Plants:</strong> ${entry.foodPlants.join(", ")}</p>
      `;
    }

    guide.appendChild(div);
  });

  const pageIndicator = document.getElementById("pageIndicator");
  if (pageIndicator) {
    const pageCount = Math.ceil(entries.length / guideState.entriesPerPage);
    pageIndicator.textContent = `Page ${guideState.currentPage + 1} of ${pageCount}`;
  }
}

// -----------------------------
// DOM Event Bindings
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Plant Shop
  buildPlantShopUI();

  // Scatter Button
  const scatterBtn = document.getElementById("scatterBtn");
  if (scatterBtn) scatterBtn.addEventListener("click", () => scatterSeeds(5));

  // Field Guide Tabs
  const plantsTab = document.getElementById("plantsTab");
  const pollinatorsTab = document.getElementById("pollinatorsTab");
  if (plantsTab && pollinatorsTab) {
    plantsTab.addEventListener("click", () => {
      guideState.currentPage = 0;
      plantsTab.classList.add("active");
      pollinatorsTab.classList.remove("active");
      buildFieldGuide("plants");
    });
    pollinatorsTab.addEventListener("click", () => {
      guideState.currentPage = 0;
      pollinatorsTab.classList.add("active");
      plantsTab.classList.remove("active");
      buildFieldGuide("pollinators");
    });
  }

  // Field Guide Pagination
  const prevPage = document.getElementById("prevPage");
  const nextPage = document.getElementById("nextPage");
  if (prevPage) prevPage.addEventListener("click", () => {
    if (guideState.currentPage > 0) {
      guideState.currentPage--;
      buildFieldGuide();
    }
  });
  if (nextPage) nextPage.addEventListener("click", () => {
    const totalEntries = guideState.activeTab === "plants" ? state.discoveredPlants.size : state.discoveredPollinators.size;
    const maxPage = Math.ceil(totalEntries / guideState.entriesPerPage) - 1;
    if (guideState.currentPage < maxPage) {
      guideState.currentPage++;
      buildFieldGuide();
    }
  });

  // Prestige Button
  const prestigeBtn = document.getElementById("prestigeBtn");
  if (prestigeBtn) prestigeBtn.addEventListener("click", () => {
    if (typeof tryPrestige === "function") tryPrestige();
  });

  // Dark Mode Toggle
  const darkToggle = document.getElementById("darkModeToggle");
  if (darkToggle) {
    const savedDark = localStorage.getItem("darkMode") === "1";
    if (savedDark) document.body.classList.add("dark");
    darkToggle.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("dark");
      localStorage.setItem("darkMode", isDark ? "1" : "0");
    });
  }
});

// Initialize UI at game start
window.onload = () => {
  updateUI();
  buildPlantShopUI();
  buildFieldGuide();
};
