
function terrainMed(xCenter, yCenter, radius) {
  let v = [];

  for (let x = xCenter - radius; x < xCenter + radius; x++) {
    for (let y = yCenter - radius; y < yCenter + radius; y++) {
      if (arr2D[x] && arr2D[x][y]) {
        v.push(arr2D[x][y]);
      }
    }
  }

  return median(v);
}
let previousslope = 0;
function nextRiverPoint(xCenter, yCenter) {
  let normals = normal(
    Math.round(xCenter),
    Math.round(yCenter)
  ).normalizedFlat();

  if (normals.x === 0 && normals.z === 0) {
    let offX = Math.random() * 2 - 1;
    let offY = Math.random() * 2 - 1;
    previousslope = [offX, offY];

    return [xCenter + offX, yCenter + offY];
  }
  let offX = normals.x;
  let offY = normals.z;

  let previousslope = [offX, offY];
  return [xCenter + offX, yCenter + offY];
  //return [riverx, rivery];
}

function drawRiver() {
  console.log("drawing a river");
  let floatX = Math.random() * 511;
  let floatY = Math.random() * 255;
  let randX = Math.round(floatX);
  let randY = Math.round(floatY);

  let theDrop = new Drop(new Vector(floatX, 1, floatY));

  let riverpoint = [randX, randY];

  let points = [];
  let lengthLimit = 1000;

  for (let aaa = 0; aaa < lengthLimit; aaa++) {
    if (arr2D[(riverpoint[0], riverpoint[1])] === mapmin) {
      //console.log("breaking out of sim, water reached minimum")
      break;
    }
    let temp = nextRiverPoint(riverpoint[0], riverpoint[1]);
    points[aaa] = { x: riverpoint[0], y: riverpoint[1] };
    riverpoint = temp;
  }

  size = Math.random() > 0.75 ? 1 : 0.5;

  let sediment = 0;

  for (let pointID = 0; pointID < points.length - 1; pointID++) {
    let currentPoint = points[pointID];
    let nextPoint = points[pointID + 1];

    if (nextPoint.x > 0 && nextPoint.x < 512) {
      let currentHeight =
        arr2D[Math.round(currentPoint.x)][Math.round(currentPoint.y)];
      let nextHeight = arr2D[Math.round(nextPoint.x)][Math.round(nextPoint.y)];

      let diff = currentHeight - nextHeight;

      if (sediment > 20) {
        diff = -1;
      } else if (nextHeight > currentHeight && sediment < 1) {
        console.log(4);
        break;
      }

      diff = Math.round(diff);

      if (sediment + diff >= 0) {
        sediment += diff;
        drawCircle(
          arr2D,
          Math.round(currentPoint.x),
          Math.round(currentPoint.y),
          size,
          Math.max(0, (currentHeight - diff) / 255)
        );
      }
    }
  }
  thermalAll();
}

function thermalAll() {
  for (let x = 0; x < CANVAS.width; x++) {
    for (let y = 0; y < CANVAS.height; y++) {
      thermalErosion(x, y);
    }
  }
}
function thermalErosion(xCenter, yCenter) {
  if (xCenter > 1 && yCenter > 1 && xCenter < 511 && yCenter < 255) {
    let limit = 1;

    for (let x = xCenter - 1; x <= xCenter + 1; x++) {
      for (let y = yCenter - 1; y <= yCenter + 1; y++) {
        let hc = arr2D[xCenter][yCenter];
        limit = 8;
        if (x !== xCenter && y !== yCenter) {
          limit *= 1.5;
        }
        if (hc - arr2D[x][y] > limit) {
          if (Math.random() > Math.random()) {
            continue;
          }
          arr2D[xCenter][yCenter]--;
          arr2D[x][y]++;
        }
  }
  }
  if(arr2D[x+margin] && arr2D[x+margin][y+margin]){ // right BOT
    sum += arr2D[x+margin][y+margin]
    exp ++;
      }
  if(arr2D[x+margin] && arr2D[x+margin][y+margin]){ // right BOT
    sum += arr2D[x+margin][y+margin]
    exp ++;
    }
  }
}

/*
let friction = 0.5;
let density = 3;
let depositionRate = 0.05;
let evapRate = 0.04;

function particleErosion(px,py,particleRadius){
  particleRadius *= 0.25;
  let ranX = remap(Math.random(),0,1,px-particleRadius,px+particleRadius)
  let ranY = remap(Math.random(),0,1,py-particleRadius,py+particleRadius)
  let particlePos = new Vector(ranX,1,ranY)
  let theDrop = new Drop(particlePos)

  for(i = 0 ; i < 100 ; i++){

    particlePos = theDrop.pos
    let roundposX = Math.round(particlePos.x)
    let roundposZ = Math.round(particlePos.z)

    if(!isInRange(particlePos.x,2,510) || !isInRange(particlePos.z,2,255) || theDrop.volume < 0.1){
      console.log("quit")
      break;
    }
    
    let n = normal(roundposX,roundposZ)
    let speedDis = theDrop.volume * density

    theDrop.speed = new Vector((theDrop.speed.x + (n.x / speedDis))* (1-friction),0,(theDrop.speed.z + (n.z / speedDis))* (1-friction));
    theDrop.pos   = new Vector(theDrop.pos.x + theDrop.speed.x,0,theDrop.pos.z + theDrop.speed.z) ;

    if(!isInRange(theDrop.pos.x,2,510) || !isInRange(theDrop.pos.z,2,255) || theDrop.volume < 0.1){
      break;
    }

    //Compute Equilibrium Sediment Content
    let c_eq =theDrop.volume*theDrop.speed.magnitude()*(arr2D[roundposX][roundposZ]-arr2D[Math.round(theDrop.pos.x)][Math.round(theDrop.pos.z)]);

    if(c_eq < 0.0){ c_eq = 0.0};

    //Compute Capacity Difference ("Driving Force")
    let cdiff = c_eq - theDrop.sediment;

    //Perform the Mass Transfer!
    theDrop.sediment += depositionRate*cdiff;
    arr2D[roundposX][roundposZ] -= theDrop.volume*depositionRate*cdiff;
    theDrop.volume *= (1.0-evapRate);
  }
  
}
*/

