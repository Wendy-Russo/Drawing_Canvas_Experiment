"use strict"

const sunAngle = Math.tan(45/180*Math.PI);
const halfSoft = Math.tan(2.5/180*Math.PI)*4;
const ANGTAN = Math.tan(sunAngle)
const CANVAS = document.getElementById("canvas");
const CTX = CANVAS.getContext("2d");
const data1 = CTX.createImageData(512, 256);
const dArray = new Uint8Array(256*512).fill(255)
const arr2D = createArray2D(CANVAS.width,CANVAS.height,127)
let shadowArr = createArray2D(CANVAS.width,CANVAS.height,255)
const shadowArr0 = createArray2D(CANVAS.width,CANVAS.height,0)


let curPos = 1, prevpos = 0;
let brown = [221,102,68]
let blue = [153,204,255]
let blueDark = [0,68,221]
let waterHeight = 126;
let mouseDown = false;
let times = [];
let heightbase,maxDist,color,dot,i,toned,arrX,arrY;



class Vector{
  constructor(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
  }

  normalized(){
    const mag = Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);
    const surfaceVec = new Vector(this.x/mag,this.y/mag,this.z/mag);
    return surfaceVec
  }

  normalizedFlat(){
    const mag = Math.sqrt(this.x*this.x+this.z*this.z);
    const surfaceVec = new Vector(this.x/mag,this.y/mag,this.z/mag);
    return surfaceVec
  }

  static dot(vector1,vector2){
    return(vector1.x*vector2.x+vector1.y*vector2.y+vector1.z*vector2.z)
  }
}

data1.data.fill(255)

// RENDERING FUNCTIONS 

let mapmax = 0;

function render(){


  //console.log("sunGround",VALUES["sunGround"].x,VALUES["sunGround"].y,VALUES["sunGround"].z)
  //console.log("sunHeight",50/(VALUES["sundir"].normalizedFlat().y))
  //console.log("dist",distance2D(0,0,-VALUES["sunGround"].x,-VALUES["sunGround"].z))
  let sunh = VALUES["sundir"].normalizedFlat().y

  let START = new Date()

  mapmax = 0;
  for(let x = 0 ; x < CANVAS.width; x++){
    //arrX = arr2D[x]
    for(let y = 0 ; y < CANVAS.height; y++){
      if(arr2D[x][y] > mapmax){
        mapmax = arr2D[x][y];
      }
    }
  }

  for(let x = 0 ; x < CANVAS.width; x++){
    //arrX = arr2D[x]
    for(let y = 0 ; y < CANVAS.height; y++){

      color = arr2D[x][y];
      dot = shadowArr[x][y]/255;
      const minLight = remap(VALUES["minLight"],0,100,0,1)

      if(color > waterHeight){
        if(mouseDown){
          dot *=  minMax(rotShadowsHard(x,y,sunh),minLight,1)//minMax(hardShadows(x,y,sunAngle,ANGTAN),minLight,1)
        }
        else{
          dot *= minMax(rotShadowsSoft(x,y,(VALUES["sunAlpha"]*180/Math.PI)+90,1.5),minLight,1)
          dot *= getApproxAO(x,y,5)
        }
        
      }

      dot *= remap(Vector.dot(normal(x,y).normalized(),VALUES["sundir"].normalized()),-1,1,minLight,1);

      
      i = (y * CANVAS.width + x)*4

      const SLOPE = (1-normal(x,y).normalized().y)

      const landCOL = [(SLOPE > 0) ? brown[0] : VALUES["grassColor"][0],(SLOPE > 0) ? brown[1] : VALUES["grassColor"][1],(SLOPE > 0) ? brown[2] : VALUES["grassColor"][2]]

      let waterLERP = 1-remap(color,0,waterHeight,0,1)

      const waterCOLR = Math.round(lerp(lerp(blue[0],blueDark[0],waterLERP),landCOL[0],remap(color,waterHeight-3,waterHeight,0,0.33)))
      const waterCOLG = Math.round(lerp(lerp(blue[1],blueDark[1],waterLERP),landCOL[1],remap(color,waterHeight-3,waterHeight,0,0.33)))
      const waterCOLB = Math.round(lerp(lerp(blue[2],blueDark[2],waterLERP),landCOL[2],remap(color,waterHeight-3,waterHeight,0,0.33)))

      let tonedR = TONEMAPPED[Math.ceil(dot*255)]*  ((color > waterHeight) ? landCOL[0] : waterCOLR)
      let tonedG = TONEMAPPED[Math.ceil(dot*255)]*  ((color > waterHeight) ? landCOL[1] : waterCOLG)
      let tonedB = TONEMAPPED[Math.ceil(dot*255)]*  ((color > waterHeight) ? landCOL[2] : waterCOLB)
      //d.log(slope)
      data1.data[i] = tonedR
      data1.data[i+1] = tonedG
      data1.data[i+2] = tonedB
    }
  } 
  CTX.putImageData(data1,0,0)
}

function onmove(position,event){

  if(event.target.id === "canvas" && (mouseDown) && (prevpos !== position)){
    
    //const START = new Date()
    //console.log(typeof(parseInt(VALUES["radius"])))
    drawCircle(position.x,position.y,parseInt(VALUES["radius"]),remap(VALUES["elevation"],-8,8,0,1),remap(VALUES["opacity"],0,100,0,1));
    render()
    prevpos = position;
    /*times.push(new Date() - START);
    if(times.length > 10){
      times.reverse()
      times.pop()
      times.reverse()
      let avg = (times.reduce((a, b) => a + b) / times.length)
      console.log(Math.round(avg),Math.round(1000 / avg))
    }*/
    
  }
  
  
  //times.push((new Date() - start));
  //if(times.length > 10){
  //  times.reverse();
  //  times.pop();
  //  times.reverse();
  //}
  //console.log(Math.round(1000/average(times)))
}

onpointermove = event => {
  curPos = {x : Math.round(event.offsetX), y: Math.round(event.offsetY)}
  onmove(curPos,event)
}

//DRAWING FUNCTIONS

function drawCircle(centerX,centerY,radius,b,a){
  for(let x = centerX-radius; x < centerX+radius;x++){
    for(let y = centerY-radius; y < centerY+radius;y++){
      const DIST = (distance2D(x,y,centerX,centerY)/radius)
      if(x > -1 && DIST < 1 && x < 512 ){

        arr2D[x][y] = lerp(arr2D[x][y],(b*255),(1-DIST)*(a))
      }
    }
  }
}

//LIGHTING FUNCTIONS

function normal(x,y,lightVec){
  let R;
  if(x < 511){
    R = (arr2D[x+1][y])/255
  }
  const O = (arr2D[x][y])/255
  const B = (arr2D[x][y+1])/255

  let surface = new Vector(-(R-O),remap(VALUES["nIntensity"],0,100,1,0),-(B-O));

  return surface // remap(Vector.dot(surface.normalized(),lightVec.normalized()),-1,1,0,1);
}

function tonemap(b,gamma){
  const GAMMA = Math.pow((b),(1/gamma));
  return(GAMMA/(GAMMA+2))
}

const TONEMAPPED = new Array(256)

function calcTonemap(gamma,light){
  for(let i = 0 ; i < TONEMAPPED.length; i++){
    TONEMAPPED[i] = tonemap((i/255)*light,gamma)
  }  
}

calcTonemap(2.2,100)

//SHADOW FUNCTIONS

function rotShadowsSoft(x2,y2,angle,soft){

  heightbase = arr2D[x2][y2];

  if(heightbase == mapmax){
    return 1
  }
  
  let limit = Math.ceil((mapmax-heightbase)/(VALUES["sundir"].normalizedFlat().y*1))

  if(VALUES["sunGround"].x < 0 && x2 < limit){
    limit = x2
  }
  else if(VALUES["sunGround"].x > 0 && 512-x2 < limit){
    limit = 512-x2
  }
  if(VALUES["sunGround"].z < 0 && y2 < limit){
    limit = y2
  }
  else if(VALUES["sunGround"].z > 0 && 256-y2 < limit){
    limit = 256-y2
  }
  let h1,x3,y3,maxAngle = 0;
  for(let i = 0 ; i < limit; i++){

    x3 = Math.round(x2 + VALUES["sunGround"].x * i)
    y3 = Math.round(y2 + VALUES["sunGround"].z * i)

    h1 = arr2D[x3][y3]
    
    if(h1 > heightbase){
      const ANGLE = (h1 - heightbase) /Math.sqrt(Math.pow(x2-x3,2)+Math.pow(y2-y3,2))
      if(ANGLE > maxAngle){
        maxAngle = ANGLE;
      }
    }  

  }

  return (1-((Math.atan(maxAngle)*180/Math.PI - angle) / soft))
}

function rotShadowsHard(x2,y2,angle){

  heightbase = arr2D[x2][y2];

  if(heightbase == mapmax){
    return 1
  }
  
  let limit = Math.ceil((mapmax-heightbase)/angle)

  if(VALUES["sunGround"].x < 0 && x2 < limit){
    limit = x2
  }
  else if(VALUES["sunGround"].x > 0 && 512-x2 < limit){
    limit = 512-x2
  }
  if(VALUES["sunGround"].z < 0 && y2 < limit){
    limit = y2
  }
  else if(VALUES["sunGround"].z > 0 && 256-y2 < limit){
    limit = 256-y2
  }
  let h1;
  for(let i = 0 ; i < limit; i++){

    if(i > 10 && i < limit-10){
      i += 10
    }

    h1 = arr2D[Math.round(x2 + VALUES["sunGround"].x * i)][Math.round(y2 + VALUES["sunGround"].z * i)]
    
    if((h1 > heightbase) && ((h1 - heightbase) >= Math.round(i*angle))){
      return 0
    }  

  }

  return 1
}

function getApproxAO(x,y, margin){
  let center = arr2D[x][y]
  let sum = 0;
  let exp = 0;

  if(arr2D[x-margin]){ // LEFT
    sum += arr2D[x-margin][y]
    exp ++;
  }
  if(arr2D[x][y-margin]){// TOP
    sum += arr2D[x][y-margin]
    exp ++;
  }
  if(arr2D[x+margin]){// RIGHT
    sum += arr2D[x+margin][y]
    exp ++;
  }
  if(arr2D[x][y+margin]){// BOTTOM
    sum += arr2D[x][y+margin]
    exp ++;
  }
  if(arr2D[x-margin] && arr2D[x-margin][y-margin]){ // LEFT TOP
    sum += arr2D[x-margin][y-margin]
    exp ++;
  }
  if((arr2D[x+margin]) && arr2D[x+margin][y-margin]){ // RIGHT TOP
    sum += arr2D[x+margin][y-margin]
    exp ++;
  }
  if(arr2D[x-margin] && arr2D[x-margin][y+margin]){ // LEFT BOT
    sum += arr2D[x-margin][y+margin]
    exp ++;
  }
  if(arr2D[x+margin] && arr2D[x+margin][y+margin]){ // right BOT
    sum += arr2D[x+margin][y+margin]
    exp ++;
  }
  sum /= exp

  let offset = Math.abs( sum - center)

  if(center < sum){
    return(remap(1/(offset+1),0,1,remap(VALUES["minLight"],0,100,0,1),1))
  }

  return 1

}