"use strict"

const sunAngle = Math.tan(45/180*Math.PI);
const halfSoft = Math.tan(2.5/180*Math.PI)*4;
const ANGTAN = Math.tan(sunAngle)
const CANVAS = document.getElementById("canvas");
const CTX = CANVAS.getContext("2d");
const data1 = CTX.createImageData(512, 256);
const dArray = new Uint8Array(256*512).fill(255)
const arr2D = createArray2D(CANVAS.width,CANVAS.height,127)
let shadowArr = createArray2D(CANVAS.width,CANVAS.height,0)
let shadowArr0 = new Array()

let DATA;
let base_image = new Image();

base_image.src = 'scripts/clouds.png';

base_image.addEventListener("load", () => {
  CTX.drawImage(base_image, 0, 0);
  base_image.style.display = "none"

  DATA = CTX.getImageData(0, 0, 512,256 ).data

  for(let x = 0 ; x < CANVAS.width; x++){
    //arrX = arr2D[x]
    for(let y = 0 ; y < CANVAS.height; y++){
      let flipx = 512-x
      let flipy = 256-y
      i = (flipy * CANVAS.width + flipx)*4
      let flat =  Math.pow(remap(DATA[i],0,255,-1,1),3)
      arr2D[x][y] = remap(flat,-1,1,106,150)
    }
  }
    
  render()
});


let curPos = 1, prevpos = 0;
let brown = [221,102,68]
let blue = [153,204,255]
let blueDark = [0,68,221]
let waterHeight = 126;
let mouseDown = false;
let times = [];
let heightbase,maxDist,color,dot,i,toned,arrX,arrY;
let minLight = 0.1


for(let i = 0 ; i < 512; i++){
  let randomX = Math.round(Math.random()*512) - 0
  let randomY = Math.round(Math.random()*256)
  let randomScale = Math.round(Math.random()*100)
  drawCircle(shadowArr,randomX,randomY,randomScale,Math.random(),randomScale/256)
}



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
let xoff = 512;
let yoff = 256;

function render(){


  //console.log("sunGround",VALUES["sunGround"].x,VALUES["sunGround"].y,VALUES["sunGround"].z)
  //console.log("sunHeight",50/(VALUES["sundir"].normalizedFlat().y))
  //console.log("dist",distance2D(0,0,-VALUES["sunGround"].x,-VALUES["sunGround"].z))
  let sunh = VALUES["sundir"].normalizedFlat().y
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

      
      dot = 1;

      i = (y * CANVAS.width + x)*4
      
      let colorToPaint = [0,0,0];
      

      if(color > waterHeight){
        const SLOPE = slope(x,y)

        if(mouseDown){
          //dot *=  minMax(rotShadowsHard(x,y,sunh),minLight*0.5,1)//minMax(hardShadows(x,y,sunAngle,ANGTAN),minLight,1)
        }
        else{
          dot *= remap(rotShadowsSoft(x,y,VALUES["sunAlpha"],2),0,1,minLight*0.5,1)

        }

        SLOPE && (dot *= remap(Vector.dot(normal(x,y),VALUES["sundir"]),-1,1,0.1,1))//VALUES["sundir"].normalized())
        dot *= remap(getApproxAO(x,y,5),0,1,minLight,1)

        let toned =  TONEMAPPED[Math.ceil(dot*255)]
        
        const landCOL = SLOPE ? brown : VALUES["grassColor"]
        colorToPaint = [landCOL[0]*toned,landCOL[1]*toned,landCOL[2]*toned]

      }
      else{

        let toned =  TONEMAPPED[Math.ceil(dot*255)]
        let waterLERP = 1-remap(color,0,waterHeight,0,1)

        const waterCOLR = Math.round(lerp(blue[0],blueDark[0],waterLERP))
        const waterCOLG = Math.round(lerp(blue[1],blueDark[1],waterLERP))
        const waterCOLB = Math.round(lerp(blue[2],blueDark[2],waterLERP))

        colorToPaint = [waterCOLR*toned,waterCOLG*toned,waterCOLB*toned]

      }

      shadowArr0[i] = colorToPaint
      data1.data[i]   = colorToPaint[0]
      data1.data[i+1] = colorToPaint[1]
      data1.data[i+2] = colorToPaint[2]
      
    }
  } 
  CTX.putImageData(data1,0,0)
}

function onmove(position,event){

  if(event.target.id === "canvas" && (mouseDown) && (prevpos !== position)){

    //let START = new Date()
    let radius = parseInt(VALUES["radius"])
    let color = remap(VALUES["elevation"],-8,8,0,1)
    let opacity = remap(VALUES["opacity"],0,100,0,1)
    //console.log(typeof(parseInt(VALUES["radius"])))
    //drawCircle(arr2D,position.x,position.y,parseInt(VALUES["radius"]),remap(VALUES["elevation"],-8,8,0,1),remap(VALUES["opacity"],0,100,0,1));
    drawRandom(position.x,position.y,radius,color,opacity);
    render()
    prevpos = position;    


    /*times.push(new Date() - START);
    if(times.length > 10){
      times.reverse()
      times.pop()
      times.reverse()
      let avg = (times.reduce((a, b) => a + b) / times.length)
      console.log(Math.round(avg),"ms",Math.round(1000 / Math.round(avg)),"fps")
    }*/
  }
}

onpointermove = event => {
  curPos = {x : Math.round(event.offsetX), y: Math.round(event.offsetY)}
  onmove(curPos,event)
}

//DRAWING FUNCTIONS

function drawCircle(image,centerX,centerY,radius,b,a){
  for(let x = centerX-radius; x < centerX+radius;x++){
    for(let y = centerY-radius; y < centerY+radius;y++){
      const DIST = (distance2D(x,y,centerX,centerY)/radius)
      if(x > 0 && y > -1 && DIST < 1 && x < 512 ){

        image[x][y] = lerp(image[x][y],(b*255),(1-DIST)*(a))
      }
    }
  }
}

//LIGHTING FUNCTIONS

function normal(x,y){
  
  const O = (arr2D[x][y])

  let R;
  if(x < 511){
    R = (arr2D[x+1][y])
  }

  const B = (arr2D[x][y+1])

  let surface = new Vector(-(R-O),-1,-(B-O));

  return (surface.normalized());
}

function slope(x,y){
  
  const O = (arr2D[x][y])

  let R = O;
  if(x < 511){
    R = (arr2D[x+1][y])
  }

  const B = (arr2D[x][y+1])

  return O !== R || O !== B
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
  let h1

  for(let i = 0 ; i < limit; i++){


    if(i > limit){return 1}

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
    let AO = 1/(offset+1)

    AO = Math.sqrt(AO);
    return AO

  }

  return 1

}

let cloudQ = 32;
let cloudHard = 32;

window.setInterval( function() {
  if(! mouseDown){

  xoff = (xoff-1)
  if(xoff <= 0){
    xoff = 512 - xoff
  }

  yoff = (yoff-0.1)
  if(yoff <= 0){
    yoff = 512 - yoff
  }

  for(let x = 0 ; x < CANVAS.width; x++){
    //arrX = arr2D[x]
    for(let y = 0 ; y < CANVAS.height; y++){

      let color = arr2D[x][y]
      let heightOffset = Math.round(color*0.2)
      let x2 = Math.round(x+xoff+ heightOffset) % 512
      let y2 = Math.round(y+yoff+ heightOffset) % 256
      i = (y * CANVAS.width + x)*4

      let c1 = remap(DATA[(y2 * CANVAS.width + x2)*4],cloudQ-cloudHard,cloudQ+cloudHard,0.8,1) // shadowArr[(x+xoff)%512][(y+xoff)%256];
      let c2 = remap(remap(DATA[(Math.round(y+yoff+25) % 256 * CANVAS.width + Math.round(x+xoff+25) % 512)*4],cloudQ-cloudHard,cloudQ+cloudHard,0.8,1),0.8,1,0,1)

      if(color <= waterHeight){
        data1.data[i]   = Math.round(lerp(255,shadowArr0[i][0], c2))
        data1.data[i+1] = Math.round(lerp(255,shadowArr0[i][1], c2))
        data1.data[i+2] = Math.round(lerp(255,shadowArr0[i][2], c2))
      }
      else{
        data1.data[i]   = shadowArr0[i][0] * (c1);
        data1.data[i+1] = shadowArr0[i][1] * (c1);
        data1.data[i+2] = shadowArr0[i][2] * (c1);
      }

      
    }
  } 
  CTX.putImageData(data1,0,0)
  } 

}, 100);

function drawRandom(x,y,radius,color,opacity){
  for(let i = 0 ; i < 3 ; i ++){

    let cX = Math.round(remap(Math.random(),0,1,x-(radius*0.5),x+(radius*0.5)));
    let cY = Math.round(remap(Math.random(),0,1,y-(radius*0.5),y+(radius*0.5)));
    let rR = Math.round(Math.random()*radius)
    let rB = color // Math.round(remap(Math.random(),0,1,color-0.1,color+0.1));
    drawCircle(arr2D,cX,cY,rR,rB,opacity)
  }
}