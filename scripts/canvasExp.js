"use strict"

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

  static dot(vector1,vector2){
    return(vector1.x*vector2.x+vector1.y*vector2.y+vector1.z*vector2.z)
  }
}

let heightbase;
let maxDist;
let angleMax = 0;
let mouseDown = false;


const sunAngle = Math.tan(45/180*Math.PI);
const halfSoft = Math.tan(2.5/180*Math.PI)*4;
const ANGTAN = Math.tan(sunAngle)
let dot,i,toned;
let arrX,arrY;

function softShadows(x,y,angle,soft,tan){
  angleMax = 0;
  heightbase = arr2D[x][y];
  maxDist = Math.ceil(tan * (255 - heightbase));
  for(let xSearch = x-maxDist ; xSearch < x; xSearch++){
    if(xSearch > 0){
      const ANGLE = (arr2D[xSearch][y] - heightbase) /(x-xSearch)
      if (ANGLE > angleMax){
        angleMax = ANGLE
      }
    }
  }

  return 1-((Math.atan(angleMax)*180/Math.PI - angle) / soft)
  
}

function hardShadows(baseLum,x,y,angle,tan){
  heightbase = arr2D[x][y];
  for(let xSearch = x-Math.ceil(tan * (255 - baseLum))  ; xSearch < x; xSearch++){
    if(xSearch < x-10){
      xSearch+=10
    }
    if(xSearch > 0 && (arr2D[xSearch][y] - baseLum) /(x-xSearch) > angle){
        return 0
    }
  }

  return 1
}

function normal(x,y,lightVec){
  let R;
  if(x < 511){
    R = (arr2D[x+1][y])/255
  }
  const O = (arr2D[x][y])/255
  const B = (arr2D[x][y+1])/255

  let surface = new Vector(-(R-O),normalsIntensity,-(B-O));

  return remap(Vector.dot(surface.normalized(),lightVec.normalized()),-1,1,0,1);
}

const CANVAS = document.getElementById("canvas");
const CTX = CANVAS.getContext("2d");

const data1 = CTX.createImageData(512, 256);
data1.data.fill(255)

const dArray = new Uint8Array(256*512).fill(255)

const arr2D = new Array(CANVAS.width).fill(255)
for (let index = 0; index < arr2D.length; index++) {
  arr2D[index] = new Uint8Array(CANVAS.height).fill(127)
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

calcTonemap(2.2,1)

let curPos = 1,prevpos = 0;

let start;
let times = [];

function render(){
  for(let x = 0 ; x < CANVAS.width; x++){
    arrX = arr2D[x]
    for(let y = 0 ; y < CANVAS.height; y++){
      arrY = arrX[y]
      if(mouseDown){
        dot = normal(x,y,sundir) * minMax(hardShadows(arrY,x,y,sunAngle,ANGTAN),0.05,1)
        
      }
      else{
        dot = normal(x,y,sundir) * minMax(softShadows(x,y,45,5,ANGTAN),0.05,1)
      }
      i = (y * CANVAS.width + x)*4
      toned = TONEMAPPED[Math.round(dot*255)]*255;
      data1.data[i] = data1.data[i+1] = data1.data[i+2] = toned
    }
  } 
  CTX.putImageData(data1,0,0)
}

function onmove(position,event){
  
  if(event.target.id === "canvas" && (mouseDown || (/Android|iPhone/i.test(navigator.userAgent))) && prevpos !== position){

    drawCircle(position.x,position.y,radius,brushBrightness,brushOpacity);
    render()
    
  }
  prevpos = position;
  
  //times.push((new Date() - start));
  //if(times.length > 10){
  //  times.reverse();
  //  times.pop();
  //  times.reverse();
  //}
  //console.log(Math.round(1000/average(times)))
}

console.log(0)

onpointermove = event => {
  console.log(0)
  curPos = {x : Math.round(event.offsetX), y: Math.round(event.offsetY)}
  onmove(curPos,event)
}

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