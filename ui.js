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
function buildFieldGuide(tab = guideState.activeTab) {
  guideState.activeTab = tab;
  const guide = document.getElementById("guideContent");
  guide.innerHTML = "";

  let entries = [];
  if (tab === "plants") {
    entries = Array.from(state.discoveredPlants).sort().map(name => PLANTS.find(p => p.name === name));
  } else if (tab === "pollinators") {
    entries = Array.from(state.discoveredPollinators).sort().map(name => POLLINATORS.find(p => p.name === name));
  }

  if (!entries.length) {
    guide.innerHTML = `<p>No entries discovered yet.</p>`;
    return;
  }

  // Pagination slice
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

  // Update page indicator
  const pageCount = Math.ceil(entries.length / guideState.entriesPerPage);
  document.getElementById("pageIndicator").textContent = `Page ${guideState.currentPage + 1} of ${pageCount}`;
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
  const prevPage = document.getElementById("prevPage");
  const nextPage = document.getElementById("nextPage");

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

  if (prevPage) {
    prevPage.addEventListener("click", () => {
      if (guideState.currentPage > 0) {
        guideState.currentPage--;
        buildFieldGuide();
      }
    });
  }

  if (nextPage) {
    nextPage.addEventListener("click", () => {
      const totalEntries =
        guideState.activeTab === "plants"
          ? state.discoveredPlants.size
          : state.discoveredPollinators.size;
      const maxPage = Math.ceil(totalEntries / guideState.entriesPerPage) - 1;
      if (guideState.currentPage < maxPage) {
        guideState.currentPage++;
        buildFieldGuide();
      }
    });
  }

  // Default tab
  plantsTab.classList.add("active");
  buildFieldGuide("plants");
});

  
