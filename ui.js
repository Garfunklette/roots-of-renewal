// ui.js

// Update UI counters
function updateUI(){
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
function showDiscoveryPopup(name,type){
  let blurb="";
  if(type==="plant"){
    const plant = PLANTS.find(p=>p.name===name);
    if(plant && plant.blurb) blurb = plant.blurb.split(".")[0]+".";
  } else {
    const pol = POLLINATORS.find(p=>p.name===name);
    if(pol && pol.blurb) blurb = pol.blurb.split(".")[0]+".";
  }

  const popup = document.createElement("div");
  popup.className="discoveryPopup";
  popup.innerHTML=`
    <h3>📖 New Entry Discovered!</h3>
    <p><strong>${name}</strong> (${type === "plant" ? "Plant" : "Pollinator"})</p>
    <p><em>${blurb}</em></p>
    <button onclick="this.parentElement.remove()">Close</button>
  `;
  document.body.appendChild(popup);
  setTimeout(()=>popup.remove(),6000);
}

// Field Guide builder with tabs
function buildFieldGuide(activeTab = "plants") {
  const guide = document.getElementById("fieldGuideContent");
  guide.innerHTML = "";

  if (activeTab === "plants" && state.discoveredPlants.size > 0) {
    const sortedPlants = Array.from(state.discoveredPlants).sort();
    sortedPlants.forEach(name => {
      const plant = PLANTS.find(p => p.name === name);
      if (plant) {
        const div = document.createElement("div");
        div.className = "guideEntry";
        div.innerHTML = `
          <h3>${plant.name}</h3>
          <p>${plant.blurb}</p>
          <p><strong>Bloom:</strong> ${
            plant.bloomMonths.length === 1
              ? "Blooms in " + getMonthName(plant.bloomMonths[0])
              : "Blooms from " + getMonthName(plant.bloomMonths[0]) + " to " + getMonthName(plant.bloomMonths[plant.bloomMonths.length - 1])
          }</p>
          <p><strong>Height:</strong> ${plant.height}</p>
          <p><strong>Spacing:</strong> ${plant.spacing}</p>
          <details>
            <summary>More details</summary>
            <p><strong>Square Ft:</strong> ${plant.squareFeet}</p>
            <p><strong>Cost:</strong> ${plant.cost} seeds</p>
          </details>
        `;
        guide.appendChild(div);
      }
    });
  }

  if (activeTab === "pollinators" && state.discoveredPollinators.size > 0) {
    const sortedPols = Array.from(state.discoveredPollinators).sort();
    sortedPols.forEach(name => {
      const pol = POLLINATORS.find(p => p.name === name);
      if (pol) {
        const div = document.createElement("div");
        div.className = "guideEntry";
        div.innerHTML = `
          <h3>${pol.name}</h3>
          <p>${pol.blurb}</p>
          <p><strong>Host Plants:</strong> ${pol.hostPlants.join(", ")}</p>
          <p><strong>Food Plants:</strong> ${pol.foodPlants.join(", ")}</p>
        `;
        guide.appendChild(div);
      }
    });
  }
}


// Journal rendering (if you’re keeping it separate from field guide)
function renderJournal(){ 
  const journal = document.getElementById("fieldJournal");
  journal.innerHTML = "";

  state.discoveredPlants.forEach(name=>{
    const plant = PLANTS.find(p=>p.name===name);
    if(plant){
      const entry = document.createElement("div");
      entry.className="journalEntry";
      entry.innerHTML=`
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
    }
  });
}

// Dark mode toggle + persistence
document.addEventListener("DOMContentLoaded", () => {
  const darkToggle = document.getElementById("darkModeToggle");

  // Apply saved preference on load
  const savedDark = localStorage.getItem("darkMode") === "1";
  if(savedDark) document.body.classList.add("dark");

  if(darkToggle){
    darkToggle.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("dark");
      localStorage.setItem("darkMode", isDark ? "1" : "0");
    });
  }
});
                                 }
document.addEventListener("DOMContentLoaded", () => {
  const plantsTab = document.getElementById("plantsTab");
  const pollinatorsTab = document.getElementById("pollinatorsTab");

plantsTab.addEventListener("click", () => {
  plantsTab.classList.add("active");
  pollinatorsTab.classList.remove("active");
  buildFieldGuide("plants");
});
pollinatorsTab.addEventListener("click", () => {
  pollinatorsTab.classList.add("active");
  plantsTab.classList.remove("active");
  buildFieldGuide("pollinators");
});
  }

  // Default tab on load
  buildFieldGuide("plants");
});
