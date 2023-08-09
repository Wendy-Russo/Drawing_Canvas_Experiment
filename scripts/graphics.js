let colorsArray = [];
let sedimentArray = [];
let rockArray = [];

class Vector {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  normalized() {
    const mag = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    const surfaceVec = new Vector(
      this.x !== 0 && this.x / mag,
      this.y !== 0 && this.y / mag,
      this.z !== 0 && this.z / mag
    );
    return surfaceVec;
  }

  normalizedFlat() {
    const mag = Math.sqrt(this.x * this.x + this.z * this.z);
    const surfaceVec = new Vector(
      this.x !== 0 && this.x / mag,
      this.y !== 0 && this.y / mag,
      this.z !== 0 && this.z / mag
    );
    return surfaceVec;
  }

  static dot(vector1, vector2) {
    return (
      vector1.x * vector2.x + vector1.y * vector2.y + vector1.z * vector2.z
    );
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
}

function normal(x, y) {
  if (x > 0 && y > 0 && x < 511 && y < 255) {
    const O = arr2D[x][y];

    const R = arr2D[x + 1][y];

    const B = arr2D[x][y + 1];

    let surface = new Vector(-(R - O), -1, -(B - O));

    return surface.normalized();
  }
  return new Vector(0, 0, 0);
}

function tonemap(b, gamma) {
  const GAMMA = Math.pow(b, 1 / gamma);
  return GAMMA / (GAMMA + 1);
}

function calcColors(colorInput,colorOutput){
  for (let i = 0; i < 256; i++) {
    for (let j = 0; j < colorInput.length; j++) {
      let range = colorInput[j];
      if (isInRange(i, range.min.value, range.max.value)) {
        colorOutput[i] = { r: 0, g: 0, b: 0 };
        colorOutput[i].r = remap(
          i,
          range.min.value,
          range.max.value,
          range.min.color[0],
          range.max.color[0]
        );
        colorOutput[i].g = remap(
          i,
          range.min.value,
          range.max.value,
          range.min.color[1],
          range.max.color[1]
        );
        colorOutput[i].b = remap(
          i,
          range.min.value,
          range.max.value,
          range.min.color[2],
          range.max.color[2]
        );
      }
    }
  }
}

calcColors(settings.graphics.sedimentPalette,sedimentArray)
calcColors(settings.graphics.defaultPalette,colorsArray)
calcColors(settings.graphics.rockPalette,rockArray)

function getDiffuse(x,y){

  let lightdir = new Vector(VALUES["sundir"].x,-VALUES["sundir"].y,VALUES["sundir"].z)

  return Math.max(0,Vector.dot(normal(x,y),lightdir)) * VALUES["lightIntensity"]

}

function phong(x,y,shadowAmount = 1,ao = 1,diffuse = 1){

  let ambient = VALUES["ambiantLight"]/100
  let specular = getSpec(x,y)
  
  return ((ambient + ao) * (ambient + ao + diffuse) * (ambient + shadowAmount)) + (shadowAmount * specular) //((a + b) * (a + b + c) * (a + d)) + (d * e)
}

  
function getSpec(x,y){

  let lightdir = new Vector(VALUES["sundir"].x,-VALUES["sundir"].y,VALUES["sundir"].z)
  let n = normal(x,y)
  let dotp = Vector.dot(n,lightdir)

  let rUp = lightdir.y - 2* dotp * n.y

  /*let r = new Vector(lightdir.x - 2* dotp * n.x ,lightdir.y - 2* dotp * n.y ,
    lightdir.z - 2* dotp * n.z )*/

  //return settings.graphics.specularStrength * Math.pow(Math.max(Vector.dot(new Vector(0,1,0), r), 0.0),
  //  settings.graphics.shininess);

  return settings.graphics.specularStrength * Math.pow(Math.max(rUp, 0.0),
    settings.graphics.shininess); 
  
}

function render() {
  console.log("rendering")
  let sunh = VALUES["sundir"].normalizedFlat().y;
  mapmax = 0;
  mapmin = 500;

  let land = 0;
  let water = 0;
  for (let x = 0; x < CANVAS.width; x++) {
    for (let y = 0; y < CANVAS.height; y++) {
      let h = arr2D[x][y];
      land += h;
      if (h > mapmax) {
        mapmax = h;
      }
      if (h < mapmin) {
        mapmin = h;
      }
      h <= settings.graphics.waterLevel && water++;
    }
  }
  //console.log("land : " + Math.round(land/512/256*100)/100)
  //console.log(Math.round(water / (512*256) * 1000) / 10)
  console.log("0")
  for (let x = 0; x < CANVAS.width; x++) {
    for (let y = 0; y < CANVAS.height; y++) {
      let SLOPE = slope(x, y);

      color = arr2D[x][y];

      dot = 1;

      i = (y * CANVAS.width + x) * 4;

      let shadows = 1;
      let AO = 1;
      

      if (mouseDown && SLOPE ) {
        shadows = rotShadowsHard(x, y, sunh);
      }

      if (!mouseDown) {
        shadows = rotShadowsSoft(x, y, VALUES["sunAlpha"], 5);
        AO = getAOBlur(x,y,5)
      }

      AO            = remap(color,123,128,1,AO)
      shadows       = remap(color,123,128,1,shadows)
      let diffuse   = remap(color,123,128,1,getDiffuse(x,y))

      let toned = tonemap(phong(x,y,shadows,AO,diffuse), 2.2);
      let colorInt = Math.round(minMax(color, 0, 255));

      let rgbCol = colorsArray[colorInt]
      let rockCol = rockArray[colorInt]
      let sed = stateArr[x][y].sediment || 0

      if(color > settings.graphics.waterLevel){
        
        let sandAmount = sed / (sed+10)
        sandAmount = Math.max(0,sandAmount)
        let grassCol = sedimentArray[colorInt]
        
        rgbCol = {
          r : lerp(rockCol.r,grassCol.r,sandAmount),
          g : lerp(rockCol.g,grassCol.g,sandAmount),
          b : lerp(rockCol.b,grassCol.b,sandAmount)
        } //247, 217, 166 //[137, 217, 0], // LIGHT GREEN
      }
      

      data1.data[i] = Math.round(rgbCol.r) * toned;
      data1.data[i + 1] = Math.round(rgbCol.g) * toned;
      data1.data[i + 2] = Math.round(rgbCol.b) * toned;
    }
  }
  console.log("1")
  CTX.putImageData(data1,0,0)
}

//LIGHTING FUNCTIONS

function slope(x, y) {
  const O = arr2D[x][y];

  let R = O;
  if (x < 511) {
    R = arr2D[x + 1][y];
  }

  const B = arr2D[x][y + 1];

  return O !== R || O !== B;
}

