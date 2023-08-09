"use strict";

const sunAngle = Math.tan((45 / 180) * Math.PI);
const halfSoft = Math.tan((2.5 / 180) * Math.PI) * 4;
const ANGTAN = Math.tan(sunAngle);
const CANVAS = document.getElementById("canvas");
const CTX = CANVAS.getContext("2d");
const data1 = CTX.createImageData(512, 256);
data1.data.fill(255);

const dArray = new Uint8Array(256 * 512).fill(255);
const arr2D = createArray2D(CANVAS.width, CANVAS.height, settings.graphics.waterLevel+1);
const stateArr = createArray2D(CANVAS.width, CANVAS.height, 0);
let erArr = createArray2D(CANVAS.width, CANVAS.height, 0);
let DATA;
let base_image = new Image();
let curPos = 1,
  prevpos = 0,
  mapmin = 0;
let waterHeight = 126;
let mouseDown = false;
let heightbase, maxDist, color, dot, i, toned, arrX, arrY;
let mapmax = 0;

base_image.src = "/scripts/clouds.png";

base_image.addEventListener("load", () => {
  CTX.drawImage(base_image, 0, 0);
  base_image.style.display = "none";

  DATA = CTX.getImageData(0, 0, 512, 256).data;
  
  for(let x = 0 ; x < CANVAS.width; x++){
    //arrX = arr2D[x]
    for(let y = 0 ; y < CANVAS.height; y++){
      let flipx = 512-x
      let flipy = 256-y
      i = (flipy * CANVAS.width + flipx)*4
      let adjusted = remap(DATA[i], 0, 255, -0.5, 1);
      let flat = Math.pow(Math.abs(adjusted), 2);
      
      DATA[i] && (arr2D[x][y] = remap(DATA[i], 0, 255, 124, 255)); 
      //DATA[i] && (arr2D[x][y] = remap(adjusted > 0 ? flat : -flat, -1, 1, 0, 255)); 
    }
  }
    
  render()

});

function onmove(position, event) {
  if (event.target.id === "canvas" && mouseDown && prevpos !== position) {
    
    let radius = parseInt(VALUES["radius"]);
    let color = remap(VALUES["elevation"], -16, 16, 0, 1);
    let opacity = remap(VALUES["opacity"], 0, 100, 0, 1);
    //console.log(typeof(parseInt(VALUES["radius"])))
    //drawCircle(arr2D,position.x,position.y,parseInt(VALUES["radius"]),remap(VALUES["elevation"],-8,8,0,1),remap(VALUES["opacity"],0,100,0,1));
    VALUES.brushMode === "regular" &&
      drawRandom(position.x, position.y, radius, color, opacity);

    if (VALUES.brushMode === "smooth") {
      drawCircleBlur(position.x, position.y, radius, 2);
    } else if (VALUES.brushMode === "supersmooth") {
      drawCircleBlur(position.x, position.y, radius, 8);
    }

    if (VALUES.brushMode === "river") {
      for (let i = 0; i < 100; i++) {
        position &&
          position.x &&
          particleErosion(position.x, position.y, radius,"brush");
      }
      //thermalAll();
    }

    render();

    prevpos = position;

  }
}

onpointermove = (event) => {
  curPos = { x: Math.round(event.offsetX), y: Math.round(event.offsetY) };
  onmove(curPos, event);
};

function drawCircle(image, centerX, centerY, radius, b, a = 1) {
  if (radius === 0.5 && image[centerX] && image[centerX][centerY]) {
    image[centerX][centerY] = lerp(
      image[centerX][centerY],
      Math.round(b * 255),
      a
    );
    image[centerX][centerY + 1] = lerp(
      image[centerX][centerY + 1],
      Math.round(b * 255),
      a
    );
    image[centerX + 1] &&
      image[centerX + 1][centerY + 1] &&
      (image[centerX + 1][centerY + 1] = lerp(
        image[centerX + 1][centerY + 1],
        Math.round(b * 255),
        a
      ));
    image[centerX + 1] &&
      image[centerX + 1][centerY] &&
      (image[centerX + 1][centerY] = lerp(
        image[centerX + 1][centerY],
        Math.round(b * 255),
        a
      ));
  }
  for (let x = centerX - radius; x <= centerX + radius; x++) {
    for (let y = centerY - radius; y <= centerY + radius; y++) {
      if (radius < 2) {
        if (image[x] && image[x][y]) {
          image[x][y] = lerp(image[x][y], Math.round(b * 255), a);
        }
      } else {
        let DIST = distance2D(x, y, centerX, centerY) / radius;
        if (image[x] && image[x][y] && DIST < 1) {
          image[x][y] = lerp(image[x][y], b * 255, (1 - DIST) * a);
        }
      }
    }
  }
}

function drawCircleBlur(centerX, centerY, radius, intensity) {
  let nr = Math.round(radius / 1);
  for (let brushX = centerX - nr; brushX <= centerX + nr; brushX++) {
    for (let y = centerY - nr; y <= centerY + nr; y++) {
      const DIST = distance2D(brushX, y, centerX, centerY) / nr;
      let blur = terrainBlur(brushX, y, intensity, true);
      
      if (arr2D[brushX] && arr2D[brushX][y] && DIST <= 1) {
        if (blur - arr2D[brushX][y] > 1) {
          arr2D[brushX][y]++;
        }
        if (blur - arr2D[brushX][y] < -1) {
          arr2D[brushX][y]--;
        }
      }
    }
  }
}

function rotShadowsSoft(x2, y2, angle, soft) {
  heightbase = arr2D[x2][y2];

  if (heightbase == mapmax) {
    return 1;
  }

  let limit = Math.ceil(
    (mapmax - heightbase) / (VALUES["sundir"].normalizedFlat().y * 1)
  );

  if (VALUES["sunGround"].x < 0 && x2 < limit) {
    limit = x2;
  } else if (VALUES["sunGround"].x > 0 && 512 - x2 < limit) {
    limit = 512 - x2;
  }
  if (VALUES["sunGround"].z < 0 && y2 < limit) {
    limit = y2;
  } else if (VALUES["sunGround"].z > 0 && 256 - y2 < limit) {
    limit = 256 - y2;
  }
  let h1,
    x3,
    y3,
    maxAngle = 0;
  for (let i = 0; i < limit; i++) {
    x3 = Math.round(x2 + VALUES["sunGround"].x * i);
    y3 = Math.round(y2 + VALUES["sunGround"].z * i);
    h1 = arr2D[x3][y3];

    if (h1 > heightbase) {
      const HEIGHT = h1 - heightbase;
      const DIST = Math.pow(x2 - x3, 2) + Math.pow(y2 - y3, 2);
      const ANGLE = (HEIGHT * HEIGHT) / DIST;

      if (ANGLE > maxAngle) {
        maxAngle = ANGLE;
      }
    }
  }
  let unmappedShadows = minMax(1 - ((Math.atan(maxAngle) * 180) / Math.PI - angle) / soft,0,1);
  return unmappedShadows;
}

function rotShadowsHard(x2, y2, angle) {
  heightbase = arr2D[x2][y2];

  if (heightbase == mapmax) {
    return 1;
  }
  let limit = 1;
  let h1;
  if (x2 > 0 && x2 < 511 && y2 > 0 && y2 < 255) {
    limit = 2;
  }

  for (let i = 0; i < limit; i++) {
    if (i > limit) {
      return 1;
    }

    h1 =
      arr2D[Math.round(x2 + VALUES["sunGround"].x * i)][
        Math.round(y2 + VALUES["sunGround"].z * i)
      ];

    if (h1 > heightbase && h1 - heightbase >= Math.ceil(i * angle)) {
      return 0;
    }
  }

  return 1;
}

function getAOBlur(xC, yC, dist) {
  let base = (arr2D[xC][yC]);

  let avg = terrainBlur(xC, yC, dist, true);

  let offset = Math.abs(avg - base);

  if (base < avg) {
    return(5 / (offset + 5));
  }
  return 1;
}

function drawRandom(x, y, radius, color, opacity) {
  let nr = radius / 2;
  for (let i = 0; i < 3; i++) {
    let cX = Math.round(remap(Math.random(), 0, 1, x - nr * 0.5, x + nr * 0.5));
    let cY = Math.round(remap(Math.random(), 0, 1, y - nr * 0.5, y + nr * 0.5));
    let rR = Math.round(Math.random() * nr);
    let rB = color; // Math.round(remap(Math.random(),0,1,color-0.1,color+0.1));
    drawCircle(arr2D, cX, cY, rR, rB, opacity);
  }
}

function terrainBlur(xCenter, yCenter, radius, circle = false) {
  let sum = 0;
  let exp = 0;

  for (let x = xCenter - radius; x <= xCenter + radius; x++) {
    for (let y = yCenter - radius; y <= yCenter + radius; y++) {
      if (circle) {
        if (
          arr2D[x] &&
          arr2D[x][y] &&
          distance2D(x, y, xCenter, yCenter) < radius
        ) {
          sum += arr2D[x][y];
          exp++;
        }
      } else {
        if (arr2D[x] && arr2D[x][y]) {
          sum += arr2D[x][y];
          exp++;
        }
      }
    }
  }

  return sum / exp;
}
