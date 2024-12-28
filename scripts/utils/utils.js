function median(values){
  if(values.length ===0) throw new Error("No inputs");

  values.sort(function(a,b){
    return a-b;
  });

  var half = Math.floor(values.length / 2);
  
  if (values.length % 2)
    return values[half];
  
  return (values[half - 1] + values[half]) / 2.0;
}

function isInRange(value,min,max){
  if((value < min) || value > max){
    return false
  }
  return true;
}

function remap(value,low1,high1,low2,high2){  
  value = minMax(value,low1,high1)
  return ((value-low1)/(high1-low1))*(high2-low2)+low2;
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

function createArray2D(width,height,dVal){
  const array = new Array(width).fill(dVal)

  for (let index = 0; index < array.length; index++) {
    array[index] = new Array(height).fill(dVal)
  }

  return array
}

function distance2D(x0,y0,x1,y1){
  return Math.sqrt(Math.pow(x1-x0,2)+Math.pow(y1-y0,2))
}

function lerp (value1, value2, factor){
  if(factor === 1){
    return value2
  }
  else if(factor === 0){
    return value1
  }
  else {
    return (((1-factor)*value1) + (factor*value2));
  }
}

function average(array){
  return(array.reduce((a, b) => a + b) / array.length);
}