"use strict";

const CANVAS = document.getElementById("canvas");
const CTX = CANVAS.getContext("2d");
const data1 = CTX.createImageData(512, 256);
data1.data.fill(255);

const arr2D = createArray2D(CANVAS.width, CANVAS.height, settings.graphics.waterLevel + 1);
const stateArr = createArray2D(CANVAS.width, CANVAS.height, 0);
let erArr = createArray2D(CANVAS.width, CANVAS.height, 0);
let DATA;
let base_image = new Image();
let curPos = 1, prevpos = 0, mapmin = 0;
let waterHeight = 126, mouseDown = false;
let heightbase, maxDist, color, dot, i, toned, arrX, arrY;
let mapmax = 0;


let size = 128;
let points = 16;
let opacity = 1;

for(let i = 0 ; i < 7; i++) {
  for(let j = 0; j < points; j++) {
    let x = Math.floor(Math.random() * 512);
    let y = Math.floor(Math.random() * 256);
    let brightness = Math.random();
    drawCircle(arr2D, x, y, Math.round(size), brightness,opacity);
  }

  opacity *= 0.33;
  size /= 2;
  points *= 2;
}

render();

//Simulate rain


function drawCircle(image, centerX, centerY, radius, b, a = 1) {
  if (radius === 0.5 && image[centerX] && image[centerX][centerY]) {
    image[centerX][centerY] = lerp(image[centerX][centerY], Math.round(b * 255), a);
    image[centerX][centerY + 1] = lerp(image[centerX][centerY + 1], Math.round(b * 255), a);
    if (image[centerX + 1]) {
      image[centerX + 1][centerY + 1] = lerp(image[centerX + 1][centerY + 1], Math.round(b * 255), a);
      image[centerX + 1][centerY] = lerp(image[centerX + 1][centerY], Math.round(b * 255), a);
    }
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

function terrainBlur(xCenter, yCenter, radius, circle = false) {
  let sum = 0, exp = 0;

  for (let x = xCenter - radius; x <= xCenter + radius; x++) {
    for (let y = yCenter - radius; y <= yCenter + radius; y++) {
      if (circle && arr2D[x] && arr2D[x][y] && distance2D(x, y, xCenter, yCenter) < radius) {
        sum += arr2D[x][y];
        exp++;
      } else if (arr2D[x] && arr2D[x][y]) {
        sum += arr2D[x][y];
        exp++;
      }
    }
  }
  return sum / exp;
}
