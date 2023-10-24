const rotateZ = (vec1,amount) => {
  const rad = degreesToRadians(amount);

  const cosTheta = Math.cos(rad);
  const sinTheta = Math.sin(rad);

  const newX = cosTheta * vec1.x - sinTheta * vec1.y;
  const newY = sinTheta * vec1.x + cosTheta * vec1.y;

  return new vec(
    newX,
    newY,
    vec1.z
  )
}

const rotateX = (vec1,amount) => {
  const rad = degreesToRadians(amount);

  const cosTheta = Math.cos(rad);
  const sinTheta = Math.sin(rad);

  const newY = cosTheta * vec1.y - sinTheta * vec1.z;
  const newZ = sinTheta * vec1.y + cosTheta * vec1.z;

  return new vec(
    vec1.x,
    newY,
    newZ
  )
}

const rotateY = (vec1,amount) => {
  const rad = degreesToRadians(amount);

  const cosTheta = Math.cos(rad);
  const sinTheta = Math.sin(rad);

  const newX = cosTheta * vec1.x + sinTheta * vec1.z;
  const newZ = -sinTheta * vec1.x + cosTheta * vec1.z;

  return new vec(
    newX,
    vec1.y,
    newZ
  )
}

function rotate3DPoint(point, rotVec) {
  let rotX = point;

  rotX = rotateZ(rotX,rotVec.z)
  rotX = rotateY(rotX,rotVec.y)
  rotX = rotateX(rotX,rotVec.x)

  return rotX;
}

function undoRotate3DPoint(point, rotVec) {
  let rotX = point;

  rotX = rotateZ(rotX,-rotVec.z)
  rotX = rotateY(rotX,-rotVec.y)
  rotX = rotateX(rotX,-rotVec.x)

  return rotX;
}

function projectTo2D(point) {
  // Convert x2D and y2D values from the range [-1, 1] to pixel coordinates
  const xPixel = (point.x + 1) * (width / 2);
  // (0 + 1) * 320;
  // 1*320 = 320
  // 1 = 640
  // 
  const yPixel = ((point.y*(width/height)) + 1) * (height / 2);
  //  ((y*(4/3)) + 1) * 240;
  // 0 = 240
  // 1 = 560
  //

  return new vec(xPixel,yPixel,point.z);
}

function projectTo3D(pixelPoint) {
  // Convert pixel coordinates back to the range [-1, 1]
  const x2D = pixelPoint.x / 320 - 1;
  const y2D = (pixelPoint.y / 240 - 1) * 0.75;

  return new vec(x2D, y2D, pixelPoint.z);
}

let screenRef = initData(0,new vec(640,480+1000,0));

for(let x = 0 ; x < 640; x++){
  for(let y = 0 ; y < 480+1000; y++){
    screenRef[x][y] = projectTo3D(new vec(x,y-1000,0))
  }
}


/**
 * Returns a boolean
 * @param {number} x - A variable contains a number
 * @param {number} y - A variable contains a string
 * @param {vec[]} quadVertices - A variable contains a boolean value
 */
function isPointInQuadrilateral(pos, quadVertices) {
  // Check if the point (x, y) is inside the quadrilateral defined by its vertices.
  // You can use a point-in-polygon algorithm for this.
  // This implementation assumes the vertices are in clockwise order.
  const d1 = (pos.x - quadVertices[0].x) * (quadVertices[1].y - quadVertices[0].y) - (pos.y - quadVertices[0].y) * (quadVertices[1].x - quadVertices[0].x);
  const d2 = (pos.x - quadVertices[1].x) * (quadVertices[2].y - quadVertices[1].y) - (pos.y - quadVertices[1].y) * (quadVertices[2].x - quadVertices[1].x);
  const d3 = (pos.x - quadVertices[2].x) * (quadVertices[3].y - quadVertices[2].y) - (pos.y - quadVertices[2].y) * (quadVertices[3].x - quadVertices[2].x);
  const d4 = (pos.x - quadVertices[3].x) * (quadVertices[0].y - quadVertices[3].y) - (pos.y - quadVertices[3].y) * (quadVertices[0].x - quadVertices[3].x);
  return (d1 >= 0 && d2 >= 0 && d3 >= 0 && d4 >= 0) || (d1 <= 0 && d2 <= 0 && d3 <= 0 && d4 <= 0);
}

function drawFilledQuadrilateral(image, quadVertices) {
  
  let minx = Math.min(
    quadVertices[0].x,
    quadVertices[1].x,
    quadVertices[2].x,
    quadVertices[3].x
  );

  let maxx = Math.max(
    quadVertices[0].x,
    quadVertices[1].x,
    quadVertices[2].x,
    quadVertices[3].x
  );

  let miny = Math.min(
    quadVertices[0].y,
    quadVertices[1].y,
    quadVertices[2].y,
    quadVertices[3].y
    );

  let maxy = Math.max(
    quadVertices[0].y,
    quadVertices[1].y,
    quadVertices[2].y,
    quadVertices[3].y
  );
  
  minx = Math.max(Math.floor(minx),0);
  miny = Math.max(Math.floor(miny),-10);
  maxx = Math.min(Math.ceil(maxx),width);
  maxy = Math.min(Math.ceil(maxy),height);

  for (let x = minx; x < maxx; x++) { //let x = Math.max(Math.floor(minx),0); x < Math.min(Math.ceil(maxx),400)
    for (let y = maxy; y > miny; y--) {
        
      if (isPointInQuadrilateral(x, y, quadVertices)) {
        
        let cubePos = rotate3DPoint(projectTo3D(new vec(x,y,0)),new vec(-cubeRot.x,-cubeRot.y,-cubeRot.z))
        cubePos = vec.divide(cubePos,zoom);
        const texturePos  = new vec(Math.round(remap(cubePos.x,-0.5,0.5,0,63)),Math.round(remap(cubePos.y,-0.5,0.5,0,63)),0)

        let wave = Math.sin(Math.sqrt((x - 320) ** 2 + (y - 240) ** 2)/zoom/10)+1;
        wave *= 64
        let color = new vec(wave,wave,wave)   // new vec((cubePos.x+0.5)*255,(cubePos.y+0.5)*255,0)
        
        if (!isPointInQuadrilateral(x, y-1, quadVertices)){
          color = new vec(64,64,64);
        }

        drawVerticalLine(image,x,y,(wave*zoom+0.0001)/255*50,color)

      }
    }
  }
}

function projectToText(screenPos,res,zoom,rotation){


  let to3D  = projectTo3D(screenPos)

  const unRot = undoRotate3DPoint(to3D,rotation)
  const unScale = vec.divide(unRot,zoom);


  return new vec(Math.floor(unScale.x*res),Math.floor(unScale.y*res))
}