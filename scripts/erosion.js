class Drop {
  constructor(pos) {
    this.pos = pos;
    this.speed = new Vector(0, 0, 0);
    this.volume = settings.erosion.volume;
    this.sediment = settings.erosion.sediment;
    this.friction = settings.erosion.friction;
    this.density = settings.erosion.density;
    this.cdiff = 0;
    this.depositionRate = settings.erosion.depositionRate;
    this.evapRate = settings.erosion.evapRate;
    this.updateParticlePos();
    this.isAlive = true;
    console.log("eroding");
  }

  updateParticlePos() {
    this.particlePos = this.pos;
    this.roundposX = Math.round(this.particlePos.x);
    this.roundposZ = Math.round(this.particlePos.z);
  }

  move() {
    this.checkBreak();
    this.updateParticlePos();

    let n = normal(this.roundposX, this.roundposZ);
    let speedDis = this.volume * this.density;
    this.speed = new Vector(
      (this.speed.x + n.x / speedDis) * (1 - this.friction),
      0,
      (this.speed.z + n.z / speedDis) * (1 - this.friction)
    );
    this.pos = new Vector(this.pos.x + this.speed.x, 0, this.pos.z + this.speed.z);
  }

  calculateErosion() {
    this.checkBreak();
    if (this.isAlive) {
      let c_eq = this.volume * this.speed.magnitude() * (arr2D[this.roundposX][this.roundposZ] - arr2D[Math.round(this.pos.x)][Math.round(this.pos.z)]);
      this.cdiff = Math.max(0, c_eq - this.sediment);
    }
  }

  transferMass() {
    this.checkBreak();
    this.sediment += this.depositionRate * this.cdiff;
    let terrainOffset = this.volume * this.depositionRate * this.cdiff;
    arr2D[this.roundposX][this.roundposZ] -= terrainOffset;
    this.volume *= 1.0 - this.evapRate;

    if (!stateArr[this.roundposX][this.roundposZ].sediment) {
      stateArr[this.roundposX][this.roundposZ] = { sediment: 0 };
    }
    stateArr[this.roundposX][this.roundposZ].sediment += terrainOffset + this.sediment;
  }

  checkBreak() {
    if (
      this.volume < settings.erosion.minWaterVolume ||
      !isInRange(this.pos.x, 2, 510) ||
      !isInRange(this.pos.z, 2, 255) ||
      !isInRange(this.particlePos.x, 2, 510) ||
      !isInRange(this.particlePos.z, 2, 255)
    ) {
      this.isAlive = false;
    }
  }
}

function particleErosion(px, py, particleRadius, mode) {
  let ranX = -5, ranY = -1;

  if (mode === "brush") {
    ranX = remap(Math.random(), 0, 1, px - particleRadius, px + particleRadius);
    ranY = remap(Math.random(), 0, 1, py - particleRadius, py + particleRadius);
  } else {
    while (
      !arr2D[Math.round(ranX)] ||
      !arr2D[Math.round(ranX)][Math.round(ranY)] ||
      arr2D[Math.round(ranX)][Math.round(ranY)] < 127
    ) {
      ranX = remap(Math.random(), 0, 1, 1, 511);
      ranY = remap(Math.random(), 0, 1, 1, 255);
    }
  }

  let theDrop = new Drop(new Vector(ranX, 1, ranY));

  for (let i = 0; i < settings.erosion.maxDropLifespan; i++) {
    if (!theDrop.isAlive) break;
    theDrop.move();
    if (!theDrop.isAlive) break;
    theDrop.calculateErosion();
    if (!theDrop.isAlive) break;
    theDrop.transferMass();
  }
}
