
const CONTAINER = document.getElementById("sliders-container");
let sundir;

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
  sulAlpha : 0

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
  calcTonemap(2.2,parseInt(VALUES["lightIntensity"]))  
}

let size = 2;
CANVAS.style.transform = `scale(${size})`;

let brushBrightness = 0.5

onwheel = (e) => {
  e.deltaY < 0 ? (size += 0.5) : (size -= 0.5);
  size = minMax(size, 0.1, 10);
  CANVAS.style.transform = `scale(${size})`;
  CANVAS.style.imageRendering = "pixelated";
};

document.body.onmousedown = function () {
  mouseDown = true;

};

let lastPoint;

document.body.onmouseup = function (event) {
  mouseDown = false;
  render()
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


document.getElementsByClassName("nes-col-38")[0].click()


/*
let elevation,        radius,
    opacity,          sunRot,
    sunHeight,        nIntensity,
    lightIntensity,   uselessSlider,
    shadowSoftness,   shadowAmount,
    brushOpacity,     size = 1,
    normalsIntensity, sundir,
    grassColor;

CANVAS.style.imageRendering = "pixelated";

function addSliders(data){

  for(let i = 0 ; i < data.length; i++){
    const SLIDER = data[i];
    if(SLIDER.display === "True"){
      const li = document.createElement('li');
      li.classList = "list-group-item" + SLIDER.classes

      const LABEL = document.createElement('label');
      LABEL.classList = "form-label mb-0";
      LABEL.htmlFor = SLIDER.name;
      LABEL.append(SLIDER.description + " ");

      const INPUT = document.createElement('input');
      INPUT.id = SLIDER.name;
      INPUT.classList = "form-range"
      INPUT.type = SLIDER.type
      INPUT.name = SLIDER.name;

      if(SLIDER.default){
        INPUT.setAttribute("value",SLIDER.default)
        INPUT.value = SLIDER.default
      }

      if(SLIDER.type === "range"){
        SLIDER.minimum && (INPUT.min = SLIDER.minimum);
        SLIDER.maximum && (INPUT.max = SLIDER.maximum);

        const OUTPUT = document.createElement('output');
        OUTPUT.append(SLIDER.default);
        OUTPUT.setAttribute("name",SLIDER.name+"-result")
        OUTPUT.setAttribute("for",SLIDER.name)
        OUTPUT.name = SLIDER.name+"-result";

        li.appendChild(OUTPUT);

      }
      

      li.appendChild(LABEL);
      li.appendChild(INPUT);


      CONTAINER.appendChild(li)

      VALUES[i] = SLIDER.default;
      
      (SLIDER.type === "range") && updateSlider(SLIDER.name,i);
    }
  }
  updateValues();
}

function updateSlider(id,i)
{
  document.getElementById(id).addEventListener("input", function(){
    VALUES[i] = parseInt(document.getElementById(id).value)
    updateValues();
    document.querySelector(`output[for='${id}']`).innerHTML = VALUES[i];
  })
}

function updateValues()
{
  elevation = VALUES[0];
  radius = VALUES[1];
  opacity = VALUES[2];
  sunRot = VALUES[3];
  sunHeight = VALUES[4];
  nIntensity = VALUES[5];
  lightIntensity = VALUES[6];
  grassColor = VALUES[7];
  uselessSlider = VALUES[8];  
  shadowSoftness = VALUES[9];
  shadowAmount = VALUES[10];
  brushBrightness = remap(VALUES[0],-8,8,0,1)
  brushOpacity = VALUES[2]/100
  normalsIntensity = remap(nIntensity,0,100,0.125,0)
  calcTonemap(2.2,lightIntensity)
  let alpha = remap(VALUES[4],-10,10,-Math.PI,0)
  let beta = remap(VALUES[3],-10,10,-Math.PI,Math.PI)
  let sunX = Math.sin(alpha) * Math.cos(beta);
  let sunY = Math.cos(alpha);
  let sunZ = Math.sin(alpha) * Math.sin(beta);

  sundir = new Vector(sunX,sunY,sunZ).normalized()
  render()


  console.log(grassColor)
}
*/