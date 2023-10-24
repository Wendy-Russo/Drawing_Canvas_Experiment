const zoomSpeed = 0.3;
let isMiddleButtonPressed = false;
let startMX = 0;
let startMY = 0;
let tempOffset = 0;
let rotBackup = cubeRot;



/*window.addEventListener("wheel", (e) => 
  { 
    zoom += e.deltaY < 0 ? zoomSpeed : -zoomSpeed;
    zoom = Math.min(Math.max(zoom,0.5),100)


    updateView()
    times = []
  }
)*/

// Event listener to track the middle mouse button press
document.addEventListener('mousedown', function(event) {
    if (event.button === 1) { // Middle mouse button is button 1
      isMiddleButtonPressed = true;
      startMX = event.clientX;
      startMY = event.clientY;
      rotBackup = new vec(cubeRot.x,cubeRot.y,cubeRot.z);
    }
});

// Event listener to track the middle mouse button release
document.addEventListener('mouseup', function(event) {
    if (event.button === 1) {
      isMiddleButtonPressed = false;
      startMX = event.clientX;
      startMY = event.clientY;
    }
});

// Event listener to update a variable while moving the mouse with the middle button pressed
document.addEventListener('mousemove', function(event) {
    if (isMiddleButtonPressed) {
      const time = new Date()

      cubeRot.z = rotBackup.z + ((event.clientX-startMX)/5)

      cubeRot.z = Math.round(cubeRot.z*100)/100
      //cubeRot.x = rotBackup.x + ((event.clientY-startMY)/10)
      updateView()
      let rt = new Date() - time
      console.log("run time =",Math.round(rt/10)*10 + " ms")

    }
    /*else if (event.buttons === 1){
      let canvas = document.getElementById("canvas");
      let screenX = Math.floor(event.offsetX/canvas.offsetWidth*width);
      let screenY = Math.floor(event.offsetY/canvas.offsetHeight*height);
      let screenPos = new vec(screenX,480-screenY,0);

      const p =  new plane(new vec(0,0,0), cubeRot,zoom)
      if(isPointInQuadrilateral(screenPos,p.projPoints)){

        let planePos = vec.divide(rotate3DPoint(projectTo3D(screenPos),new vec(-cubeRot.x,-cubeRot.y,-cubeRot.z)),zoom)
        const texturePos  = new vec(Math.floor(remap(planePos.x,-0.5,0.5,0,elevationRes)),Math.floor(remap(planePos.y,-0.5,0.5,0,elevationRes)),0)
        drawCircle(elevation,texturePos,16,255,0.1)
        updateView();
      }
    }*/
});