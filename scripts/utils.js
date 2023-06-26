function distance2D(x0,y0,x1,y1){
  return Math.sqrt(Math.pow(x1-x0,2)+Math.pow(y1-y0,2))
}

function remap(value,low1,high1,low2,high2){
  return(minMax(low2 + (value - low1) * (high2 - low2) / (high1 - low1),low2,high2))
}

function lerp (value1, value2, factor){
  return ((1-factor)*value1 + factor*value2);
}

function minMax(value,min,max){
  if(value<min){
    return min
  }
  else if(value > max){
    return max
  }
  else{
    return value
  }
}

function average(array){
  return(array.reduce((a, b) => a + b) / array.length);
}

function isInRange(value,min,max){
  if((value < min) || value > max){
    return false
  }
  return true;
}


function createArray2D(width,height,dVal){

  const array = new Array(width).fill(dVal)

  for (let index = 0; index < array.length; index++) {
    array[index] = new Uint8Array(height).fill(dVal)
  }

  return array

}