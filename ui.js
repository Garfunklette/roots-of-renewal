// ui.js
// Handles UI rendering, discovery popups, field guide, and theme

// Update UI counters
function updateUI() {
  // Seeds
  document.getElementById("seedCount").textContent = state.seeds;

  // Species counts
  const { plantCount, pollinatorCount } = getSpeciesCounts();
  document.getElementById("plantSpeciesCount").textContent = plantCount;
  document.getElementById("pollinatorSpeciesCount").textContent = pollinatorCount;

  // Prestige info
  document.getElementById("prestigeLevel").textContent = state.prestigeLevel;
  document.getElementById("prestigeTierName").textContent = getCurrentTier().name;
  document.getElementById("globalImpactPoints").textContent = state.globalImpactPoints;

  // Current month
  document.getElementById("currentMonth").textContent = getMonthName(state.currentMonth);
}

// Discovery popup
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

// Dark mode
function applyTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  localStorage.setItem("darkMode", isDark ? "1" : "0");
}

// Restore dark mode
document.addEventListener("DOMContentLoaded", () => {
  const savedDark = localStorage.getItem("darkMode") === "1";
  applyTheme(savedDark);

  const toggle = document.getElementById("darkModeToggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const nowDark = !document.body.classList.contains("dark");
      applyTheme(nowDark);
    });
  }
});
