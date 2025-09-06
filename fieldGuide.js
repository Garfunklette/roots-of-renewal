// fieldGuide.js

let currentChapter = "plants";
let currentPage = 0;
const ITEMS_PER_PAGE = 3;

// Sort plants and pollinators alphabetically
const sortedPlants = [...PLANTS].sort((a,b)=>a.name.localeCompare(b.name));
const sortedPollinators = [...POLLINATORS].sort((a,b)=>a.name.localeCompare(b.name));

// Open the Field Guide modal
function openFieldGuide() {
  const guide = document.getElementById("fieldGuide");
  guide.style.display = "block";
  buildFieldGuide();
}

// Close the Field Guide
function closeFieldGuide() {
  const guide = document.getElementById("fieldGuide");
  guide.style.display = "none";
}

// Build pages based on current chapter
function buildFieldGuide() {
  const guideContent = document.getElementById("guideContent");
  let entries = [];

  if(currentChapter === "plants") {
    entries = sortedPlants.filter(p => state.plants[p.name] > 0);
  } else {
    entries = sortedPollinators.filter(p => state.pollinators[p.name] > 0);
  }

  const start = currentPage * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageItems = entries.slice(start, end);

  if(pageItems.length === 0) {
    guideContent.innerHTML = "<p>No discoveries yet.</p>";
  } else {
    guideContent.innerHTML = pageItems.map(item=>{
      const isPlant = currentChapter==="plants";
      let extraInfo = "";

      if(isPlant){
        extraInfo += `<p><em>Bloom months:</em> ${item.bloomMonths.join(", ")}.</p>`;
        if(item.hostFor.length>0) extraInfo += `<p>Host for: ${item.hostFor.join(", ")}</p>`;
        if(item.foodFor.length>0) extraInfo += `<p>Food source for: ${item.foodFor.join(", ")}</p>`;
        extraInfo += `<p>Contributes ~${item.squareFootage} ft² per plant.</p>`;
      } else {
        if(item.host) extraInfo += `<p>Requires host: ${item.host}</p>`;
        if(item.food) extraInfo += `<p>Feeds from: ${item.food}</p>`;
        extraInfo += `<p>Biodiversity value: ${POLLINATOR_BIODIVERSITY[item.name]||1} pts.</p>`;
      }

      return `
        <div class="entry">
          <h4>${item.name}</h4>
          <p>${item.blurb}</p>
          ${extraInfo}
          <button onclick="revealStats('${item.name}','${isPlant ? 'plant':'pollinator'}')">Reveal Details</button>
        </div>
      `;
    }).join("");
  }

  document.getElementById("pageIndicator").textContent = `Page ${currentPage+1} of ${Math.max(1, Math.ceil(entries.length/ITEMS_PER_PAGE))}`;
}

// Chapter buttons
document.getElementById("plantsTab").addEventListener("click",()=>{
  currentChapter="plants"; currentPage=0; buildFieldGuide();
});
document.getElementById("pollinatorsTab").addEventListener("click",()=>{
  currentChapter="pollinators"; currentPage=0; buildFieldGuide();
});

// Navigation arrows
document.getElementById("prevPage").addEventListener("click",()=>{
  if(currentPage>0) currentPage--; buildFieldGuide();
});
document.getElementById("nextPage").addEventListener("click",()=>{
  currentPage++; buildFieldGuide();
});

// Reveal backend stats
function revealStats(name,type){
  if(type==="plant"){
    const plant = PLANTS.find(p=>p.name===name);
    alert(`${name} → Cost: ${plant.cost}, Growth Rate: ${plant.rate || 'N/A'}, Sprout: ${plant.sproutMonths.join(", ")}, Seed: ${plant.seedMonths.join(", ")}`);
  } else {
    const pol = POLLINATORS.find(p=>p.name===name);
    alert(`${name} → Boost: ${pol.boost*100}%, Host: ${pol.host||"None"}, Food: ${pol.food||"Various"}`);
  }
}

// Discovery popup with blurb snippet
function showDiscoveryPopup(name, type) {
  let blurb = "";
  if(type==="plant"){
    const plant = PLANTS.find(p=>p.name===name);
    if(plant && plant.blurb) blurb = plant.blurb.split(".")[0]+".";
  } else {
    const pol = POLLINATORS.find(p=>p.name===name);
    if(pol && pol.blurb) blurb = pol.blurb.split(".")[0]+".";
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

  setTimeout(()=>popup.remove(),6000);
}

// Hook discovery popups to first plant/pollinator addition
function addPlant(name){
  if(!state.plants[name]) state.plants[name]=0;
  state.plants[name]++;
  if(!state.discoveredPlants.has(name)){
    state.discoveredPlants.add(name);
    showDiscoveryPopup(name,"plant");
  }
}

function addPollinator(name){
  if(!state.pollinators[name]) state.pollinators[name]=0;
  state.pollinators[name]++;
  if(!state.discoveredPollinators.has(name)){
    state.discoveredPollinators.add(name);
    showDiscoveryPopup(name,"pollinator");
  }
        }
