
fetch("data/sliders.json")
  .then(res => res.json())
  .then(data => {
    addSliders(data.sliders);
  })
  .catch(error => console.log(error))

let elevation,        radius,
    opacity,          sunRot,
    sunHeight,        nIntensity,
    lightIntensity,   uselessSlider,
    shadowSoftness,   shadowAmount,
    size = 1,         brushOpacity,
    normalsIntensity, sundir;

const CONTAINER = document.getElementById("sliders-container");
const VALUES = []

let brushBrightness = 0.5


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
      INPUT.type = "range"
      INPUT.name = SLIDER.name;
      INPUT.setAttribute("value",SLIDER.default)
      INPUT.min = SLIDER.minimum;
      INPUT.max = SLIDER.maximum;
      INPUT.value = SLIDER.default

      const OUTPUT = document.createElement('output');
      OUTPUT.append(SLIDER.default);
      OUTPUT.setAttribute("name",SLIDER.name+"-result")
      OUTPUT.setAttribute("for",SLIDER.name)

      li.appendChild(LABEL);
      li.appendChild(OUTPUT);
      li.appendChild(INPUT);

      OUTPUT.name = SLIDER.name+"-result";

      CONTAINER.appendChild(li)

      VALUES[i] = SLIDER.default;
      
      updateSlider(SLIDER.name,i);
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
  uselessSlider = VALUES[7];  
  shadowSoftness = VALUES[8];
  shadowAmount = VALUES[9];
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
}

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