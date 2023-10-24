function hash(x){
    let state = x 
    state *= (state+2) * (state+25) * (state+579) ;
    state %= Math.pow(2,32);
    state /= Math.pow(2,32)
    return state
  }
  
  function octave(x,y,tileSize,seed){
  
    const tileX = parseInt(x/tileSize)+1;
    const tileY = parseInt(y/tileSize);
  
    const TOP_LEFT_TILE_KEY = (tileX*512+tileY)+tileSize + seed;
    const TOP_RIGHT_TILE_KEY = ((tileX+1)*512+tileY)+tileSize + seed;
    const BOTTOM_LEFT_TILE_KEY = (tileX*512+(tileY+1))+tileSize + seed;
    const BOTTOM_RIGHT_TILE_KEY = ((tileX+1)*512+(tileY+1))+tileSize + seed;
    
    const TOP_LEFT_TILE_HEIGHT = hash(TOP_LEFT_TILE_KEY)
    const TOP_RIGHT_TILE_HEIGHT = hash(TOP_RIGHT_TILE_KEY)
    const BOTTOM_LEFT_TILE_HEIGHT = hash(BOTTOM_LEFT_TILE_KEY);
    const BOTTOM_RIGHT_TILE_HEIGHT = hash(BOTTOM_RIGHT_TILE_KEY);
  
    let howFarAlongX = x%tileSize/tileSize
    howFarAlongX = Math.pow(howFarAlongX,2)*3 - Math.pow(howFarAlongX,3)*2
  
    let howFarAlongY = y%tileSize/tileSize
    howFarAlongY = Math.pow(howFarAlongY,2)*3 - Math.pow(howFarAlongY,3)*2
  
    const LERPED_X_TOP      = lerp(TOP_LEFT_TILE_HEIGHT,    TOP_RIGHT_TILE_HEIGHT, howFarAlongX)
    const LERPED_X_BOTTOM   = lerp(BOTTOM_LEFT_TILE_HEIGHT, BOTTOM_RIGHT_TILE_HEIGHT, howFarAlongX)
    const LERPED_X_Y        = lerp(LERPED_X_TOP,    LERPED_X_BOTTOM, howFarAlongY)
  
    return LERPED_X_Y
  }
  
  function noise(x,y,seed,tileSize){
      
    let multiLevelNoise = 0;
    let brightnessDiv = 0;
    let opacity = 1;
    let octaves = 30;
  
    for(let i = 0 ; i < octaves ; i++){
      if(tileSize < 1){
        break
      }
      multiLevelNoise += octave(x,y,tileSize,seed) * opacity;
      brightnessDiv += opacity;
      tileSize /= 2;
      opacity *= 0.5;
    }
  
    const NOISE_FLOAT = multiLevelNoise/brightnessDiv;
    return Math.pow(NOISE_FLOAT,2)*255
  }