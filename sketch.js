let faceapi;
let detections = [];
let lastEmotion = "";

let video;
let canvas;
let jokeParagraph; 
let surpriseSound;
let rainbowImage;

function Green() {
  document.getElementById("video").style.filter = "hue-rotate(90deg) saturate(200%)";
}


function preload() {
  surpriseSound = loadSound('Surprised.mp3');
  rainbowImage = loadImage('rainbow.jpeg');
 
  
  
}

function setup(){
  canvas = createCanvas(480, 360);
  canvas.id('canvas');
  video = createCapture(VIDEO);
  video.id('video');
  video.size(width, height);

  const faceOptions = {
    withLandmarks: true,
    withExpressions: true,
    withDescriptors: true,
    minConfidence: 0.5
  };

  faceapi = ml5.faceApi(video, faceOptions, faceReady);
  
  jokeParagraph = createP();
  jokeParagraph.position(10, 300); 
  jokeParagraph.style('color', 'orange'); 
}

function faceReady(){
  faceapi.detect(gotFaces);
}

function gotFaces(error, result){
  if (error){
    console.log(error);
    return;
  }
  detections = result;
  
    
  if (detections.length > 0 && detections[0].expressions) {
    let { sad } = detections[0].expressions;
    if (sad > 0.5 && lastEmotion !== "sad") { 
      fetchDadJoke();
      lastEmotion = "sad";
    } else {
      lastEmotion = "";
      document.getElementById("video").style.filter = "none";
    }
  }

  if (detections.length > 0 && detections[0].expressions) {
    let { angry } = detections[0].expressions;
    if (angry > 0.5 && lastEmotion !== "angry") { 
      Green();
      lastEmotion = "angry";
    } else if (angry <= 0.5 && lastEmotion === "angry") { 
      document.getElementById("video").style.filter = "none";
      lastEmotion = "";
    }
  }
  if (detections.length > 0 && detections[0].expressions) {
    let { surprised } = detections[0].expressions;
    if (surprised > 0.5 && lastEmotion !== "surprised") {
      surpriseSound.play();
      lastEmotion = "surprised";
    } else {
      lastEmotion = "";
    }
  }
  if (detections.length > 0 && detections[0].expressions) {
    let { happy } = detections[0].expressions;
    if (happy > 0.5 && lastEmotion !== "happy") {
      lastEmotion = "happy";
      image(rainbowImage, 0, 0, width, height); 
    } else {
      lastEmotion = "";
    }
  }
  faceapi.detect(gotFaces);
}

function fetchDadJoke() {
  fetch('https://icanhazdadjoke.com/', {
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    displayJoke(data.joke);
  })
  .catch(error => {
    console.error('Error fetching joke:', error);
  });
}

function displayJoke(joke) {
  jokeParagraph.html(joke);
}

function draw(){
  clear();
  drawBoxes(detections);
  drawLandmarks(detections);
  drawExpressions(detections, 20, 250, 14);
}

function drawBoxes(detections){
  if(detections.length > 0){
    for(let f=0;f < detections.length; f++){
      let {_x,_y,_width,_height} = detections[0].alignedRect._box;

      stroke(44,169,225);
      strokeWeight(1);
      noFill();
      rect(_x,_y,_width,_height);

    }
  }
}

function drawLandmarks(detections){
  if(detections.length > 0){
    for(let f=0;f<detections.length; f++){
      let points = detections[f].landmarks.positions;
      for(let i=0;i<points.length;i++){
        stroke(44,169,225);
        strokeWeight(3);
        point(points[i]._x,points[i]._y); 
      }
    }
  }
}

function drawExpressions(detections, x, y, textYSpace){
  if(detections.length > 0){
    let {neutral, happy, angry, sad, disgusted, surprised, fearful} = detections[0].expressions;
    textFont('Helvetica Neue');
    textSize(14);
    noStroke();
    fill(44, 169, 225);

    text("neutral:       " + nf(neutral*100, 2, 2)+"%", x, y);
    text("happiness: " + nf(happy*100, 2, 2)+"%", x, y+textYSpace);
    text("angry:        " + nf(angry*100, 2, 2)+"%", x, y+textYSpace*2);
    text("sad:            "+ nf(sad*100, 2, 2)+"%", x, y+textYSpace*3);
    text("surprised:  " + nf(surprised*100, 2, 2)+"%", x, y+textYSpace*4);
  } else {
    text("neutral: ", x, y);
    text("happiness: ", x, y + textYSpace);
    text("angry: ", x, y + textYSpace*2);
    text("sad: ", x, y + textYSpace*3);
    text("surprised: ", x, y + textYSpace*4);
  }
}
