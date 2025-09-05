// ------------------ Phaser ------------------
class FieldScene extends Phaser.Scene{
  constructor(){super({key:'FieldScene'});}
  create(){
    this.plantGroup=this.add.group();
    this.pollGroup=this.add.group();
    this.updatePlantsFromState();
  }
  spawnPlantInstance(p){
    const w=this.scale.width,h=this.scale.height;
    const x=Phaser.Math.Between(Math.floor(w*0.08),Math.floor(w*0.92));
    const y=Phaser.Math.Between(Math.floor(h*0.10),Math.floor(h*0.88));
    const t=this.add.text(x,y,p.icon,{fontSize:`${16+(PLANTS.indexOf(p)%6)*3}px`}).setDepth(2).setScale(0).setAlpha(0);
    this.tweens.add({targets:t,scale:1,alpha:1,duration:600,ease:'Back.easeOut'});
    this.plantGroup.add(t);
  }
  updatePlantsFromState(){
    this.plantGroup.clear(true,true);
    for(const p of PLANTS){for(let i=0;i<(state.owned[p.id]||0);i++) this.spawnPlantInstance(p);}
  }
}

function createPhaser(){
  const w=Math.max(360,Math.min(window.innerWidth-24,540));
  const h=Math.floor(window.innerHeight*0.46);
  phaserGame = new Phaser.Game({
    type: Phaser.AUTO,
    parent:'phaserContainer',
    width:w,
    height:h,
    scene:[FieldScene],
    scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
    backgroundColor:0xeef8ee
  });
}

window.addEventListener('load',()=>{
  createPhaser();
  renderAll();
});

window.addEventListener('resize',()=>{
  if(phaserGame){phaserGame.scale.resize(Math.max(360,Math.min(window.innerWidth-24,540)),Math.floor(window.innerHeight*0.46));}
});
