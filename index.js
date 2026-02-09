const express = require("express");
const path = require("path");
const { arduino_listen, arduino_init } = require("./handler/handleArduino");

// ============================================
// CONFIGURATION
// ============================================
const PORT = process.env.PORT || 3000;

// ============================================
// ANSI COLOR CODES FOR STYLING
// ============================================
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",

  // Foreground colors
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",

  // Background colors
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
};

// ============================================
// STYLED CONSOLE FUNCTIONS
// ============================================

/**
 * Print startup banner
 */
function printBanner() {
  console.log("\n");
  console.log(
    colors.green +
      colors.bright +
      "╔═══════════════════════════════════════════════════════════╗" +
      colors.reset,
  );
  console.log(
    colors.green +
      colors.bright +
      "║                                                           ║" +
      colors.reset,
  );
  console.log(
    colors.green +
      colors.bright +
      "║           " +
      colors.cyan +
      "🌿 YASIX SMART TRASH FILTRATION 🌿" +
      colors.green +
      "          ║" +
      colors.reset,
  );
  console.log(
    colors.green +
      colors.bright +
      "║                                                           ║" +
      colors.reset,
  );
  console.log(
    colors.green +
      colors.bright +
      "║               " +
      colors.white +
      "SMK YADIKA 6 JATIWARINGIN" +
      colors.green +
      "               ║" +
      colors.reset,
  );
  console.log(
    colors.green +
      colors.bright +
      "║                                                           ║" +
      colors.reset,
  );
  console.log(
    colors.green +
      colors.bright +
      "╚═══════════════════════════════════════════════════════════╝" +
      colors.reset,
  );
  console.log("\n");
}

/**
 * Print server info
 */
function printServerInfo(port) {
  const timestamp = new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour12: false,
  });

  console.log(
    colors.cyan +
      "┌─────────────────────────────────────────────────────────┐" +
      colors.reset,
  );
  console.log(
    colors.cyan +
      "│ " +
      colors.bright +
      "SERVER INFORMATION" +
      colors.reset +
      colors.cyan +
      "                                    │" +
      colors.reset,
  );
  console.log(
    colors.cyan +
      "├─────────────────────────────────────────────────────────┤" +
      colors.reset,
  );
  console.log(
    colors.cyan +
      "│" +
      colors.reset +
      " 🚀 Status:        " +
      colors.green +
      colors.bright +
      "ONLINE" +
      colors.reset +
      "                              " +
      colors.cyan +
      "│" +
      colors.reset,
  );
  console.log(
    colors.cyan +
      "│" +
      colors.reset +
      " 🌐 Port:          " +
      colors.yellow +
      port +
      colors.reset +
      "                                  " +
      colors.cyan +
      "│" +
      colors.reset,
  );
  console.log(
    colors.cyan +
      "│" +
      colors.reset +
      " 🔗 Local URL:     " +
      colors.blue +
      `http://localhost:${port}` +
      colors.reset +
      "              " +
      colors.cyan +
      "│" +
      colors.reset,
  );
  console.log(
    colors.cyan +
      "│" +
      colors.reset +
      " ⏰ Started At:    " +
      colors.magenta +
      timestamp +
      colors.reset +
      "       " +
      colors.cyan +
      "│" +
      colors.reset,
  );
  console.log(
    colors.cyan +
      "│" +
      colors.reset +
      " 📁 View Engine:   " +
      colors.white +
      "EJS" +
      colors.reset +
      "                                 " +
      colors.cyan +
      "│" +
      colors.reset,
  );
  console.log(
    colors.cyan +
      "└─────────────────────────────────────────────────────────┘" +
      colors.reset,
  );
  console.log("\n");
  console.log(
    colors.dim +
      "  Press " +
      colors.bright +
      "CTRL+C" +
      colors.reset +
      colors.dim +
      " to stop the server" +
      colors.reset,
  );
  console.log("\n");
}

/**
 * Print prediction log with styling
 */
function printPrediction(className, probability) {
  const timestamp = new Date().toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour12: false,
  });

  const percentage = Math.round(probability * 100);

  // Determine trash icon and color
  let icon, color, trashType;
  switch (className) {
    case "Organik":
      icon = "🌿";
      color = colors.green;
      trashType = "ORGANIK   ";
      break;
    case "Anorganik":
      icon = "♻️";
      color = colors.cyan;
      trashType = "ANORGANIK ";
      break;
    case "B3":
      icon = "☣️";
      color = colors.red;
      trashType = "B3        ";
      break;
    default:
      icon = "📦";
      color = colors.white;
      trashType = className.padEnd(10);
  }

  // Create progress bar
  const barLength = 20;
  const filledLength = Math.round((percentage / 100) * barLength);
  const emptyLength = barLength - filledLength;
  const progressBar = "█".repeat(filledLength) + "░".repeat(emptyLength);

  console.log(
    colors.yellow +
      "┌─────────────────────────────────────────────────────────┐" +
      colors.reset,
  );
  console.log(
    colors.yellow +
      "│ " +
      colors.bright +
      "📊 PREDICTION RECEIVED" +
      colors.reset +
      colors.yellow +
      "                                │" +
      colors.reset,
  );
  console.log(
    colors.yellow +
      "├─────────────────────────────────────────────────────────┤" +
      colors.reset,
  );
  console.log(
    colors.yellow +
      "│" +
      colors.reset +
      " ⏱️  Time:         " +
      colors.dim +
      timestamp +
      colors.reset +
      "                        " +
      colors.yellow +
      "│" +
      colors.reset,
  );
  console.log(
    colors.yellow +
      "│" +
      colors.reset +
      " " +
      icon +
      "  Class:        " +
      color +
      colors.bright +
      trashType +
      colors.reset +
      "                            " +
      colors.yellow +
      "│" +
      colors.reset,
  );
  console.log(
    colors.yellow +
      "│" +
      colors.reset +
      " 📈 Probability:   " +
      color +
      colors.bright +
      percentage +
      "%" +
      colors.reset +
      "                               " +
      colors.yellow +
      "│" +
      colors.reset,
  );
  console.log(
    colors.yellow +
      "│" +
      colors.reset +
      " 📊 Confidence:    " +
      color +
      progressBar +
      colors.reset +
      "              " +
      colors.yellow +
      "│" +
      colors.reset,
  );
  console.log(
    colors.yellow +
      "└─────────────────────────────────────────────────────────┘" +
      colors.reset,
  );
  console.log("\n");
}

/**
 * Print route access log
 */
function printRouteAccess(method, route, ip) {
  const timestamp = new Date().toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour12: false,
  });

  const methodColor = method === "GET" ? colors.green : colors.blue;

  console.log(
    colors.dim +
      `[${timestamp}]` +
      colors.reset +
      " " +
      methodColor +
      colors.bright +
      method.padEnd(4) +
      colors.reset +
      " " +
      colors.white +
      route.padEnd(20) +
      colors.reset +
      " " +
      colors.dim +
      `(${ip})` +
      colors.reset,
  );
}

// ============================================
// APP INITIALIZATION
// ============================================
const app = express();

// ============================================
// MIDDLEWARE
// ============================================
app.set("view engine", "ejs");
app.set("views", "public/pages");
app.use(express.static(path.join(__dirname, "public/src")));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Custom logging middleware
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  printRouteAccess(req.method, req.path, ip);
  next();
});

// ARDUINO HANDLER

arduino_init();

// ============================================
// ROUTES
// ============================================

app.get("/", (req, res) => {
  res.render("index.ejs");
});

// ============================================
// API ENDPOINTS
// ============================================

app.post("/api/predict", (req, res) => {
  const { className, probability } = req.body;

  // Print styled prediction log
  printPrediction(className, probability);

  // Send data to arduino

  arduino_listen(className);

  res.json({
    success: true,
    message: "Prediction received successfully",
    data: {
      className,
      probability,
      percentage: Math.round(probability * 100) + "%",
    },
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res) => {
  console.log(
    colors.red + "❌ 404 Not Found: " + colors.white + req.path + colors.reset,
  );
  res.status(404).send("404 - Not Found");
});

// Error Handler
app.use((err, req, res, next) => {
  console.log("\n" + colors.red + colors.bright + "❌ ERROR:" + colors.reset);
  console.log(colors.red + err.stack + colors.reset + "\n");
  res.status(500).send("500 - Internal Server Error");
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  printBanner();
  printServerInfo(PORT);

  console.log(
    colors.green + "✅ Server ready to receive predictions!" + colors.reset,
  );
  console.log(
    colors.dim + "   Waiting for AI classifications..." + colors.reset,
  );
  console.log("\n" + "─".repeat(61) + "\n");
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on("SIGINT", () => {
  console.log("\n\n");
  console.log(colors.yellow + "⚠️  Shutting down server..." + colors.reset);
  console.log(colors.green + "✅ Server stopped successfully!" + colors.reset);
  console.log(
    colors.cyan +
      "👋 Terima kasih telah menggunakan YASIX Smart Trash Filtration!" +
      colors.reset,
  );
  console.log("\n");
  process.exit(0);
});
