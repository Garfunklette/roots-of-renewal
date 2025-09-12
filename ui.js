// ui.js

// Update UI counters (safe version)
function updateUI(){
  // Helper: safely update text if element exists
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // Seeds
  setText("seedCount", state.seeds);

  // Species counts
  const { plantCount, pollinatorCount } = getSpeciesCounts();
  setText("plantSpeciesCount", plantCount);
  setText("pollinatorSpeciesCount", pollinatorCount);

  // Prestige info
  setText("prestigeLevel", state.prestigeLevel);
  if (typeof getCurrentTier === "function") {
    const tier = getCurrentTier();
    if (tier) setText("prestigeTierName", tier.name);
  }
  setText("globalImpactPoints", state.globalImpactPoints);

  // Current month
  if (typeof getMonthName === "function") {
    setText("currentMonth", getMonthName(state.currentMonth));
  }

  // --- Debug UI ---
  setText("debugSeeds", state.seeds);

  // Seed bank
  const seedBankEl = document.getElementById("debugSeedBank");
  if (seedBankEl) {
    seedBankEl.innerHTML = "";
    if (state.seedBank.length === 0) {
      seedBankEl.innerHTML = "<li>[empty]</li>";
    } else {
      state.seedBank.forEach(seed => {
        const li = document.createElement("li");
        li.textContent = `${seed.plantName} (planted in ${getMonthName(seed.plantedMonth)})`;
        seedBankEl.appendChild(li);
      });
    }
  }

  // Plants
  const plantsEl = document.getElementById("debugPlants");
  if (plantsEl) {
    plantsEl.innerHTML = "";
    const names = Object.keys(state.plants);
    if (names.length === 0) {
      plantsEl.innerHTML = "<li>[none]</li>";
    } else {
      names.forEach(name => {
        const li = document.createElement("li");
        li.textContent = `${name}: ${state.plants[name]}`;
        plantsEl.appendChild(li);
      });
    }
  }

  // Pollinators
  const pollinatorsEl = document.getElementById("debugPollinators");
  if (pollinatorsEl) {
    pollinatorsEl.innerHTML = "";
    const names = Object.keys(state.pollinators);
    if (names.length === 0) {
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

// Plant shop
function buildPlantShop(){
  const container = document.getElementById("plantButtons");
  container.innerHTML = "";

  PLANTS.forEach(plant=>{
    const btn = document.createElement("button");
    btn.textContent = `🌱 ${plant.name} (${plant.cost} seeds)`;
    btn.onclick = ()=>plantSeed(plant.name);
    container.appendChild(btn);
  });
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
  const guide = document.getElementById("fieldGuideContent");
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

//debugui
function updateDebugUI(){
  const debugEl = document.getElementById("seedBankList");
  if(!debugEl) return;

  if(state.seedBank.length === 0){
    debugEl.textContent = "[empty]";
    return;
  }

  debugEl.textContent = state.seedBank
    .map(s => `${s.plantName} (planted ${getMonthName(s.plantedMonth)})`)
    .join(", ");
}

// ---------- domcontentloaded? -------

document.addEventListener("DOMContentLoaded", () => {
  const toggleGuideBtn = document.getElementById("toggleGuideBtn");
  const fieldGuide = document.getElementById("fieldGuide");
  const closeX = document.getElementById("closeGuideX");
  const guideContent = document.getElementById("fieldGuideContent");
  const prevPageBtn = document.getElementById("prevPage");
  const nextPageBtn = document.getElementById("nextPage");
  const pageIndicator = document.getElementById("pageIndicator");
  const plantsTab = document.getElementById("plantsTab");
  const pollinatorsTab = document.getElementById("pollinatorsTab");

  // Load saved chapter and page from localStorage, defaults
  let currentChapter = localStorage.getItem("fieldGuideChapter") || "plants";
  let currentPage = parseInt(localStorage.getItem("fieldGuidePage") || "0", 10);
  const entriesPerPage = 3;

  function getChapterEntries() {
    const source = currentChapter === "plants" ? state.discoveredPlants : state.discoveredPollinators;
    return Array.from(source).sort();
  }

  function renderPage() {
    const entries = getChapterEntries();
    guideContent.innerHTML = "";

    if(entries.length === 0){
      guideContent.innerHTML = "<p>No entries discovered yet.</p>";
      pageIndicator.textContent = "Page 0";
      return;
    }

    // Clamp page number
    const totalPages = Math.ceil(entries.length / entriesPerPage);
    if(currentPage >= totalPages) currentPage = totalPages - 1;
    if(currentPage < 0) currentPage = 0;

    const start = currentPage * entriesPerPage;
    const end = start + entriesPerPage;
    const pageEntries = entries.slice(start, end);

    pageEntries.forEach(name => {
      const div = document.createElement("div");
      div.className = "guideEntry";

      if(currentChapter === "plants"){
        const plant = PLANTS.find(p => p.name === name);
        if(!plant) return;
        div.innerHTML = `
          <h3>${plant.name}</h3>
          <p>${plant.blurb}</p>
          <p><strong>Bloom:</strong> ${
            plant.bloomMonths.length === 1
              ? "Blooms in " + getMonthName(plant.bloomMonths[0])
              : "Blooms from " + getMonthName(plant.bloomMonths[0]) + " to " + getMonthName(plant.bloomMonths[plant.bloomMonths.length-1])
          }</p>
          <p><strong>Height:</strong> ${plant.height}</p>
          <p><strong>Spacing:</strong> ${plant.spacing}</p>
          <details>
            <summary>More details</summary>
            <p><strong>Square Ft:</strong> ${plant.squareFeet}</p>
            <p><strong>Cost:</strong> ${plant.cost} seeds</p>
          </details>
        `;
      } else {
        const pol = POLLINATORS.find(p => p.name === name);
        if(!pol) return;
        div.innerHTML = `
          <h3>${pol.name}</h3>
          <p>${pol.blurb}</p>
          <p><strong>Host Plants:</strong> ${pol.hostPlants.join(", ")}</p>
          <p><strong>Food Plants:</strong> ${pol.foodPlants.join(", ")}</p>
        `;
      }

      guideContent.appendChild(div);
    });

    pageIndicator.textContent = `Page ${currentPage + 1} of ${totalPages}`;

    // Save current state
    localStorage.setItem("fieldGuideChapter", currentChapter);
    localStorage.setItem("fieldGuidePage", currentPage);
  }

  // Toggle button
  if(toggleGuideBtn && fieldGuide){
    toggleGuideBtn.addEventListener("click", () => {
      const isHidden = fieldGuide.classList.toggle("hidden");
      toggleGuideBtn.textContent = isHidden ? "📖 Open Field Guide" : "📖 Close Field Guide";
      if(!isHidden) renderPage();
    });
  }

  // X close button
  if(closeX && fieldGuide){
    closeX.addEventListener("click", () => {
      fieldGuide.classList.add("hidden");
      toggleGuideBtn.textContent = "📖 Open Field Guide";
    });
  }

  // Prev / Next page
  if(prevPageBtn){
    prevPageBtn.addEventListener("click", () => {
      if(currentPage > 0){
        currentPage--;
        renderPage();
      }
    });
  }
  if(nextPageBtn){
    nextPageBtn.addEventListener("click", () => {
      const totalPages = Math.ceil(getChapterEntries().length / entriesPerPage);
      if(currentPage < totalPages - 1){
        currentPage++;
        renderPage();
      }
    });
  }

  // Chapter tabs
  if(plantsTab){
    plantsTab.addEventListener("click", () => {
      currentChapter = "plants";
      currentPage = 0;
      renderPage();
    });
  }
  if(pollinatorsTab){
    pollinatorsTab.addEventListener("click", () => {
      currentChapter = "pollinators";
      currentPage = 0;
      renderPage();
    });
  }
});

// end field guide domcontentloaded

document.addEventListener("DOMContentLoaded", () => {


  // ---------- Prestige ----------
  const prestigeBtn = document.getElementById("prestigeBtn");
  if(prestigeBtn){
    prestigeBtn.addEventListener("click", () => {
      if(typeof tryPrestige === "function") tryPrestige(); // from prestige.js
    });
  }

  // ---------- Dark Mode ----------
  const darkToggle = document.getElementById("darkModeToggle");
  if(darkToggle){
    // Apply saved preference
    const savedDark = localStorage.getItem("darkMode") === "1";
    if(savedDark) document.body.classList.add("dark");

    darkToggle.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("dark");
      localStorage.setItem("darkMode", isDark ? "1" : "0");
    });
  }
});

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

document.addEventListener("DOMContentLoaded", () => {
const scatterBtn = document.getElementById("scatterBtn");
if(scatterBtn){
  scatterBtn.addEventListener("click", scatterSeedsDebug);
        }
});
    
  // Initialize game
window.onload = () => {
  // Build shop buttons once
  if (typeof buildPlantShopUI === "function") {
    buildPlantShopUI();
  }

  // Draw UI at game start
  updateUI();

  // Start with one random plant
  plantRandomInitialPlant();

  // Start with one random pollinator (for testing)
  if (POLLINATORS && POLLINATORS.length > 0) {
    const randomPol = POLLINATORS[Math.floor(Math.random() * POLLINATORS.length)];
    addPollinator(randomPol.name);
  }

  // Begin month advancement
  if (typeof startMonthProgression === "function") {
    startMonthProgression(3000); // 3 sec per month (for testing)
  }
};
