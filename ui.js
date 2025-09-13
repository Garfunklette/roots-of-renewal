// ==========================
// UI STATE
// ==========================
const guideState = {
  activeTab: "plants",
  currentPage: 0,
  entriesPerPage: 3
};

// ==========================
// UPDATE UI
// ==========================
function updateUI() {
  // Seeds
  const seedsEl = document.getElementById("seeds");
  if (seedsEl) seedsEl.textContent = state.seeds;

  // Plants
  const plantsEl = document.getElementById("debugPlants");
  if (plantsEl) {
    plantsEl.innerHTML = "";
    Object.entries(state.plants).forEach(([name, count]) => {
      const div = document.createElement("div");
      div.textContent = `${name}: ${count}`;
      plantsEl.appendChild(div);
    });
  }

  // Pollinators
  const pollinatorsEl = document.getElementById("debugPollinators");
  if (pollinatorsEl) {
    pollinatorsEl.innerHTML = "";
    Object.entries(state.pollinators).forEach(([name, count]) => {
      const div = document.createElement("div");
      div.textContent = `${name}: ${count}`;
      pollinatorsEl.appendChild(div);
    });
  }

  // Prestige
  const prestigeEl = document.getElementById("prestigeLevel");
  if (prestigeEl) prestigeEl.textContent = state.prestigeLevel;

  const impactEl = document.getElementById("globalImpactPoints");
  if (impactEl) impactEl.textContent = state.globalImpactPoints;

  // Field guide refresh
  buildFieldGuide(guideState.activeTab);
}

// ==========================
// DISCOVERY POPUPS
// ==========================
function showDiscoveryPopup(name, type) {
  const popup = document.createElement("div");
  popup.className = "discoveryPopup";
  popup.textContent = `New ${type} discovered: ${name}!`;
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.classList.add("fadeOut");
    setTimeout(() => popup.remove(), 1000);
  }, 2000);
}

// ==========================
// FIELD GUIDE
// ==========================
function buildFieldGuide(tab = guideState.activeTab) {
  guideState.activeTab = tab;
  const guide = document.getElementById("fieldGuideContent");
  if (!guide) return;

  guide.innerHTML = "";

  let entries = [];
  if (tab === "plants") {
    entries = Array.from(state.discoveredPlants)
      .sort()
      .map(name => PLANTS.find(p => p.name === name));
  } else if (tab === "pollinators") {
    entries = Array.from(state.discoveredPollinators)
      .sort()
      .map(name => POLLINATORS.find(p => p.name === name));
  }

  if (!entries.length) {
    guide.innerHTML = `<p>No entries discovered yet.</p>`;
    const indicator = document.getElementById("pageIndicator");
    if (indicator) indicator.textContent = "Page 0";
    return;
  }

  // Pagination
  const start = guideState.currentPage * guideState.entriesPerPage;
  const pageEntries = entries.slice(start, start + guideState.entriesPerPage);

  // Render entries
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
            : "Blooms from " +
              getMonthName(entry.bloomMonths[0]) +
              " to " +
              getMonthName(entry.bloomMonths[entry.bloomMonths.length - 1])
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

  // Page indicator
  const pageCount = Math.ceil(entries.length / guideState.entriesPerPage);
  const indicator = document.getElementById("pageIndicator");
  if (indicator) {
    indicator.textContent = `Page ${guideState.currentPage + 1} of ${pageCount}`;
  }
}

// ==========================
// EVENT WIRING
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  // Field guide tabs
  const plantsTab = document.getElementById("plantsTab");
  if (plantsTab) {
    plantsTab.addEventListener("click", () => {
      guideState.currentPage = 0;
      buildFieldGuide("plants");
    });
  }

  const pollinatorsTab = document.getElementById("pollinatorsTab");
  if (pollinatorsTab) {
    pollinatorsTab.addEventListener("click", () => {
      guideState.currentPage = 0;
      buildFieldGuide("pollinators");
    });
  }

  // Pagination buttons
  const prevBtn = document.getElementById("prevPage");
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (guideState.currentPage > 0) {
        guideState.currentPage--;
        buildFieldGuide();
      }
    });
  }

  const nextBtn = document.getElementById("nextPage");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      guideState.currentPage++;
      buildFieldGuide();
    });
  }

  // Scatter button
  const scatterBtn = document.getElementById("scatterBtn");
  if (scatterBtn) {
    scatterBtn.addEventListener("click", () => scatterSeeds(5));
  }

  // Debug: Add plant buttons
  const testContainer = document.getElementById("plantButtons");
  if (testContainer) {
    PLANTS.forEach(p => {
      const btn = document.createElement("button");
      btn.textContent = `Debug Plant: ${p.name}`;
      btn.onclick = () => plantSeedDebug(p.name);
      testContainer.appendChild(btn);
    });
  }
});
