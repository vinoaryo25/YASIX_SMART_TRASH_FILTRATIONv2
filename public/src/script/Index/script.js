// ===================================
// UI HELPER FUNCTIONS
// ===================================

/**
 * Update progress bar and percentage display
 * @param {string} className - The class name (Organik, Anorganik, B3)
 * @param {number} probability - The probability value (0-1)
 */

function updateProgressBar(className, probability) {
  const percentage = (probability * 100).toFixed(1);

  const barMap = {
    Organik: {
      progress: "organikProgress",
      percent: "organikPercent",
      bar: "organikBar",
    },
    Anorganik: {
      progress: "anorganikProgress",
      percent: "anorganikPercent",
      bar: "anorganikBar",
    },
    B3: { progress: "b3Progress", percent: "b3Percent", bar: "b3Bar" },
  };

  if (barMap[className]) {
    const elements = barMap[className];
    document.getElementById(elements.progress).style.width = percentage + "%";
    document.getElementById(elements.percent).textContent = percentage + "%";

    // Add active class if above threshold
    const barElement = document.getElementById(elements.bar);
    if (probability >= window.thresholdConfig.threshold) {
      barElement.classList.add("active");
    } else {
      barElement.classList.remove("active");
    }
  }
}

/**
 * Show countdown timer on trash bar
 * @param {string} className - The class name
 * @param {number} seconds - Seconds remaining
 */
function showCountdown(className, seconds) {
  const timerMap = {
    Organik: "organikTimer",
    Anorganik: "anorganikTimer",
    B3: "b3Timer",
  };

  if (timerMap[className]) {
    const timerElement = document.getElementById(timerMap[className]);
    timerElement.textContent = seconds;
    timerElement.classList.add("show");
  }
}

/**
 * Hide countdown timer on trash bar
 * @param {string} className - The class name
 */
function hideCountdown(className) {
  const timerMap = {
    Organik: "organikTimer",
    Anorganik: "anorganikTimer",
    B3: "b3Timer",
  };

  if (timerMap[className]) {
    const timerElement = document.getElementById(timerMap[className]);
    timerElement.classList.remove("show");
  }
}

/**
 * Reset all class tracking states
 */
function resetAllTracking() {
  for (const className in window.classTracking) {
    window.classTracking[className].startTime = null;
    window.classTracking[className].sent = false;
    hideCountdown(className);
  }
}

/**
 * Send prediction data to API
 * @param {string} className - The predicted class name
 * @param {number} probability - The probability value
 */
async function sendPredictionAPI(className, probability) {
  // const statusMessage = document.getElementById("statusMessage");

  try {
    // Show status message
    // statusMessage.textContent = `MENGIRIM DATA: ${className}`;
    // statusMessage.classList.add("show");

    await Swal.fire({
      title: "Success!",
      text: "Data sent successfully!",
      icon: "success",
      showCancelButton: false, // There won't be any cancel button
      showConfirmButton: false,
      customClass: "notif-swal",
      timer: 2000,
    });

    // Send API request
    const response = await fetch("/api/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        className: className,
        probability: probability,
      }),
    });

    if (response.ok) {
      console.log(
        `API request successful for ${className} with probability ${probability}`,
      );
    } else {
      console.error("API request failed:", response.statusText);
      // statusMessage.textContent = `✗ GAGAL KIRIM: ${className}`;
    }

    // Hide message after 3 seconds
    setTimeout(() => {
      // statusMessage.classList.remove("show");
    }, 3000);
  } catch (error) {
    console.error("Error sending API request:", error);
    // statusMessage.textContent = `✗ ERROR: ${error.message}`;
    setTimeout(() => {
      // statusMessage.classList.remove("show");
    }, 3000);
  }
}

/**
 * Check if predictions meet threshold requirements
 * @param {Object} highestNonBlank - Object containing className and probability
 * @param {number} blankProbability - BLANK class probability
 */
function checkThresholds(highestNonBlank, blankProbability) {
  const currentTime = Date.now();

  // If BLANK is above threshold, reset all tracking
  if (blankProbability > window.thresholdConfig.threshold) {
    resetAllTracking();
    return;
  }

  // Check if highest non-BLANK class is above threshold
  if (
    highestNonBlank.className &&
    highestNonBlank.probability >= window.thresholdConfig.threshold
  ) {
    const tracking = window.classTracking[highestNonBlank.className];

    if (!tracking.startTime) {
      // Start tracking this class
      tracking.startTime = currentTime;
      tracking.sent = false;
      showCountdown(highestNonBlank.className, 3);
    } else {
      // Check if duration threshold is met
      const elapsedSeconds = (currentTime - tracking.startTime) / 1000;
      const remainingSeconds = Math.ceil(
        window.thresholdConfig.durationSeconds - elapsedSeconds,
      );

      if (remainingSeconds > 0) {
        showCountdown(highestNonBlank.className, remainingSeconds);
      }

      if (
        elapsedSeconds >= window.thresholdConfig.durationSeconds &&
        !tracking.sent
      ) {
        // Send API request
        sendPredictionAPI(
          highestNonBlank.className,
          highestNonBlank.probability,
        );
        tracking.sent = true;
        hideCountdown(highestNonBlank.className);
      }
    }

    // Reset other classes
    for (const className in window.classTracking) {
      if (className !== highestNonBlank.className) {
        window.classTracking[className].startTime = null;
        window.classTracking[className].sent = false;
        hideCountdown(className);
      }
    }
  } else {
    // No class above threshold, reset all
    resetAllTracking();
  }
}

// Make functions available globally
window.updateProgressBar = updateProgressBar;
window.showCountdown = showCountdown;
window.hideCountdown = hideCountdown;
window.resetAllTracking = resetAllTracking;
window.sendPredictionAPI = sendPredictionAPI;
window.checkThresholds = checkThresholds;
