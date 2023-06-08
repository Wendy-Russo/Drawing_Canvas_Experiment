function distance2D(x0,y0,x1,y1){
    return Math.sqrt(Math.pow(x1-x0,2)+Math.pow(y1-y0,2))
}

function remap(value,low1,high1,low2,high2){
    return(low2 + (value - low1) * (high2 - low2) / (high1 - low1)
    )
}

function lerp (value1, value2, factor){
    return ((1-factor)*value1 + factor*value2);
}

function minMax(value,min,max){
    return( Math.max(Math.min(max,value),min) )
}

function average(array){
    return(array.reduce((a, b) => a + b) / array.length);
}
