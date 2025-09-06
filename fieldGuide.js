// fieldGuide.js

let currentChapter = "plants";
let currentPage = 0;
const ITEMS_PER_PAGE = 3;

// Sort plants and pollinators alphabetically
const sortedPlants = [...PLANTS].sort((a,b)=>a.name.localeCompare(b.name));
const sortedPollinators = [...POLLINATORS].sort((a,b)=>a.name.localeCompare(b.name));

// Month name helper
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function formatMonths(months){
  if(!months || months.length===0) return "";
  if(months.length===1) return MONTH_NAMES[months[0]-1];
  const sorted = months.slice().sort((a,b)=>a-b);
  return `${MONTH_NAMES[sorted[0]-1]} to ${MONTH_NAMES[sorted[sorted.length-1]-1]}`;
}

// Open/Close Guide
function openFieldGuide() {
  document.getElementById("fieldGuide").style.display = "block";
  buildFieldGuide();
}
function closeFieldGuide() {
  document.getElementById("fieldGuide").style.display = "none";
}

// Build guide pages
function buildFieldGuide() {
  const guideContent = document.getElementById("guideContent");
  let entries = currentChapter==="plants" 
    ? sortedPlants.filter(p => state.plants[p.name] > 0)
    : sortedPollinators.filter(p => state.pollinators[p.name] > 0);

  const start = currentPage * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageItems = entries.slice(start, end);

  if(pageItems.length===0){
    guideContent.innerHTML = "<p>No discoveries yet.</p>";
  } else {
    guideContent.innerHTML = pageItems.map(item=>{
      const isPlant = currentChapter==="plants";
      let monthDesc = "";

      if(isPlant){
        // Months, height, spacing lines
        if(item.bloomMonths && item.bloomMonths.length>0){
          const formatted = formatMonths(item.bloomMonths);
          const bloomText = item.bloomMonths.length===1 ? 
            `Blooms in ${formatted}` : `Blooms from ${formatted}`;
          monthDesc = `<p><em>${bloomText}</em></p>`;
        }
        if(item.height) monthDesc += `<p>Height: ${item.height}</p>`;
        if(item.spacing) monthDesc += `<p>Spacing: ${item.spacing}</p>`;
      } else {
        if(item.host) monthDesc += `<p>Requires host: ${item.host}</p>`;
        if(item.food) monthDesc += `<p>Feeds from: ${item.food}</p>`;
        monthDesc += `<p>Biodiversity value: ${POLLINATOR_BIODIVERSITY[item.name]||1} pts.</p>`;
      }

      return `
        <div class="entry">
          <h4>${item.name}</h4>
          <p>${item.blurb}</p>
          ${monthDesc}
          <button class="toggleDetailsBtn" onclick="toggleDetails(this)">Reveal Details</button>
          <div class="details" style="display:none;">
            ${isPlant ? 
              `Cost: ${item.cost}, Sprout: ${formatMonths(item.sproutMonths)}, Seed: ${formatMonths(item.seedMonths)}, Square Feet: ${item.squareFootage || 'N/A'}` :
              `Boost: ${item.boost*100}%, Host: ${item.host||"None"}, Food: ${item.food||"Various"}`
            }
          </div>
        </div>
      `;
    }).join("");
  }

  const totalPages = Math.max(1, Math.ceil(entries.length / ITEMS_PER_PAGE));
  document.getElementById("pageIndicator").textContent = `Page ${currentPage+1} of ${totalPages}`;
}

// Chapter buttons
document.getElementById("plantsTab").addEventListener("click", ()=>{
  currentChapter="plants"; currentPage=0; buildFieldGuide();
});
document.getElementById("pollinatorsTab").addEventListener("click", ()=>{
  currentChapter="pollinators"; currentPage=0; buildFieldGuide();
});

// Page navigation
document.getElementById("prevPage").addEventListener("click", ()=>{
  if(currentPage>0) currentPage--; buildFieldGuide();
});
document.getElementById("nextPage").addEventListener("click", ()=>{
  currentPage++; buildFieldGuide();
});

// Toggle inline details
function toggleDetails(button){
  const detailsDiv = button.nextElementSibling;
  if(detailsDiv.style.display==="none"){
    detailsDiv.style.display="block";
    button.textContent="Hide Details";
  } else {
    detailsDiv.style.display="none";
    button.textContent="Reveal Details";
  }
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

// Hooks for adding new species
function addPlant(name){
  if(!state.plants[name]) state.plants[name]=0;
  state.plants[name]++;
  if(!state.discoveredPlants.has(name)){
    state.discoveredPlants.add(name);
    showDiscoveryPopup(name,"plant");
  }
  buildFieldGuide(); // refresh guide if open
  updateUI();
}

function addPollinator(name){
  if(!state.pollinators[name]) state.pollinators[name]=0;
  state.pollinators[name]++;
  if(!state.discoveredPollinators.has(name)){
    state.discoveredPollinators.add(name);
    showDiscoveryPopup(name,"pollinator");
  }
  buildFieldGuide();
  updateUI();
}
