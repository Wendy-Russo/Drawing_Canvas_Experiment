class vec {
  constructor(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static floor(){
    return new vec(Math.floor(this.x),Math.floor(this.y),Math.floor(this.z))
  }

  static add(vec1,vec2){
    return new vec(vec1.x+vec2.x,vec1.y+vec2.y,vec1.z+vec2.z)
  }

  static substract(vec1,vec2){
    return new vec(vec1.x-vec2.x,vec1.y-vec2.y,vec1.z-vec2.z)
  }

  static multiply(vec1,factor){
    return new vec(vec1.x*factor,vec1.y*factor,vec1.z*factor)
  }

  static divide(vec1,factor){
    return new vec(vec1.x/factor,vec1.y/factor,vec1.z/factor)
  }

  static round(vec1){
    return new vec(Math.round(vec1.x),Math.round(vec1.y),Math.round(vec1.z))
  }

  static lerp(vec1,vec2,factor){
    const lX = lerp(vec1.x,vec2.x,factor);
    const lY = lerp(vec1.y,vec2.y,factor);
    const lZ = lerp(vec1.z,vec2.z,factor);

    return new vec(lX,lY,lZ)
  }

  static magnitude(vec){
    return Math.sqrt( vec.x*vec.x + vec.y*vec.y + vec.z*vec.z )
  }

  static diff(vec1,vec2){
    return (Math.abs(vec1.x-vec2.x)+Math.abs(vec1.y-vec2.y)+Math.abs(vec1.z-vec2.z))/3
  }

  static distance(vec1,vec2){
    return vec.magnitude(vec.substract(vec2,vec1));
  }
}

/**
 * creates a new plane
 * @property {vec[]} projPoints
 */
class plane {
  constructor(posVec,rotVec,size,color){

    this.posVec = posVec;
    this.size = size;
    this.color = color;
    this.rotVec = rotVec;

    this.worldPoints = [];
    this.worldScale = [];
    this.worldRot = [];
    this.projPoints = [];

    this.everything()
  }



  everything(){
    const left = this.posVec.x - 0.5;
    const right = this.posVec.x + 0.5;
    const down = this.posVec.y - 0.5;
    const up = this.posVec.y + 0.5;

    this.worldPoints = [
      new vec(left  ,down ,this.posVec.z),
      new vec(left  ,up   ,this.posVec.z),
      new vec(right ,up   ,this.posVec.z),
      new vec(right ,down ,this.posVec.z),
    ]

    this.worldScale = [
      vec.multiply(this.worldPoints[0],this.size),
      vec.multiply(this.worldPoints[1],this.size),
      vec.multiply(this.worldPoints[2],this.size),
      vec.multiply(this.worldPoints[3],this.size),
    ]

    this.worldRot = [
      rotate3DPoint(this.worldScale[0],this.rotVec),
      rotate3DPoint(this.worldScale[1],this.rotVec),
      rotate3DPoint(this.worldScale[2],this.rotVec),
      rotate3DPoint(this.worldScale[3],this.rotVec),
    ]

    this.projPoints = [
      new projectTo2D(this.worldRot[0]),
      new projectTo2D(this.worldRot[1]),
      new projectTo2D(this.worldRot[2]),
      new projectTo2D(this.worldRot[3])
    ]
  }
}