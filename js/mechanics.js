// Scatter seeds function
function scatter() {
  state.seeds += 1;
  renderAll();
}

// Render all UI elements
function renderAll() {
  document.getElementById('seeds').textContent = state.seeds;
  document.getElementById('visits').textContent = state.visits;
  document.getElementById('biodiv').textContent = state.biodiversity;
  renderShop();
}

// Render shop items
function renderShop() {
  const shopBody = document.getElementById('shopBody');
  shopBody.innerHTML = '';
  PLANTS.forEach(plant => {
    const button = document.createElement('button');
    button.textContent = `Buy ${plant.name} (${plant.cost} seeds)`;
    button.addEventListener('click', () => buyPlant(plant));
    shopBody.appendChild(button);
  });
}

// Buy plant function
function buyPlant(plant) {
  if (state.seeds >= plant.cost) {
    state.seeds -= plant.cost;
    state.plants.push(plant);
    renderAll();
  } else {
    alert('Not enough seeds!');
  }
}
