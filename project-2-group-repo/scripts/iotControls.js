// API Documentation on the link below
// https://developers.home-assistant.io/docs/api/websocket
// demoMove1 key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhOGNiMTNjZTJiN2Y0ZDFjYjk0MWM1YzFjYTRmN2YyMSIsImlhdCI6MTcwMDI1MDQxNywiZXhwIjoyMDE1NjEwNDE3fQ.xc0OTLmb-UVyHwM-ts1HP36neodPU5t4UzSy0i8OJsQ
const socket = new WebSocket("ws://homeassistant.local:8123/api/websocket");
var idNumber = 2; //Initial ID number

// List of input IDs
const doorBell = "camera.g8t1_sj02_3294_01vr"; //Name of Doorbell
const doorBellMotion = "blink G8T1-SJ02-3294-01VR Motion"; //Name of Doorbell Motion sensor?
const lampLight = "switch.thing2"; //Name of Lamp
const motionSensor = "binary_sensor.presence_sensor_fp2_1708_presence_sensor_1"; //Name of Motion Sensor
const luminSensor = "sensor.presence_sensor_fp2_1708_light_sensor_light_level"; //Name of Light sensor
const weightSensor = "sensor.smart_scale_c1_real_time_weight"; //Name of Weight sensor
const autoLeave = "automation.leave_off_light"; //Name of Automation1
const autoEnter = "automation.enter_for_light"; // Name of Automation2

// Upon starting up a connection we want to...
socket.onopen = async (event) => {
  console.log("WebSocket connection opened:", event);

  // ... first authenticate that it is us...
  socket.send(
    JSON.stringify({
      type: "auth",
      access_token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhOGNiMTNjZTJiN2Y0ZDFjYjk0MWM1YzFjYTRmN2YyMSIsImlhdCI6MTcwMDI1MDQxNywiZXhwIjoyMDE1NjEwNDE3fQ.xc0OTLmb-UVyHwM-ts1HP36neodPU5t4UzSy0i8OJsQ", // This is the group's access token
    })
  );

  // ... and subscribe to events that come out of the Home Assistant (Raspberry Pi)
  await socket.send(
    JSON.stringify({
      id: idNumber,
      type: "subscribe_events",
    })
  );
  idNumber++;
  //... as well as the states.
  await socket.send(
    JSON.stringify({
      id: idNumber,
      type: "get_states",
    })
  );
  console.log("getStates"); //debug
  idNumber++;
};

// When we receive a message, we want to...
socket.onmessage = (event) => {
  //... convert the incoming JSON into a usable form and then...
  const data1 = JSON.parse(event.data);
  // console.log("Received message:", data1); //debug
  // console.log("Stringified: ", JSON.stringify(data1)); //debug
  console.log("1)Type= ", data1.type); //debug

  try {
    //... first check if it is an "event" type message...
    if (data1.type == "event") {
      // ... and if it is, then it is a 'state change'...
      if (data1.event.event_type == "state_changed") {
        // ... of a device we are familiar with...
        const deviceID = data1.event.data.entity_id;
        console.log("2)EntityID: ", deviceID); //debug
        //... then we will act accordingly.
        switch (deviceID) {
          case lampLight:
            readLampLight(data1);
            break;
          case luminSensor:
            readLuminSensor(data1);
            break;
          case motionSensor:
            readMotionSensor(data1);
            break;
          case weightSensor:
            readWeightSensor(data1);
            break;
          default:
            //... unless we actually aren't familiar with it.
            console.log("3)Unlisted ID: ", deviceID);
            console.log("3)Payload: ", data1);
        }
      } else {
        readOtherDataType(data1);
      }
    }
  } catch (error) {
    console.error("Error: Uncooperative JSON ", error);
    console.log("Problem JSON: ", JSON.stringify(JSON.parse(event.data)));
  }
};

socket.onclose = (event) => {
  console.log("WebSocket connection closed:", event); //debug
};

function sendMessage(message) {
  console.log("Sending message:", message); //debug
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

//Function to flick light switch
function flickSwitch(buttonID) {
  const button = document.getElementById(buttonID);
  if (button.checked == true) {
    turnOnSwitch();
  } else if (button.checked == false) {
    turnOffSwitch();
  }
}

// How we deal with reading lamplight statuses from the Pi
function readLampLight(data1) {
  //REPLACE ALL OF THESE WITH APPROPRIATE ACTIONS!
  const offLight = document.getElementById("fancyTest-OFF"); //CHANGE
  const onLight = document.getElementById("fancyTest-ON"); //CHANGE
  const newState = data1.event.data.new_state.state;
  if (newState == "on") {
    onLight.style.color = "green"; //CHANGE
    offLight.style.color = "red"; //CHANGE
  } else if (newState == "off") {
    onLight.style.color = "red"; //CHANGE
    offLight.style.color = "green"; //CHANGE
  } else {
    console.log("Error: Unknown new light state: ", newState);
  }
}

//How we deal with reading the luminosity levels on the motion sensor
function readLuminSensor(data1) {
  //REPLACE ALL OF THIS WITH APPROPRIATE THINGS
  const fLumUp = document.getElementById("fancyTest-LightUp"); //CHANGE
  const fLumDown = document.getElementById("fancyTest-LightDown"); //CHANGE
  const newState = data1.event.data.new_state.state;
  const oldState = data1.event.data.old_state.state;
  if (newState > oldState) {
    fLumUp.style.color = "green"; //CHANGE
    fLumDown.style.color = "red"; //CHANGE
  } else if (newState <= oldState) {
    fLumUp.style.color = "red"; //CHANGE
    fLumDown.style.color = "green"; //CHANGE
  } else {
    console.log("Error: Luminosity level transition unknown");
    console.log("New state= ", newState, "; Old state = ", oldState);
  }
}

//How we deal with reading the motion sensor detecting motion
function readMotionSensor(data1) {
  //REPLACE WITH ALL APPROPRIATE STUFF
  const mLeft = document.getElementById("fancyTest-MotionLeft"); //CHANGE
  const mEnter = document.getElementById("fancyTest-MotionEnter"); //CHANGE
  const mPresence = document.getElementById("fancyTest-MotionPresence"); //CHANGE
  const newState = data1.event.data.new_state.state;
  console.log("Motion: ", data1); //DEBUG
  if (newState == "on") {
    mPresence.style.color = "green"; //CHANGE
    mLeft.style.color = "red"; //CHANGE
  } else if (newState == "off") {
    mPresence.style.color = "red"; //CHANGE
    mLeft.style.color = "green"; //CHANGE
  } else {
    console.log("Error: Unknown motion detector state detected: ", newState);
  }
}

//How we deal with reading other event types and data
function readOtherDataType(data1) {
  const eventType = data1.event.event_type;
  switch (eventType) {
    case "call_service":
      console.log("3)Event Type: call_service");
      console.log("3)Payload: ", data1);
      break;
    case "config_entry_discovered":
      console.log("3)Event Type: config_entry_discovered");
      console.log("3)Payload: ", data1);
      break;
    case "recorder_5min_statistics_generated":
      console.log("3)Event Type: recorder_5min_statistics_generated");
      console.log("3)Payload: ", data1);
      break;
    default:
      console.log("3)Unlisted event type: ", eventType);
      console.log("3)Payload: ", data1);
      break;
  }
}

//How we deal with readings from the weight sensor; it detects and stores the value in KG
function readWeightSensor(data1) {
  //REPLACE ALL ITEMS IN THIS AREA WITH APPROPRIATE FUNCTIONS
  const weightText = document.getElementById("fancyTestWeight"); //CHANGE
  const givenWeightkgs = data1.event.data.new_state.state;
  const givenWeightlbs = givenWeightkgs * 2.2;
  weightText.innerHTML = `Weight = ${givenWeightkgs}kgs or ${givenWeightlbs}lbs`; //CHANGE
}

console.log("IoT controls loaded"); //debug
