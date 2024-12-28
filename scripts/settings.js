const settings =
{
    graphics :
    {
      brushMode: "regular",
      ambientLight : 5,
      specularStrength : 32,
      shininess : 4,
      waterLevel : 126,
      sunRotation: 7,
      sunElev:0,
      lightIntensity: 10,
      defaultPalette : 
      [
        {
          min: {
            value: 0,
            color: [0, 42, 136],
          },
          max: {       
            value: 75,       
            color: [0, 42, 136],     
          },   
        },
        {     
          min: {       
            value: 75,       
            color: [0, 42, 136],     
          },
          max: {     
            value: 123,       
            color: [72, 206, 223],  //LIGHT BLUE     
          },   
        },   
        {    
          min: {
            value: 123,
            color: [72, 206, 223],  //LIGHT BLUE   
          },
          max: {       
            value: 128,       
            color: [247, 217, 166], // SAND 
          },   
        },   
        {     
          min: {       
            value: 127,       
            color: [247, 217, 166], // SAND  
          },     
          max: {
            value: 130,
            color: [137, 217, 0], // LIGHT GREEN
          },   
        },   
        {   
          min: {       
            value: 130,       
            color: [137, 217, 0], 
          // LIGHT GREEN   
          },   
          max: {       
            value: 164,       
            color: [13, 148, 0], // DARK GREEN  
          },  
        },   
        { 
          min: {       
            value: 164,       
            color: [13, 148, 0], // DARK GREEN   
          },     
          max: {       
            value: 255,   
            color: [255, 255, 255], // WHITE  
          },   
        },
      ],
      "sedimentPalette":
      [
        {     
          min: {       
            value: 0,       
            color: [247, 217, 166], // SAND  
          },     
          max: {
            value: 127,
            color: [247, 217, 166], // SAND
          },   
        }, 
        {     
          min: {       
            value: 127,       
            color: [247, 217, 166], // SAND  
          },     
          max: {
            value: 132,
            color: [137, 217, 0], // LIGHT GREEN
          },   
        },   
        {   
          min: {       
            value: 132,       
            color: [137, 217, 0], 
          // LIGHT GREEN   
          },   
          max: {       
            value: 200,       
            color: [13, 148, 0], // DARK GREEN  
          },  
        },   
        {   
          min: {       
            value: 200,       
            color: [13, 148, 0], 
          // LIGHT GREEN   
          },   
          max: {       
            value: 255,       
            color: [13, 148, 0], // DARK GREEN  
          },  
        }, 
      
      ],
      "rockPalette":
      [
        {     
          min: {       
            value: 0,       
            color: [170, 170, 170], // LIGHT GREY
          },     
          max: {       
            value: 130,       
            color: [170, 170, 170], // LIGHT GREY
          },   
        }, 
        {   
          min: {       
            value: 130,       
            color: [170, 170, 170], // LIGHT GREY
          },   
          max: {       
            value: 192,       
            color: [170, 170, 170], // brown   
          },  
        },   
        {   
          min: {       
            value: 192,       
            color: [170, 170, 170], // brown   
          },   
          max: {       
            value: 255,       
            color: [255, 255, 255],  
          },  
        }, 
      
      ]
    },
    "controls":
    {
      "defaultZoom":3,
      "minZoom":0.1,
      "maxZoom":10,
      "zoomSpeed":0.5,
      "posX":0,
      "posY":0
    },
    "erosion":
    {
      "maxDropLifespan":100,
      "minWaterVolume":0.1,
      "volume"  : 1,
      "sediment"  : 0,
      "friction" : 0.1,
      "density" : 3,
      "depositionRate" : 0.1,
      "evapRate" : 0.02
    }

}