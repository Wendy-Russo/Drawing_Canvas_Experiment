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
    const mag = this.magnitude();
    return new Vector(this.x / mag, this.y / mag, this.z / mag);
  }

  normalizedFlat() {
    const mag = Math.sqrt(this.x * this.x + this.z * this.z);
    return new Vector(this.x / mag, this.y / mag, this.z / mag);
  }

  static dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
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
    return new Vector(-(R - O), -1, -(B - O)).normalized();
  }
  return new Vector(0, 0, 0);
}

function tonemap(b, gamma) {
  const GAMMA = Math.pow(b, 1 / gamma);
  return GAMMA / (GAMMA + 1);
}

function calcColors(colorInput, colorOutput) {
  for (let i = 0; i < 256; i++) {
    for (let range of colorInput) {
      if (isInRange(i, range.min.value, range.max.value)) {
        colorOutput[i] = {
          r: remap(i, range.min.value, range.max.value, range.min.color[0], range.max.color[0]),
          g: remap(i, range.min.value, range.max.value, range.min.color[1], range.max.color[1]),
          b: remap(i, range.min.value, range.max.value, range.min.color[2], range.max.color[2])
        };
      }
    }
  }
}

calcColors(settings.graphics.sedimentPalette, sedimentArray);
calcColors(settings.graphics.defaultPalette, colorsArray);
calcColors(settings.graphics.rockPalette, rockArray);

function getDiffuse(x, y) {
  const lightdir = new Vector(VALUES["sundir"].x, -VALUES["sundir"].y, VALUES["sundir"].z);
  return Math.max(0, Vector.dot(normal(x, y), lightdir)) * settings.graphics.lightIntensity;
}

function phong(x, y, shadowAmount = 1, ao = 1, diffuse = 1) {
  const ambient = settings.graphics.ambientLight / 100;
  const specular = getSpec(x, y);
  return ((ambient + ao) * (ambient + ao + diffuse) * (ambient + shadowAmount)) + (shadowAmount * specular);
}

function getSpec(x, y) {
  const lightdir = new Vector(VALUES["sundir"].x, -VALUES["sundir"].y, VALUES["sundir"].z);
  const n = normal(x, y);
  const dotp = Vector.dot(n, lightdir);
  const rUp = lightdir.y - 2 * dotp * n.y;
  return settings.graphics.specularStrength * Math.pow(Math.max(rUp, 0.0), settings.graphics.shininess);
}

function render() {
  console.log("rendering");
  const sunh = VALUES["sundir"].normalizedFlat().y;
  mapmax = 0;
  mapmin = 500;
  let land = 0;
  let water = 0;

  for (let x = 0; x < CANVAS.width; x++) {
    for (let y = 0; y < CANVAS.height; y++) {
      const h = arr2D[x][y];
      land += h;
      mapmax = Math.max(mapmax, h);
      mapmin = Math.min(mapmin, h);
      if (h <= settings.graphics.waterLevel) water++;
    }
  }

  console.log("0");
  for (let x = 0; x < CANVAS.width; x++) {
    for (let y = 0; y < CANVAS.height; y++) {
      const SLOPE = slope(x, y);
      const color = arr2D[x][y];
      const i = (y * CANVAS.width + x) * 4;
      let shadows = 1;
      let AO = 1;

      if (mouseDown && SLOPE) {
        shadows = rotShadowsHard(x, y, sunh);
      } else {
        shadows = rotShadowsSoft(x, y, VALUES["sunAlpha"], 10);
        AO = getAOBlur(x, y, 5);
      }

      shadows = remap(color, 120, 128, 1, shadows);
      const diffuse = remap(color, 120, 128, 1, getDiffuse(x, y));
      const toned = tonemap(phong(x, y, shadows, AO, diffuse), 2.2);
      const colorInt = Math.round(minMax(color, 0, 255));
      let rgbCol = colorsArray[colorInt];
      const rockCol = rockArray[colorInt];
      const sed = stateArr[x][y].sediment || 0;

      if (color > settings.graphics.waterLevel) {
        const sandAmount = Math.max(0, sed / (sed + 10));
        const grassCol = sedimentArray[colorInt];
        rgbCol = {
          r: lerp(rockCol.r, grassCol.r, sandAmount),
          g: lerp(rockCol.g, grassCol.g, sandAmount),
          b: lerp(rockCol.b, grassCol.b, sandAmount)
        };
      }

      data1.data[i] = Math.round(rgbCol.r * toned);
      data1.data[i + 1] = Math.round(rgbCol.g * toned);
      data1.data[i + 2] = Math.round(rgbCol.b * toned);
    }
  }

  CTX.putImageData(data1, 0, 0);
}

function slope(x, y) {
  const O = arr2D[x][y];
  const R = x < 511 ? arr2D[x + 1][y] : O;
  const B = arr2D[x][y + 1];
  return O !== R || O !== B;
}

function rotShadowsSoft(x2, y2, angle, soft) {
  heightbase = arr2D[x2][y2];
  if (heightbase == mapmax) return 1;

  let limit = Math.ceil((mapmax - heightbase) / (VALUES["sundir"].normalizedFlat().y * 1));
  limit = Math.min(limit, x2, 512 - x2, y2, 256 - y2);

  let maxAngle = 0;
  for (let i = 0; i < limit; i++) {
    let x3 = Math.round(x2 + VALUES["sunGround"].x * i);
    let y3 = Math.round(y2 + VALUES["sunGround"].z * i);
    let h1 = arr2D[x3][y3];

    if (h1 > heightbase) {
      const HEIGHT = h1 - heightbase;
      const DIST = Math.pow(x2 - x3, 2) + Math.pow(y2 - y3, 2);
      const ANGLE = (HEIGHT * HEIGHT) / DIST;

      if (ANGLE > maxAngle) {
        maxAngle = ANGLE;
      }
    }
  }
  return minMax(1 - ((Math.atan(maxAngle) * 180) / Math.PI - angle) / soft, 0, 1);
}

function rotShadowsHard(x2, y2, angle) {
  heightbase = arr2D[x2][y2];
  if (heightbase == mapmax) return 1;

  let limit = (x2 > 0 && x2 < 511 && y2 > 0 && y2 < 255) ? 2 : 1;

  for (let i = 0; i < limit; i++) {
    let h1 = arr2D[Math.round(x2 + VALUES["sunGround"].x * i)][Math.round(y2 + VALUES["sunGround"].z * i)];
    if (h1 > heightbase && h1 - heightbase >= Math.ceil(i * angle)) {
      return 0;
    }
  }
  return 1;
}

function getAOBlur(xC, yC, dist) {
  let base = arr2D[xC][yC];
  let avg = terrainBlur(xC, yC, dist, true);
  let offset = Math.abs(avg - base);

  return base < avg ? (5 / (offset + 5)) : 1;
}