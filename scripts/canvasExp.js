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

let curPos, prevPos;
let times = [];

let LASTTIME
window.onmousemove = event => {
  if(mouseDown && (event.target.id === "canvas")){

    curPos = {x : event.offsetX, y: event.offsetY}

    drawCircle(curPos.x,curPos.y,radius,brushBrightness,brushOpacity);
    render()

    const LAST = new Date() - START
    if(times.length >= 500){
      times.reverse();
      times.pop()
      times.reverse();
    }

  }
}

function drawCircle(centerX,centerY,radius,b,a){
  for(let x = centerX-radius; x < centerX+radius;x++){
    for(let y = centerY-radius; y < centerY+radius;y++){
      const DIST = distance2D(x,y,centerX,centerY)/radius
      if(x > -1 && DIST < 1 && x < 512){
        arr2D[x][y] = lerp(arr2D[x][y],(b*255),(1-DIST)*(a))
      }
    }
  }
}

function render(){
  for(let x = 0 ; x < CANVAS.width; x++){
    for(let y = 0 ; y < CANVAS.height; y++){
      let relativeBrightness = remap(arr2D[x][y],0,255,0.05,1)
      const DOT = normal(x,y,sundir)*relativeBrightness;
      const i = (y * CANVAS.width + x)*4
      const TONED = TONEMAPPED[Math.round(DOT*255)]*255;
      data1.data[i] = data1.data[i+1] = data1.data[i+2] = TONED
    }
  } 
  CTX.putImageData(data1,0,0)
}