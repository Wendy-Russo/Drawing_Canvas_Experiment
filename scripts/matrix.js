const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

let zoom = 1.2 ;
const width = 640;
const height = 480;
const screenDim = new vec(width,height)
const cubeRot = new vec(35.2,0,225);
const heightMutlt = 0.5;

let toLod = "";

const elevationRes = 512;

let times = [];

const elevation = initData(0,new vec(elevationRes,elevationRes))
const seed = Math.round(Math.random()*1024) //20 //10 //20;

for(let x = 0; x < elevationRes; x++ ){
  for(let y = 0 ; y < elevationRes; y++ ){
    elevation[x][y] = noise(x,y,seed,256)
  }
}

/*
function calculateSlope(image, pos) {

  let {x,y} = pos
  x = Math.round(x);
  y = Math.round(y)
  const dx = image[x+1][y] - image[x][y];
  const dy = image[x][y+1] - image[x][y];

  //let p1 = new vec(pos.x+1,pos.y);
  //let p2 = new vec(pos.x,pos.y+1);
  //const dx = (bilinearInterpolation(image,p1) - bilinearInterpolation(image,pos));
  //const dy = (bilinearInterpolation(image,p2) - bilinearInterpolation(image,pos));

  // Calculate the slope using the gradient
  const slope = Math.atan(Math.sqrt(dx * dx + dy * dy));

  return slope ;
}*/

/*
function drawDifferent(image,plane){

  let margin = Math.min(Math.ceil(zoom),2)
  toLod = margin
  for(let x = 0; x < width; x++ ){
    let column = []
    let limit = 0;

    for(let y = height-1; y > limit; y-=margin){

    let screenPos = new vec(x,y+Math.ceil(heightMutlt*zoom*64),0)
    let texturePos = projectToText(screenPos,elevationRes,zoom,cubeRot)
    
    if(texturePos.x < 0 || 
      texturePos.y < 0 || 
      texturePos.x >= elevationRes-2 || 
      texturePos.y >= elevationRes-2 )
    {
      continue
    }


    //let lineElev = bilinearInterpolation(elevation,texturePos)
    let lineElev = elevation[Math.round(texturePos.x)][Math.round(texturePos.y)]

    let color = new vec(lineElev,lineElev,lineElev);
    
    const green = new vec(14,148,1);
    let sand = new vec(247,217,165);
    let landColor = vec.lerp(green,sand,remap(lineElev,64,64+4,1,0))
    color = vec.lerp(color,landColor,remap(lineElev,64,255,0.5,0))

    if(lineElev < 64){
      let dBlue = new vec(21,95,218);
      let lBlue = new vec(100,176,254);
      let fBlue = vec.lerp(dBlue,lBlue,remap(lineElev,0,64,0,1))
      color = vec.lerp(color,fBlue,remap(lineElev,54,64,1,0.33))
      lineElev = 64;
    }

    let lineHeight = Math.ceil(lineElev*zoom*heightMutlt);


    column.push({y:y, start : 0, end:lineHeight, color : color })
    limit = -lineHeight-margin-margin-margin
      
      

    }
    

    for(let colID = column.length-2 ; colID > 0; colID--){

      column[colID].start = column[colID+1].end-margin;
    }

    for(let colID = 1 ; colID < column.length-1; colID++){
      const infos = column[colID];
      drawVerticalLine(image,x,infos.y,infos.start,infos.end,infos.color)
    }
    
  }
}*/

/*
function getUpScale(degrees){
  let maxRot = new vec(90,0,0);
  let curRot = new vec(degrees,0,0)

  let maximum = vec.distance(
    projectTo2D(rotate3DPoint(new vec(0,0,0),maxRot)),
    projectTo2D(rotate3DPoint(new vec(0,0,1),maxRot))
  )

  let current = vec.distance(
    projectTo2D(rotate3DPoint(new vec(0,0,0),curRot)),
    projectTo2D(rotate3DPoint(new vec(0,0,1),curRot))
  )

  return current/maximum
}*/

setInterval(() => {
  const time = new Date()
  
  updateView();

  //cubeRot.z += 1/5;



  console.clear();
  console.log(toLod)
  times.push(new Date() - time)
  console.log("zoom : "+zoom)
  console.log(Math.round(calculateAverage(times)*100)/100,times.length)
}, 0);

updateView()
