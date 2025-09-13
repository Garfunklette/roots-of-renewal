// ui.js

// ---------- UI State ----------
const guideState = {
  activeTab: "plants",
  currentPage: 0,
  entriesPerPage: 3
};

// ---------- Helpers ----------
function setText(id, text){
  const el = document.getElementById(id);
  if(el) el.textContent = text;
}

function getMonthName(monthIndex){
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return months[monthIndex] || "Unknown";
}

// ---------- UI Update ----------
function updateUI(){
  // Seeds
  setText("seedCount", state.seeds);

  // Species counts
  const { plantCount, pollinatorCount } = getSpeciesCounts();
  setText("plantSpeciesCount", plantCount);
  setText("pollinatorSpeciesCount", pollinatorCount);

  // Prestige info
  setText("prestigeLevel", state.prestigeLevel);
  setText("globalImpactPoints", state.globalImpactPoints);

  // Current month
  setText("currentMonth", getMonthName(state.currentMonth));

  // Debug Seed Bank
  const seedBankEl = document.getElementById("debugSeedBank");
  if(seedBankEl){
    seedBankEl.innerHTML = state.seedBank.length === 0
      ? "<li>[empty]</li>"
      : state.seedBank.map(s => `<li>${s.plantName} (planted in ${getMonthName(s.plantedMonth)})</li>`).join("");
  }

  // Plants
  const plantsEl = document.getElementById("debugPlants");
  if(plantsEl){
    const names = Object.keys(state.plants);
    plantsEl.innerHTML = names.length === 0
      ? "<li>[none]</li>"
      : names.map(name => `<li>${name}: ${state.plants[name]}</li>`).join("");
  }

  // Pollinators
  const pollEl = document.getElementById("debugPollinators");
  if(pollEl){
    const names = Object.keys(state.pollinators);
    pollEl.innerHTML = names.length === 0
      ? "<li>[none]</li>"
      : names.map(name => `<li>${name}: ${state.pollinators[name]}</li>`).join("");
  }
}

// ---------- Plant Shop ----------
function buildPlantShop(){
  const container = document.getElementById("plantButtons");
  if(!container) return;
  container.innerHTML = "";
  PLANTS.forEach(plant => {
    const btn = document.createElement("button");
    btn.textContent = `🌱 ${plant.name} (${plant.cost} seeds)`;
    btn.onclick = () => plantSeed(plant.name);
    container.appendChild(btn);
  });
}

// ---------- Discovery Popup ----------
function showDiscoveryPopup(name,type){
  let blurb = "";
  if(type==="plant"){
    const plant = PLANTS.find(p=>p.name===name);
    if(plant && plant.blurb) blurb = plant.blurb.split(".")[0]+".";
  } else {
    const pol = POLLINATORS.find(p=>p.name===name);
    if(pol && pol.blurb) blurb = pol.blurb.split(".")[0]+".";
  }

  const popup = document.createElement("div");
  popup.className="discoveryPopup";
  popup.innerHTML = `
    <h3>📖 New Entry Discovered!</h3>
    <p><strong>${name}</strong> (${type==="plant"?"Plant":"Pollinator"})</p>
    <p><em>${blurb}</em></p>
    <button onclick="this.parentElement.remove()">Close</button>
  `;
  document.body.appendChild(popup);
  setTimeout(()=>popup.remove(),6000);
}

// ---------- Field Guide ----------
function buildFieldGuide(tab=guideState.activeTab){
  guideState.activeTab = tab;
  const guide = document.getElementById("fieldGuideContent");
  if(!guide) return;

  const source = tab==="plants" ? state.discoveredPlants : state.discoveredPollinators;
  const entries = Array.from(source).sort();

  if(entries.length===0){
    guide.innerHTML="<p>No entries discovered yet.</p>";
    setText("pageIndicator","Page 0");
    return;
  }

  const start = guideState.currentPage * guideState.entriesPerPage;
  const pageEntries = entries.slice(start, start + guideState.entriesPerPage);

  guide.innerHTML = "";
  pageEntries.forEach(name => {
    let div = document.createElement("div");
    div.className = "guideEntry";

    if(tab==="plants"){
      const plant = PLANTS.find(p=>p.name===name);
      if(!plant) return;
      div.innerHTML = `
        <h3>${plant.name}</h3>
        <p>${plant.blurb}</p>
        <p><strong>Bloom:</strong> ${
          plant.bloomMonths.length===1 ? "Blooms in "+getMonthName(plant.bloomMonths[0])
          : "Blooms from "+getMonthName(plant.bloomMonths[0])+" to "+getMonthName(plant.bloomMonths[plant.bloomMonths.length-1])
        }</p>
        <p><strong>Height:</strong> ${plant.height}</p>
        <p><strong>Spacing:</strong> ${plant.spacing}</p>
        <details>
          <summary>More details</summary>
          <p><strong>Square Ft:</strong> ${plant.squareFootage}</p>
          <p><strong>Cost:</strong> ${plant.cost} seeds</p>
        </details>
      `;
    } else {
      const pol = POLLINATORS.find(p=>p.name===name);
      if(!pol) return;
      div.innerHTML = `
        <h3>${pol.name}</h3>
        <p>${pol.blurb}</p>
        <p><strong>Host Plants:</strong> ${pol.host || "None"}</p>
        <p><strong>Food Plants:</strong> ${pol.food}</p>
      `;
    }

    guide.appendChild(div);
  });

  // Update page indicator
  const totalPages = Math.ceil(entries.length / guideState.entriesPerPage);
  setText("pageIndicator",`Page ${guideState.currentPage+1} of ${totalPages}`);
}

// ---------- DOM Wiring ----------
document.addEventListener("DOMContentLoaded",()=>{

  // ---------- Buttons ----------
  const toggleGuideBtn = document.getElementById("toggleGuideBtn");
  const fieldGuide = document.getElementById("fieldGuide");
  const closeX = document.getElementById("closeGuideX");
  const prevPage = document.getElementById("prevPage");
  const nextPage = document.getElementById("nextPage");
  const plantsTab = document.getElementById("plantsTab");
  const pollinatorsTab = document.getElementById("pollinatorsTab");
  const darkToggle = document.getElementById("darkModeToggle");

  // Toggle Guide
  if(toggleGuideBtn && fieldGuide){
    toggleGuideBtn.addEventListener("click",()=>{
      const hidden = fieldGuide.classList.toggle("hidden");
      toggleGuideBtn.textContent = hidden ? "📖 Open Field Guide" : "📖 Close Field Guide";
      if(!hidden) buildFieldGuide();
    });
  }

  // Close X
  if(closeX && fieldGuide){
    closeX.addEventListener("click",()=>{
      fieldGuide.classList.add("hidden");
      if(toggleGuideBtn) toggleGuideBtn.textContent = "📖 Open Field Guide";
    });
  }

  // Pagination
  if(prevPage) prevPage.addEventListener("click",()=>{
    if(guideState.currentPage>0){ guideState.currentPage--; buildFieldGuide(); }
  });
  if(nextPage) nextPage.addEventListener("click",()=>{
    const source = guideState.activeTab==="plants" ? state.discoveredPlants : state.discoveredPollinators;
    const totalPages = Math.ceil(source.size / guideState.entriesPerPage);
    if(guideState.currentPage<totalPages-1){ guideState.currentPage++; buildFieldGuide(); }
  });

  // Tabs
  if(plantsTab && pollinatorsTab){
    plantsTab.addEventListener("click",()=>{
      guideState.activeTab="plants";
      guideState.currentPage=0;
      plantsTab.classList.add("active");
      pollinatorsTab.classList.remove("active");
      buildFieldGuide("plants");
    });
    pollinatorsTab.addEventListener("click",()=>{
      guideState.activeTab="pollinators";
      guideState.currentPage=0;
      pollinatorsTab.classList.add("active");
      plantsTab.classList.remove("active");
      buildFieldGuide("pollinators");
    });
  }

  // Dark Mode
  if(darkToggle){
    if(localStorage.getItem("darkMode")==="1") document.body.classList.add("dark");
    darkToggle.addEventListener("click",()=>{
      const dark = document.body.classList.toggle("dark");
      localStorage.setItem("darkMode",dark?"1":"0");
    });
  }

  // Initialize Field Guide
  if(plantsTab) plantsTab.classList.add("active");
  buildFieldGuide();

  // Build plant shop
  buildPlantShop();
});
