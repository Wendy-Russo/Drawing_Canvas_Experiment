function drawVerticalLine(image, x, y,length, color) {
  for (let i = 0; i < length; i++) {
    
    image[x][y + i] = color;
    
  }
}

function display(chosenData){

  const imgData = context.createImageData(width,height);
  imgData.data.fill(255);

  for(let x = 0 ; x < width; x++){

    for(let y = 0 ; y < height; y++){

      let i = ((480-y) * width + x) * 4;
      let color = chosenData[x][y];
      imgData.data[i]   = color.x;
      imgData.data[i+1] = color.y;
      imgData.data[i+2] = color.z;
    }
  }

  context.putImageData(imgData,0,0);
}

function initData(valueToInit = 255,dimentions){

  const DATA = []
  for(let x = 0 ; x < dimentions.x; x++){

    DATA[x] = []
    for(let y = 0 ; y < dimentions.y; y++){

      DATA[x][y] = valueToInit;
    }
  }
  return DATA;
}

function drawCircle(image, position, radius, color, userOpacity) {


  for (let pixelX = position.x - radius; pixelX <= position.x + radius; pixelX++) {
    for (let pixelY = position.y - radius; pixelY <= position.y + radius; pixelY++) {
      
      if(image[pixelX]){
        const distance = Math.sqrt((pixelX - position.x) ** 2 + (pixelY - position.y) ** 2);
        if (distance <= radius) {

          const opacity = (1 - distance / radius)*userOpacity ;
          const existingCol = image[pixelX][pixelY];
          const newCol = existingCol + (color - existingCol) * opacity;
          image[pixelX][pixelY] = newCol; // Red

        }
      }
    }
  }
}
/*
function upscale(image){
  for(let x = 1 ; x < width-1; x+=2){
    for(let y = 0 ; y < height; y++){
      const C1 = image[x-1][y];
      const C2 = image[x+1][y];

      if(C1 === new vec(64,64,64)){
        image[x][y] = C1
      }
      else if(C2 === new vec(64,64,64)){
        image[x][y] = C2
      }
      else{
        image[x][y] = vec.lerp(C1,C2,0.5)
      }

    }
  }
}

function drawSquare(image,pos,size,col){
  let half = size/2
  for(let i = -half ; i < half; i++){
    drawVerticalLine(image,pos.x+i,pos.y,0,size,col)
  }
}*/
/*
function toScreenSpace(position,rotation,zoom){
  let def = position;
  const scaled = vec.multiply(def,zoom);
  const rotated = rotate3DPoint(scaled,rotation);
  const projected = projectTo2D(rotated);

  return projected;
}*/

/*
function simpleDrawPolygon(image,polygon){

  for(let x = 0 ; x < image.length; x++){
    for(let y = 0 ; y < image[0].length; y++){

      const screenPos = new vec(x,y,0);
      const worldRSPos = projectTo3D(screenPos);

      if(isPointInQuadrilateral(screenPos,polygon)){
        //01 12 23 30 02 13

        //12 23 puts black left or bottom
        const yLeft = remap(y,polygon[0].y,polygon[1].y,0,1);
        const yRight = remap(y,polygon[3].y,polygon[2].y,0,1);
        const xBot = remap(x,polygon[0].x,polygon[3].x,0,1);
        const xTop = remap(x,polygon[1].x,polygon[2].x,0,1);

        const xDiag = remap(x,polygon[1].x,polygon[3].x,0,1);

        const xa = lerp(yLeft,yRight,xBot)*255

        image[screenPos.x][screenPos.y] = new vec(xDiag,xDiag,xDiag)
      }
    } 
  }
}*/

function updateView(){
  const mg = initData(new vec(64,64,64),screenDim);
  const pln =  new plane(new vec(0,0,0), cubeRot,zoom)


  //point.x = (1 / 320)-1


  /*let res = 512;
  let px = -0.5;
  let space = 1/(res-1);
  let py = -0.5;

  //let distX = ((space*zoom+1)*320)-(320)
  let perfectDistance = (321/320-1)/zoom;
  let perfRes = Math.round(1/perfectDistance)+1;


  const rres = res < perfRes ? res : perfRes;
  const rdist = res < perfRes ? space : perfectDistance;
  
  for(let x = 0 ; x < rres; x++){
    let column = []

    for(let y = 0 ; y < rres; y++){

      let ssX = x*rdist;
      let ssY = y*rdist;

      const my = new vec(px+ssX,py+ssY,0);
      const coords = toScreenSpace(my,cubeRot,zoom)
      
      if(coords.x > 0 && coords.y > 0 && coords.x < 640 && coords.y < 480){
        
        const rawHeight = elevation[Math.floor(x/rres*512)][Math.floor(y/rres*512)]
        const height = rawHeight*zoom*0.2
        const color = new vec(rawHeight,rawHeight,rawHeight);
        column.push({x:Math.round(coords.x),y:Math.round(coords.y),end:height, color : color })
        //drawVerticalLine(mg,Math.round(coords.x),Math.round(coords.y),0,height,color)
      }
    }

    column.sort(function (a, b) {
      // Compare the 'y' property of objects in descending order
      return b.y - a.y;
    });

    for(let cid = 0 ; cid < column.length; cid++){
      drawVerticalLine(mg,column[cid].x,column[cid].y,0,column[cid].end,column[cid].color)
    }
  }*/


  let res = 512;
  
  let perfRes = Math.round(1/((321/320-1)/zoom))+1;
  res = Math.min(res,perfRes)

  let pBL = pln.projPoints[0]  
  let pTL = pln.projPoints[1]  
  let pTR = pln.projPoints[2]  
  let pBR = pln.projPoints[3]  


  for(let x = 0;x < res; x++){

    const xFac = x/(res-1);
    const pointTop = vec.lerp(pTL,pTR,xFac);
    const pointBot = vec.lerp(pBL,pBR,xFac);  
    const texX =  Math.floor(x/res*512);

    for(let y = 0;y < res; y++){
      
      const yFac = y/(res-1);
      const GRID_POINT = vec.lerp(pointBot,pointTop,yFac)

      if(GRID_POINT.x >= 0 && GRID_POINT.x < width && GRID_POINT.y >= 0 && GRID_POINT.y < height){
        
        const texY =  Math.floor(y/res*512);
        const ELEV = elevation[texX][texY];
        const PIXEL_ELEV = Math.ceil(ELEV*0.5*zoom);
        let pixelColor = new vec(ELEV,ELEV,ELEV);

        if(xFac === 0 || xFac === 1 || yFac === 0 || yFac === 1){
          pixelColor = new vec(32,32,32)
        }

        const pX = Math.floor(GRID_POINT.x);
        const pY = Math.floor(GRID_POINT.y)-17;
        drawVerticalLine(mg,pX,pY,PIXEL_ELEV,pixelColor)
      }
    }
  }
  display(mg);
}

/*
function bilinearInterpolation(image,position) {
  const x0 = Math.floor(position.x);
  const x1 = Math.ceil(position.x);
  const y0 = Math.floor(position.y);
  const y1 = Math.ceil(position.y);


  const Q00 = image[x0][y0];
  const Q10 = image[x1][y0];
  const Q01 = image[x0][y1];
  const Q11 = image[x1][y1];

  const xFraction = smoothstep(position.x - x0);
  const yFraction = smoothstep(position.y - y0) ;

  // Interpolate in the x-direction first
  const topInterpolation = Q00 * (1 - xFraction) + Q10 * xFraction;
  const bottomInterpolation = Q01 * (1 - xFraction) + Q11 * xFraction;

  // Interpolate in the y-direction
  const interpolatedValue = topInterpolation * (1 - yFraction) + bottomInterpolation * yFraction;

  return interpolatedValue;
}*/