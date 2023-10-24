function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Returns the value, mapped to the minimum and maximum
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 * @returns 
 */
function minMax(value,min,max){

  if(value<=min){
    return min
  }
  else if(value >= max){
    return max
  }
  else{
    return value
  }
}

function calculateDistance(x1, y1, x2, y2) {
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

function remap(value,low1,high1,low2,high2){  
  if(value < low1){
    return low2
  }
  value = minMax(value,low1,high1)
  return ((value-low1)/(high1-low1))*(high2-low2)+low2;
}

function calculateAverage(arr) {
  if (arr.length === 0) {
    return 0; // Avoid division by zero for empty arrays
  }

  const sum = arr.reduce((total, currentValue) => total + currentValue, 0);
  return sum / arr.length;
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

function smoothstep(t) {
  // Smoothstep interpolation function
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t * t * (3 - 2 * t);
}

function smoothstep(x) {
  
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return (3*(x*x)) - (2*(x*x*x));
}