let port;
let reader;
let writer;
let temperature = 0; // Initialize temperature variable
let humidity = 0;    // Initialize humidity variable

function setup() {
  createCanvas(400, 400);
  
  let connectButton = createButton('Connect to Arduino');
  connectButton.mousePressed(connectToArduino);
}

async function connectToArduino() {
  try {
    const selectedPort = await navigator.serial.requestPort();
    port = selectedPort;

    // Open the serial port with the appropriate baud rate
    await port.open({ baudRate: 9600 });
    console.log("Port successfully opened!");

    // Create the read/write streams
    const textDecoder = new TextDecoderStream();
    const textEncoder = new TextEncoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);

    reader = textDecoder.readable
      .pipeThrough(new TransformStream(new LineBreakTransformer()))
      .getReader();
    writer = textEncoder.writable.getWriter();

    // Start reading data from the serial port
    runSerial();

  } catch (error) {
    console.error("Failed to open the serial port:", error);
  }
}

async function runSerial() {
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        reader.releaseLock();
        break;
      }
      readSerial(value);  // Process the serial data
    }
  } catch (e) {
    console.error(e);
  }
}

function readSerial(data) {
  let values = data.split(',');
  if (values.length == 2) {
    temperature = float(values[0]);
    humidity = float(values[1]);
  }
}

function draw() {
  background(220);

  textSize(24);
  text("Temperature: " + temperature*(9/5)+32 + " °F", 20, 100);
  text("Humidity: " + humidity + " %", 20, 150);
}

class LineBreakTransformer {
  constructor() {
    this.chunks = "";
  }

  transform(chunk, controller) {
    this.chunks += chunk;
    const lines = this.chunks.split("\r\n");
    this.chunks = lines.pop();
    lines.forEach((line) => controller.enqueue(line));
  }

  flush(controller) {
    controller.enqueue(this.chunks);
  }
}
