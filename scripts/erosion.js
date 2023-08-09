class Drop {
  constructor(pos) {
    this.pos = pos;
    this.speed = new Vector(0,0,0)
    this.volume = settings.erosion.volume;
    this.sediment  = settings.erosion.sediment;
    this.friction = settings.erosion.friction;
    this.density = settings.erosion.density
    this.cdiff = 0;
    this.depositionRate = settings.erosion.depositionRate;
    this.evapRate = settings.erosion.evapRate;
    this.particlePos = this.pos;
    this.roundposX = Math.round(this.particlePos.x);
    this.roundposZ = Math.round(this.particlePos.z);
    this.isAlive = true;
    console.log("eroding")
  }

  move(){
    this.checkBreak()
    this.particlePos = this.pos;
    this.roundposX = Math.round(this.particlePos.x);
    this.roundposZ = Math.round(this.particlePos.z);

    let n = normal(this.roundposX, this.roundposZ);
    let speedDis = this.volume * this.density;
    this.speed = new Vector((this.speed.x + (n.x / speedDis))* (1-this.friction),0,(this.speed.z + (n.z / speedDis))* (1-this.friction));
    this.pos = new Vector(this.pos.x + this.speed.x,0,this.pos.z + this.speed.z);
  }

  calculateErosion(){
    this.checkBreak()
    if(this.isAlive){
      let c_eq =this.volume *this.speed.magnitude()*(arr2D[this.roundposX][this.roundposZ] -arr2D[Math.round(this.pos.x)][Math.round(this.pos.z)]);
      if (c_eq < 0.0) {c_eq = 0.0}
      this.cdiff = c_eq - this.sediment;
    }
  }

  transferMass(){
    this.checkBreak()
    this.sediment += this.depositionRate * this.cdiff;
    let terrainOffset = this.volume * this.depositionRate * this.cdiff;
    arr2D[this.roundposX][this.roundposZ] -= terrainOffset
    this.volume *= 1.0 - this.evapRate;
    

    if(stateArr[this.roundposX][this.roundposZ].sediment === undefined){
      stateArr[this.roundposX][this.roundposZ] = {}
      stateArr[this.roundposX][this.roundposZ].sediment = 0
    }
    stateArr[this.roundposX][this.roundposZ].sediment += (terrainOffset+this.sediment)
  } 

  checkBreak(){
    if(this.volume < settings.erosion.minWaterVolume || 
      !isInRange(this.pos.x, 2, 510) ||
      !isInRange(this.pos.z, 2, 255) || 
      !isInRange(this.particlePos.x, 2, 510) ||
      !isInRange(this.particlePos.z, 2, 255) ){
        this.isAlive = false;
      }
  }
}

function particleErosion(px, py, particleRadius,mode) {
  let ranX = -5,ranY = -1;

  if(mode === "brush"){
    //  Brush Mode
    ranX = remap(Math.random(),0,1,px-particleRadius,px+particleRadius)
    ranY = remap(Math.random(),0,1,py-particleRadius,py+particleRadius)
  }
  else{
    //  Whole Map 
    while(!arr2D[Math.round(ranX)] ||
      !arr2D[Math.round(ranX)][Math.round(ranY)] ||
      (arr2D[Math.round(ranX)][Math.round(ranY)] < 127)){

        ranX = remap(Math.random(),0,1,1,511)
        ranY = remap(Math.random(),0,1,1,255)
    }
  }

  let theDrop = new Drop(new Vector(ranX, 1, ranY));

  for (i = 0; i < settings.erosion.maxDropLifespan; i++) {
    if(theDrop.isAlive){  // speed uses mass and slope (keep them floats)
      theDrop.move()
    }
    else{
      break
    }
    if(theDrop.isAlive){  //calculate deposition rate
      theDrop.calculateErosion()
    }
    else{
      break
    }
    if(theDrop.isAlive){  // transfer the mass in and out of arrays
      theDrop.transferMass()
    }
    else{
      break
    }
  }
}