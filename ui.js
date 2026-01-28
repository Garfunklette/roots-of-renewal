// ui.js

// ==================== UI STATE ====================

let guideState = {
  page: 0,
  entriesPerPage: 5,
  category: "plants"
};

// ==================== MAIN UI ====================

function updateUI() {
  const lot = getActiveLot();
  document.getElementById("monthDisplay").textContent =
    `Year ${state.year}, Month ${state.currentMonth}`;
  document.getElementById("lotDisplay").textContent =
    `${lot.name} — ${lot.usedSqFt}/${lot.capacitySqFt} sq ft used`;

  const plantList = document.getElementById("plantsList");
  plantList.innerHTML = "";
  Object.entries(lot.plants).forEach(([name, count]) => {
    const li = document.createElement("li");
    li.textContent = `${name} x${count}`;
    plantList.appendChild(li);
  });

  const pollinatorList = document.getElementById("pollinatorsList");
  pollinatorList.innerHTML = "";
  Object.entries(lot.pollinators).forEach(([name, count]) => {
    const li = document.createElement("li");
    li.textContent = `${name} x${count}`;
    pollinatorList.appendChild(li);
  });

  const seedBankList = document.getElementById("seedBankList");
  seedBankList.innerHTML = "";
  lot.seedBank.forEach(seed => {
    const li = document.createElement("li");
    li.textContent = `${seed.plantName} (seed)`;
    seedBankList.appendChild(li);
  });
}

// ==================== FIELD GUIDE ====================

function buildFieldGuide() {
  const guide = document.getElementById("fieldGuideEntries");
  guide.innerHTML = "";

  const entries = guideState.category === "plants"
    ? Array.from(state.discoveredPlants).map(name => findPlantDef(name))
    : Array.from(state.discoveredPollinators).map(name => findPollinatorDef(name));

  const start = guideState.page * guideState.entriesPerPage;
  const end = start + guideState.entriesPerPage;
  const pageEntries = entries.slice(start, end);

  pageEntries.forEach(entry => {
    if (!entry) return;
    const card = document.createElement("div");
    card.className = "guide-card";

    card.innerHTML = `
      <h3>${entry.name}</h3>
      <p>${entry.blurb}</p>
    `;

    guide.appendChild(card);
  });
}

function switchGuideCategory(cat) {
  guideState.category = cat;
  guideState.page = 0;
  buildFieldGuide();
}

function nextGuidePage() {
  guideState.page++;
  buildFieldGuide();
}

function prevGuidePage() {
  if (guideState.page > 0) guideState.page--;
  buildFieldGuide();
}

// ==================== POPUPS ====================

function showDiscoveryPopup(name, type) {
  const popup = document.getElementById("discoveryPopup");
  popup.textContent = `New ${type} discovered: ${name}!`;
  popup.style.display = "block";
  setTimeout(() => {
    popup.style.display = "none";
  }, 3000);
}

// ====================== ligh dark theme toggle

document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("themeToggle");
  const body = document.body;

  toggleButton.addEventListener("click", () => {
    if (body.classList.contains("dark-theme")) {
      body.classList.remove("dark-theme");
      body.classList.add("light-theme");
      toggleButton.textContent = "Switch to Dark Mode";
    } else {
      body.classList.remove("light-theme");
      body.classList.add("dark-theme");
      toggleButton.textContent = "Switch to Light Mode";
    }
  });
});
