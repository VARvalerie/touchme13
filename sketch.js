var myCapture, myVida;

var webSocket = new WebSocket('ws://localhost:9001/');

var patternA = [true, true, false, false, false]

var patternB = [true, true, true, false, false]

function checkPattern (_pattern){ // to make several triggers act like additional trigger
  for(var i = 0; i <  _pattern.lenght; i++){
    if(_pattern[i] !== myVida.acttiveZones[i].isMovementDetectedFlag){
      return false;
    }
  }
  return true;
}



function initCaptureDevice() {
  try {
    myCapture = createCapture(VIDEO);
    myCapture.size(320, 240);
    myCapture.elt.setAttribute('playsinline', '');
    myCapture.hide();
    console.log(
      '[initCaptureDevice] capture ready. Resolution: ' +
      myCapture.width + ' ' + myCapture.height
    );
  } catch(_err) {
    console.log('[initCaptureDevice] capture error: ' + _err);
  }
}

function setup() {
  createCanvas(640, 480);
  initCaptureDevice();
  myVida = new Vida();
  myVida.progressiveBackgroundFlag = true;
  myVida.imageFilterFeedback = 0.92;
  myVida.imageFilterThreshold = 0.15;
  myVida.mirror = myVida.MIRROR_HORIZONTAL;
  myVida.handleActiveZonesFlag = true;
  myVida.setActiveZonesNormFillThreshold(0.02);
  var padding = 0.07; var n = 5;
  var zoneWidth = 0.1; var zoneHeight = 0.5;
  var hOffset = (1.0 - (n * zoneWidth + (n - 1) * padding)) / 2.0;
  var vOffset = 0.25;
  for(var i = 0; i < n; i++) {
    myVida.addActiveZone(
      i,
      hOffset + i * (zoneWidth + padding), vOffset, zoneWidth, zoneHeight,
      onActiveZoneChange// this is a name of the function that is called when zone is changing status
    );
  }
  frameRate(30);
}

function draw() {
  if(myCapture !== null && myCapture !== undefined) {
    background(0, 0, 255);
    myVida.update(myCapture);
    image(myVida.currentImage, 0, 0, width, height);
    //image(myVida.backgroundImage, 0, 0, width, height);
    //image(myVida.differenceImage, 0, 0, width, height);
    //image(myVida.thresholdImage, 0, 0, width, height);
    myVida.drawActiveZones(0, 0, width, height);
  }
  else {
    background(255, 0, 0);
  }
}

function mouseReleased() {
  webSocket.send(['test', millis()]);
}

webSocket.onmessage = function(message) {
  //console.log('message', message, message.data);
  var message = message.data.split(' ');
  console.log('message', message);
};

webSocket.onopen = function() {
  console.log('connected');
};

webSocket.onclose = function() {
  console.log('not connected');
};

function detectCurrentPattern() {
var patternATriggered = checkPattern(patternA);
  if (patternATriggered) {
    console.log ('patternATriggered');
    return 1;
  }
  var patternBTriggered = checkPattern(patternB)
  if(patternBTriggered) {
    console.log ('patternBTriggered')
    return 2;
  }
  return -1;
}

function onActiveZoneChange(_vidaActiveZone) {
  var temp_pattern = detectCurrentPattern ();
  if(temp_pattern >= 0 ){
    console.log (temp_pattern)
    webSocket.send([
      'pattern',
      temp_pattern
    ]);
  }
  else {

  //console.log(
    //'zone: ' + _vidaActiveZone.id +
    //' status: ' + _vidaActiveZone.isMovementDetectedFlag
  //);
webSocket.send ([//square brackets mean we put a list
  'zone',
  _vidaActiveZone.id  + ' ' + _vidaActiveZone.isMovementDetectedFlag
  ]);
}
  
}