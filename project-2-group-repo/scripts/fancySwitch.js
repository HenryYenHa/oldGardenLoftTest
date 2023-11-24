// API Documentation on the link below
// https://developers.home-assistant.io/docs/api/websocket
// demoMove1 key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhOGNiMTNjZTJiN2Y0ZDFjYjk0MWM1YzFjYTRmN2YyMSIsImlhdCI6MTcwMDI1MDQxNywiZXhwIjoyMDE1NjEwNDE3fQ.xc0OTLmb-UVyHwM-ts1HP36neodPU5t4UzSy0i8OJsQ
const socket = new WebSocket("ws://homeassistant.local:8123/api/websocket");
var idNumber = 1; //Initial ID number

//LIST OF DEVICES/INPUTS FROM PI
const lampLight = "switch.thing2"; //Name of Lamp
const motionSensor = "binary_sensor.presence_sensor_fp2_1708_presence_sensor_1"; //Name of Motion Sensor
const luminositySensor =
  "sensor.presence_sensor_fp2_1708_light_sensor_light_level"; //Name of Light sensor
const weightScale = "sensor.smart_scale_c1_weight"; //Name of Weight scale

const autoLeave = "automation.leave_off_light"; //Name of Automation1
const autoEnter = "automation.enter_for_light"; // Name of Automation2

socket.onopen = async (event) => {
  console.log("WebSocket connection opened:", event);

  // Authenticate with Home Assistant
  socket.send(
    JSON.stringify({
      type: "auth",
      access_token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhOGNiMTNjZTJiN2Y0ZDFjYjk0MWM1YzFjYTRmN2YyMSIsImlhdCI6MTcwMDI1MDQxNywiZXhwIjoyMDE1NjEwNDE3fQ.xc0OTLmb-UVyHwM-ts1HP36neodPU5t4UzSy0i8OJsQ", // This is the group's access token
    })
  );

  // Subscribe to events (optional)
  socket.send(
    JSON.stringify({
      id: 0,
      type: "subscribe_events",
    })
  );
};

socket.onmessage = (event) => {
  const data1 = JSON.parse(event.data);
  // console.log("Received message:", data1);
  // const checkThis = JSON.stringify(data1);

  console.log("Type= ", data1.type);
  if (data1.type == "event") {
    const deviceID = data1.event.data.entity_id;
    console.log("EntityID: ", deviceID);
    switch (deviceID) {
      case lampLight:
        console.log("LampD: ", data1);
        break;
      case luminositySensor:
        console.log("LuminSen: ", data1);
        // code block
        break;
      case motionSensor:
        console.log("MotionSen: ", data1);
        break;
      case weightScale:
        console.log("WeightSca: ", data1);
        break;

      default:
        console.log("Unidentified ID: ", deviceID);
    }
  }
};

socket.onclose = (event) => {
  console.log("WebSocket connection closed:", event);
};

function sendMessage(message) {
  console.log("Sending message:", message);
  socket.send(message);
}

function turnOnSwitch() {
  // Example: Send a command to turn on Switch
  const message = JSON.stringify({
    id: idNumber,
    type: "call_service",
    domain: "switch",
    service: "turn_on",
    service_data: {
      entity_id: "switch.thing2", // Replace with your switch entity ID
    },
  });
  idNumber++;
  sendMessage(message);
}

function turnOffSwitch() {
  // Example: Send a command to turn off Switch
  const message = JSON.stringify({
    id: idNumber,
    type: "call_service",
    domain: "switch",
    service: "turn_off",
    service_data: {
      entity_id: "switch.thing2", // Replace with your switch entity ID
    },
  });
  idNumber++;
  sendMessage(message);
}

function flickSwitch(buttonID) {
  const button = document.getElementById(buttonID);
  if (button.checked == true) {
    turnOnSwitch();
  } else if (button.checked == false) {
    turnOffSwitch();
  }
}
