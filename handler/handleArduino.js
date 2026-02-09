const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const PORT = "COM3";

const port = new SerialPort({
  path: PORT,
  baudRate: 9600,
  parser: new ReadlineParser({ delimiter: "\n" }),
});
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

const arduino_init = async () => {
  port.on("open", () => {
    console.log(`serial port open on ${PORT}`);
  });

  parser.on("data", (data) => {
    console.log(PORT, ": ", data);
  });
};

const arduino_listen = (CLASS_NAME) => {
  switch (CLASS_NAME.toLowerCase()) {
    case "organik":
      port.write("A\n", (err) => {
        if (err) {
          return console.log("Error on write: ", err.message);
        }
        console.log("Succes sending ORGANIK (A) Signal to Arduino");
      });
      break;
    case "anorganik":
      port.write("B\n", (err) => {
        if (err) {
          return console.log("Error on write: ", err.message);
        }
        console.log("Succes sending ANORGANIK (B) Signal to Arduino");
      });
      break;
    case "b3":
      port.write("C\n", (err) => {
        if (err) {
          return console.log("Error on write: ", err.message);
        }
        console.log("Succes sending B3 (C) Signal to Arduino");
      });
      break;
    default:
      console.log("Invalid CLASS_NAME provided.");
  }
};

module.exports = { arduino_listen, arduino_init };
