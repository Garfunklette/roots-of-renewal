// ------------------ Mechanics ------------------

// Scatter seeds
function scatter(){ state.seeds++; renderResources(); saveThrottled(); }

// Seeds per second including environment
function seedsPerSecond(){
  let base=0;
  for(const p of PLANTS) base += (state.owned[p.id]||0) * p.sps;
  const env = 1 + state.biodiversity*0.05 + state.visits*0.02;
  return base * state.multiplier * env;
}

// Auto convert seeds -> plants
function growSeedsToPlants(){
  const scene = phaserGame.scene.keys['FieldScene'];
  if(!scene) return;
  const available = Math.max(state.maxPlantSlots - state.totalPlants,0);
  if(available <= 0) return;
  const baseSprout = Math.min(state.seeds, available);
  const envMultiplier = 1 + state.biodiversity*0.1 + state.visits*0.02;
  const sproutCount = Math.floor(baseSprout * 0.1 * envMultiplier);
  if(sproutCount <= 0) return;
  for(let i=0;i<sproutCount;i++){
    const pool = PLANTS.filter(p => state.owned[p.id]<5);
    if(pool.length===0) break;
    const p = pool[Phaser.Math.Between(0,pool.length-1)];
    state.owned[p.id]=(state.owned[p.id]||0)+1;
    state.totalPlants++;
    state.seeds--;
    if(!state.unlockedStories[p.id]) state.unlockedStories[p.id]=true;
    scene.spawnPlantInstance(p);
  }
  renderResources(); renderShop(); renderJournal();
  tryUnlockPollinators(); checkPrestigeAvailability(); saveThrottled();
}

// Buy plant manually
function buyPlant(p){
  if(state.seeds<p.cost) return;
  state.seeds -= p.cost;
  state.owned[p.id]=(state.owned[p.id]||0)+1;
  state.totalPlants++;
  if(!state.unlockedStories[p.id]) state.unlockedStories[p.id]=true;
  const scene=phaserGame.scene.keys['FieldScene'];
  if(scene) scene.spawnPlantInstance(p);
  renderResources(); renderShop(); renderJournal();
  tryUnlockPollinators(); checkPrestigeAvailability(); saveThrottled();
}

// Prestige system
function prestige(){
  if(Object.values(state.owned).filter(v=>v>0).length<10) return;
  state.biodiversity += 1;
  state.multiplier *= 1.1;
  state=defaultState();
  state.biodiversity += 1;
  const scene=phaserGame.scene.keys['FieldScene'];
  if(scene) scene.updatePlantsFromState();
  renderAll();
  save();
}

// Tick intervals
setInterval(()=>{state.seeds += seedsPerSecond()*0.25; renderResources();},250);
setInterval(growSeedsToPlants,1000);
