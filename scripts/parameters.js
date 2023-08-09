
const CONTAINER = document.getElementById("sliders-container");
let sundir;
let dragging = false;

const VALUES = {
  elevation : 0,
  radius : 0,
  opacity : 0,
  sunRotation : 2,
  sunElev : 2,
  lightIntensity : 0,
  grassColor : [255,255,255],
  sundir : 0,
  sunGround : 0,
  sulAlpha : 0,
  brushMode : "regular",
  ambiantLight : 5
}

function convertValues(){

  let alpha = remap(VALUES["sunElev"],-10,10,-Math.PI,0)
  let beta = remap(VALUES["sunRotation"],-10,10,-Math.PI,Math.PI)

  let sunX = Math.sin(alpha) * Math.cos(beta);
  let sunY = Math.cos(alpha);
  let sunZ = Math.sin(alpha) * Math.sin(beta);

  VALUES["sundir"] = new Vector(sunX,sunY,sunZ).normalized()
  VALUES["sunAlpha"] = alpha*180/Math.PI + 90;

  VALUES["sunGround"] = new Vector(sunX,0,sunZ).normalized()
}

CANVAS.style.transform = `scale(${settings.controls.defaultZoom}) translate(${settings.controls.posX}px,${settings.controls.posY}px)`;

onwheel = (e) => {
  e.deltaY < 0 ? (settings.controls.defaultZoom += settings.controls.zoomSpeed) : (settings.controls.defaultZoom -= settings.controls.zoomSpeed);
  settings.controls.defaultZoom = minMax(settings.controls.defaultZoom, settings.controls.minZoom, settings.controls.maxZoom);
  CANVAS.style.transform = `scale(${settings.controls.defaultZoom}) translate(${settings.controls.posX}px,${settings.controls.posY}px)`
  CANVAS.style.imageRendering = "pixelated";
};
let newX = settings.controls.posX,
newY = settings.controls.posY;

document.body.onmousedown = function(e){
  
  if(e.button === 0){
    mouseDown = true;
  }
  else if(e.button === 1){
    
    dragging = true;

    document.body.onmousemove = function(j){
      if(dragging){
        
        newX = settings.controls.posX + (j.clientX - e.clientX)
        newY = settings.controls.posY + (j.clientY - e.clientY)
        
        CANVAS.style.transform = `scale(${settings.controls.defaultZoom}) translate(${newX}px,${newY}px)`;
      }
    }

  }
  

};


let lastPoint;

document.body.onmouseup = function (event) {
  
  if(event.button === 0){
    mouseDown = false;
    render()
  }
  if(event.button === 1){
    settings.controls.posX = newX
    settings.controls.posY = newY  
    dragging = false
  }
};

document.body.ontouchend = event =>{
  mouseDown = false;
  render()
}

document.body.ontouchstart = event =>{
  mouseDown = true;
}

const container = document.getElementById("sliders-container");


for(let i = 0 ; i < container.children.length; i++){
  convertValues()
  let elem = container.children[i]
  if(elem.tagName === "LI"){

    const inputName = elem.firstElementChild.attributes.for.value
    const forAttribute = document.querySelector(`output[for='${inputName}']`)
    const inputAtt = document.querySelector(`input[name='${inputName}']`)
    
    if(inputAtt){
      VALUES[`${inputName}`] = inputAtt.value
      elem.addEventListener("input" , function(){
        if(forAttribute){
          forAttribute.innerHTML = inputAtt.value
          VALUES[`${inputName}`] = inputAtt.value

          convertValues()
          console.log(VALUES[`${inputName}`])
        }
      })
    }
  }
}

const COLDIV = document.getElementById("paletteContainer")

for(let i = 0 ; i < COLDIV.children.length; i++){
  let child = COLDIV.children[i]

  child.addEventListener("click", function(event){
    VALUES["grassColor"] = (window.getComputedStyle(child).backgroundColor)
    VALUES["grassColor"] = VALUES["grassColor"].substring(4,VALUES["grassColor"].length-1).split(",")
    render()
  })
}

const BRUSH_REGULAR = document.getElementById("button-regular")
const BRUSH_SMOOTH = document.getElementById("button-smooth")
const BRUSH_SUPER_SMOOTH = document.getElementById("button-supersmooth")
const BRUSH_RIVER = document.getElementById("button-river")



BRUSH_REGULAR.addEventListener("click", function(e){
  e.preventDefault()
  VALUES.brushMode = "regular"
  console.log("regular")
})

BRUSH_SMOOTH.addEventListener("click", function(e){
  e.preventDefault()
  VALUES.brushMode = "smooth"
  console.log("smooth")
})

BRUSH_SUPER_SMOOTH.addEventListener("click", function(e){
  e.preventDefault()
  VALUES.brushMode = "supersmooth"
  console.log("supersmooth")
})

BRUSH_RIVER.addEventListener("click", function(e){
  e.preventDefault()
  VALUES.brushMode = "river"
  console.log("river")
})