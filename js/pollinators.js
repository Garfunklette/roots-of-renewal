// ------------------ Pollinators ------------------
const POLLINATORS=[
  {id:'bumblebee',name:'Bumblebee',icon:'🐝',unlock:s=>s.uniquePlants>=2,effect:s=>{s.multiplier*=1.10;s.visits+=1},story:"The buzz of wings breaks the silence."},
  {id:'monarch',name:'Monarch',icon:'🦋',unlock:s=>s.owned.milkweed>0,effect:s=>{s.multiplier*=1.08;s.visits+=1},story:"She drifts like stained glass on the wind."},
  {id:'beetle',name:'Ground Beetle',icon:'🐞',unlock:s=>s.totalPlants>=10,effect:s=>{s.multiplier*=1.05;s.visits+=1},story:"Clumsy, armored, diligent—the beetle burrows."}
];
