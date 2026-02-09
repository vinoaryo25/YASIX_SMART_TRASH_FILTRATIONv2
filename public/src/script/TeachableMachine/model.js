// ===================================
// TEACHABLE MACHINE CONFIGURATION
// ===================================
// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// The link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/3l6awQHO6/";

let model, webcam, labelContainer, maxPredictions;
let isIos = false;

// Threshold configuration
window.thresholdConfig = {
  threshold: 0.85,
  durationSeconds: 3,
};

// Threshold tracking for each class
window.classTracking = {
  Organik: { startTime: null, sent: false },
  Anorganik: { startTime: null, sent: false },
  B3: { startTime: null, sent: false },
};

// ===================================
// IOS DETECTION
// ===================================
// Fix when running demo in iOS, video will be frozen
if (
  window.navigator.userAgent.indexOf("iPhone") > -1 ||
  window.navigator.userAgent.indexOf("iPad") > -1
) {
  isIos = true;
}

// ===================================
// LOAD MODEL AND SETUP WEBCAM
// ===================================
async function init() {
  try {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // Load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    const width = 600;
    const height = 600;
    webcam = new tmImage.Webcam(width, height, flip);
    await webcam.setup(); // request access to the webcam

    if (isIos) {
      document.getElementById("webcam-container").appendChild(webcam.webcam);
      // webcam object needs to be added in any case to make this work on iOS
      // grab video-object in any way you want and set the attributes
      const webCamVideo = document.getElementsByTagName("video")[0];
      webCamVideo.setAttribute("playsinline", true); // written with "setAttribute" bc. iOS bugs otherwise
      webCamVideo.muted = "true";
      webCamVideo.style.width = width + "px";
      webCamVideo.style.height = height + "px";
    } else {
      document.getElementById("webcam-container").appendChild(webcam.canvas);
    }

    // Append elements to the DOM
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
      // and class labels
      labelContainer.appendChild(document.createElement("div"));
    }

    // Start webcam and prediction loop
    webcam.play();
    window.requestAnimationFrame(loop);

    document.getElementById("loadingScreen").classList.add("hidden");
  } catch (error) {
    console.error("Error initializing:", error);
    alert("Gagal memuat model. Silakan refresh halaman.");
  }
}

// ===================================
// PREDICTION LOOP
// ===================================
async function loop() {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
}

// ===================================
// RUN WEBCAM IMAGE THROUGH MODEL
// ===================================
async function predict() {
  // predict can take in an image, video or canvas html element
  let prediction;

  if (isIos) {
    prediction = await model.predict(webcam.webcam);
  } else {
    prediction = await model.predict(webcam.canvas);
  }

  let blankProbability = 0;
  let highestNonBlank = { className: null, probability: 0 };

  // Process predictions
  for (let i = 0; i < maxPredictions; i++) {
    const className = prediction[i].className;
    const probability = prediction[i].probability;

    // Update label display
    const classPrediction =
      className + ": " + (probability * 100).toFixed(1) + "%";
    labelContainer.childNodes[i].innerHTML = classPrediction;

    // Track BLANK probability
    if (className === "BLANK") {
      blankProbability = probability;
    }

    // Track highest non-BLANK prediction
    if (className !== "BLANK" && probability > highestNonBlank.probability) {
      highestNonBlank = { className, probability };
    }

    // Update visual progress bars (using function from script.js)
    if (window.updateProgressBar) {
      window.updateProgressBar(className, probability);
    }
  }

  // Main logic: Check thresholds (using function from script.js)
  if (window.checkThresholds) {
    window.checkThresholds(highestNonBlank, blankProbability);
  }
}

// ===================================
// START APPLICATION ON WINDOW LOAD
// ===================================
window.addEventListener("load", init);
