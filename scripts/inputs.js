const CONTAINER = document.getElementById("sliders-container");
let sundir, dragging = false;

const VALUES = {
  elevation: 0,
  radius: 0,
  opacity: 1/30,
  sundir: 0,
  brushMode: "regular",
};

function convertValues() {
  const alpha = remap(settings.graphics.sunElev, -10, 10, -Math.PI, 0);
  const beta = remap(settings.graphics.sunRotation, -10, 10, -Math.PI, Math.PI);

  const sunX = Math.sin(alpha) * Math.cos(beta);
  const sunY = Math.cos(alpha);
  const sunZ = Math.sin(alpha) * Math.sin(beta);

  VALUES.sundir = new Vector(sunX, sunY, sunZ).normalized();
  VALUES.sunAlpha = alpha * 180 / Math.PI + 90;
  VALUES.sunGround = new Vector(sunX, 0, sunZ).normalized();
}

function updateCanvasTransform() {
  CANVAS.style.transform = `scale(${settings.controls.defaultZoom}) translate(${settings.controls.posX}px,${settings.controls.posY}px)`;
  CANVAS.style.imageRendering = "pixelated";
}

onwheel = (e) => {
  settings.controls.defaultZoom += e.deltaY < 0 ? settings.controls.zoomSpeed : -settings.controls.zoomSpeed;
  settings.controls.defaultZoom = minMax(settings.controls.defaultZoom, settings.controls.minZoom, settings.controls.maxZoom);
  updateCanvasTransform();
};

let newX = settings.controls.posX, newY = settings.controls.posY;

document.body.onmousedown = (e) => {
  if (e.button === 0) {
    mouseDown = true;
  } else if (e.button === 1) {
    dragging = true;
    document.body.onmousemove = (j) => {
      if (dragging) {
        newX = settings.controls.posX + (j.clientX - e.clientX);
        newY = settings.controls.posY + (j.clientY - e.clientY);
        updateCanvasTransform();
      }
    };
  }
};

document.body.onmouseup = (e) => {
  if (e.button === 0) {
    mouseDown = false;
    render();
  } else if (e.button === 1) {
    settings.controls.posX = newX;
    settings.controls.posY = newY;
    dragging = false;
  }
};

document.body.ontouchend = () => {
  mouseDown = false;
  render();
};

document.body.ontouchstart = () => {
  mouseDown = true;
};

const container = document.getElementById("sliders-container");

Array.from(container.children).forEach((elem) => {
  convertValues();
  if (elem.tagName === "LI") {
    const inputName = elem.firstElementChild.attributes.for.value;
    const forAttribute = document.querySelector(`output[for='${inputName}']`);
    const inputAtt = document.querySelector(`input[name='${inputName}']`);

    if (inputAtt) {
      VALUES[inputName] = inputAtt.value;
      elem.addEventListener("input", () => {
        if (forAttribute) {
          forAttribute.innerHTML = inputAtt.value;
          VALUES[inputName] = inputAtt.value;
          convertValues();
          console.log(VALUES[inputName]);
        }
      });
    }
  }
});

const brushButtons = {
  "button-regular": "regular",
  "button-river": "river"
};

Object.keys(brushButtons).forEach((id) => {
  document.getElementById(id).addEventListener("click", (e) => {
    e.preventDefault();
    VALUES.brushMode = brushButtons[id];
    console.log(brushButtons[id]);
  });
});

function onmove(position, event) {
  if (event.target.id === "canvas" && mouseDown && prevpos !== position) {
    let radius = parseInt(VALUES["radius"]);
    let color = remap(VALUES["elevation"], -16, 16, 0, 1);

    if (VALUES.brushMode === "regular") {
      drawCircle(arr2D, position.x, position.y, radius, color, VALUES["opacity"]);
    } else if (VALUES.brushMode === "smooth") {
      drawCircleBlur(position.x, position.y, radius, 2);
    } else if (VALUES.brushMode === "supersmooth") {
      drawCircleBlur(position.x, position.y, radius, 8);
    } else if (VALUES.brushMode === "river") {
      for (let i = 0; i < 100; i++) {
        if (position && position.x) {
          particleErosion(position.x, position.y, radius, "brush");
        }
      }
    }

    render();
    prevpos = position;
  }
}


onpointermove = (event) => {
  curPos = { x: Math.round(event.offsetX), y: Math.round(event.offsetY) };
  onmove(curPos, event);
};