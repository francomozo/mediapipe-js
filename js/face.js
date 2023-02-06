const video = document.getElementsByClassName('input_video')[0];
const output = document.getElementsByClassName('output')[0];
const controlsElements = document.getElementsByClassName('control-panel')[0];
const canvasCtx = output.getContext('2d');
const fpsControl = new FPS();



function onResultsFace(results) {
  document.body.classList.add('loaded');
  fpsControl.tick();
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, output.width, output.height);
  canvasCtx.drawImage(
      results.image, 0, 0, output.width, output.height);
  if (results.detections.length > 0) {
    drawRectangle(
        canvasCtx, results.detections[0].boundingBox,
        {color: 'blue', lineWidth: 4, fillColor: '#00000000'});
    drawLandmarks(canvasCtx, results.detections[0].landmarks, {
      color: 'red',
      radius: 5,
    });
  }
  canvasCtx.restore();
}

const faceDetection = new FaceDetection({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.0/${file}`;
}});
faceDetection.onResults(onResultsFace);

const camera = new Camera(video, {
  onFrame: async () => {
    await faceDetection.send({image: video});
  },
  width: 480,
  height: 480
});
camera.start();

new ControlPanel(controlsElements, {
      selfieMode: true,
      minDetectionConfidence: 0.5,
    })
    .add([
      new StaticText({title: 'MediaPipe Face Detection'}),
      fpsControl,
      new Toggle({title: 'Selfie Mode', field: 'selfieMode'}),
      new Slider({
        title: 'Min Detection Confidence',
        field: 'minDetectionConfidence',
        range: [0, 1],
        step: 0.01
      }),
    ])
    .on(options => {
      video.classList.toggle('selfie', options.selfieMode);
      faceDetection.setOptions(options);
    });