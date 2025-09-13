// ui.js

// ---------- Helper Functions ----------
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// Update UI counters (safe version)
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

  if (typeof getMonthName === "function") {
    setText("currentMonth", getMonthName(state.currentMonth));
  }

  // --- Debug UI ---
  setText("debugSeeds", state.seeds);

  const seedBankEl = document.getElementById("debugSeedBank");
  if (seedBankEl) {
    seedBankEl.innerHTML = "";
    if (!state.seedBank.length) {
      seedBankEl.innerHTML = "<li>[empty]</li>";
    } else {
      state.seedBank.forEach(seed => {
        const li = document.createElement("li");
        li.textContent = `${seed.plantName} (planted in ${getMonthName(seed.plantedMonth)})`;
        seedBankEl.appendChild(li);
      });
    }
  }

  const plantsEl = document.getElementById("debugPlants");
  if (plantsEl) {
    plantsEl.innerHTML = "";
    const names = Object.keys(state.plants);
    if (!names.length) {
      plantsEl.innerHTML = "<li>[none]</li>";
    } else {
      names.forEach(name => {
        const li = document.createElement("li");
        li.textContent = `${name}: ${state.plants[name]}`;
        plantsEl.appendChild(li);
      });
    }
  }

  const pollinatorsEl = document.getElementById("debugPollinators");
  if (pollinatorsEl) {
    pollinatorsEl.innerHTML = "";
    const names = Object.keys(state.pollinators);
    if (!names.length) {
      pollinatorsEl.innerHTML = "<li>[none]</li>";
    } else {
      names.forEach(name => {
        const li = document.createElement("li");
        li.textContent = `${name}: ${state.pollinators[name]}`;
        pollinatorsEl.appendChild(li);
      });
    }
  }
}

// ---------- Plant Shop ----------
function buildPlantShop() {
  const container = document.getElementById("plantButtons");
  if (!container) return;
  container.innerHTML = "";

  PLANTS.forEach(plant => {
    const btn = document.createElement("button");
    btn.textContent = `🌱 ${plant.name} (${plant.cost} seeds)`;
    btn.onclick = () => plantSeed(plant.name);
    container.appendChild(btn);
  });
}

// ---------- Discovery Popup ----------
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
    <p><strong>${name}</strong> (${type === "plant" ? "Plant" : "Pollinator"})</p>
    <p><em>${blurb}</em></p>
    <button onclick="this.parentElement.remove()">Close</button>
  `;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 6000);
}

// ---------- Unified Field Guide ----------
const guideState = {
  activeTab: "plants",
  currentPage: 0,
  entriesPerPage: 3,
};

function getGuideEntries() {
  const source = guideState.activeTab === "plants" ? state.discoveredPlants : state.discoveredPollinators;
  return Array.from(source).sort().map(name =>
    guideState.activeTab === "plants"
      ? PLANTS.find(p => p.name === name)
      : POLLINATORS.find(p => p.name === name)
  );
}

function buildFieldGuide(tab) {
  if (tab) {
    guideState.activeTab = tab;
    guideState.currentPage = 0;
  }

  const guide = document.getElementById("fieldGuideContent");
  if (!guide) return;
  guide.innerHTML = "";

  const entries = getGuideEntries();
  if (!entries.length) {
    guide.innerHTML = "<p>No entries discovered yet.</p>";
    setText("pageIndicator", "Page 0");
    return;
  }

  const start = guideState.currentPage * guideState.entriesPerPage;
  const pageEntries = entries.slice(start, start + guideState.entriesPerPage);

  pageEntries.forEach(entry => {
    if (!entry) return;
    const div = document.createElement("div");
    div.className = "guideEntry";

    if (guideState.activeTab === "plants") {
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

  const totalPages = Math.ceil(entries.length / guideState.entriesPerPage);
  setText("pageIndicator", `Page ${guideState.currentPage + 1} of ${totalPages}`);
}

// ---------- Pagination Controls ----------
function changeGuidePage(delta) {
  const entries = getGuideEntries();
  const totalPages = Math.ceil(entries.length / guideState.entriesPerPage);
  guideState.currentPage = Math.min(Math.max(guideState.currentPage + delta, 0), totalPages - 1);
  buildFieldGuide();
}

function switchGuideTab(tab) {
  guideState.activeTab = tab;
  guideState.currentPage = 0;
  buildFieldGuide();
}

// ---------- Journal ----------
function renderJournal() {
  const journal = document.getElementById("fieldJournal");
  if (!journal) return;
  journal.innerHTML = "";

  state.discoveredPlants.forEach(name => {
    const plant = PLANTS.find(p => p.name === name);
    if (!plant) return;
    const entry = document.createElement("div");
    entry.className = "journalEntry";
    entry.innerHTML = `
      <h4>${plant.name}</h4>
      <p><strong>Bloom:</strong> ${
        plant.bloomMonths.length === 1
          ? "Blooms in " + getMonthName(plant.bloomMonths[0])
          : "Blooms from " + getMonthName(plant.bloomMonths[0]) + " to " + getMonthName(plant.bloomMonths[plant.bloomMonths.length-1])
      }</p>
      <p><strong>Height:</strong> ${plant.height}</p>
      <p><strong>Spacing:</strong> ${plant.spacing}</p>
    `;
    journal.appendChild(entry);
  });
}

// ---------- Debug Seed Bank ----------
function updateDebugUI() {
  const debugEl = document.getElementById("seedBankList");
  if (!debugEl) return;

  if (!state.seedBank.length) {
    debugEl.textContent = "[empty]";
    return;
  }

  debugEl.textContent = state.seedBank
    .map(s => `${s.plantName} (planted ${getMonthName(s.plantedMonth)})`)
    .join(", ");
}

// ---------- DOMContentLoaded ----------
document.addEventListener("DOMContentLoaded", () => {
  // Tabs
  const plantsTab = document.getElementById("plantsTab");
  const pollinatorsTab = document.getElementById("pollinatorsTab");
  if (plantsTab && pollinatorsTab) {
    plantsTab.addEventListener("click", () => switchGuideTab("plants"));
    pollinatorsTab.addEventListener("click", () => switchGuideTab("pollinators"));
  }

  // Pagination
  const prevPage = document.getElementById("prevPage");
  const nextPage = document.getElementById("nextPage");
  if (prevPage) prevPage.addEventListener("click", () => changeGuidePage(-1));
  if (nextPage) nextPage.addEventListener("click", () => changeGuidePage(1));

  // Initial Field Guide
  buildFieldGuide();

  // Prestige Button
  const prestigeBtn = document.getElementById("prestigeBtn");
  if (prestigeBtn) {
    prestigeBtn.addEventListener("click", () => {
      if (typeof tryPrestige === "function") tryPrestige();
    });
  }

// Dark Mode
  const darkToggle = document.getElementById("darkModeToggle");
  if (darkToggle) {
    const savedDark = localStorage.getItem("darkMode") === "1";
    if (savedDark) document.body.classList.add("dark");

    darkToggle.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("dark");
      localStorage.setItem("darkMode", isDark ? "1" : "0");
    });
  }

  // Scatter debug seeds (if button exists)
  const scatterBtn = document.getElementById("scatterBtn");
  if (scatterBtn) scatterBtn.addEventListener("click", scatterSeedsDebug);
});

// ---------- Window Load ----------
window.onload = () => {
  // Build plant shop buttons
  if (typeof buildPlantShop === "function") {
    buildPlantShop();
  }

  // Update UI counters at start
  updateUI();

  // Add one random initial plant
  if (typeof plantRandomInitialPlant === "function") {
    plantRandomInitialPlant();
  }

  // Add one random pollinator for testing
  if (POLLINATORS && POLLINATORS.length > 0 && typeof addPollinator === "function") {
    const randomPol = POLLINATORS[Math.floor(Math.random() * POLLINATORS.length)];
    addPollinator(randomPol.name);
  }

  // Begin month progression if function exists
  if (typeof startMonthProgression === "function") {
    startMonthProgression(3000); // 3 seconds per month for testing
  }
};
