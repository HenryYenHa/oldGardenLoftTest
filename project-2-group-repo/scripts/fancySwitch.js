// API Documentation on the link below
// https://developers.home-assistant.io/docs/api/websocket
// demoMove1 key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhOGNiMTNjZTJiN2Y0ZDFjYjk0MWM1YzFjYTRmN2YyMSIsImlhdCI6MTcwMDI1MDQxNywiZXhwIjoyMDE1NjEwNDE3fQ.xc0OTLmb-UVyHwM-ts1HP36neodPU5t4UzSy0i8OJsQ
const socket = new WebSocket("ws://homeassistant.local:8123/api/websocket");
var idNumber = 2; //Initial ID number

const lampLight = "switch.thing2"; //Name of Lamp
const motionSensor = "binary_sensor.presence_sensor_fp2_1708_presence_sensor_1"; //Name of Motion Sensor
const luminSensor = "sensor.presence_sensor_fp2_1708_light_sensor_light_level"; //Name of Light sensor
const weightSensor = "sensor.smart_scale_c1_real_time_weight"; //Name of Weight sensor
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

  //Subscribe to Events to listen to devices
  await socket.send(
    JSON.stringify({
      id: idNumber,
      type: "subscribe_events",
    })
  );
  idNumber++;
  //Request states of things
  await socket.send(
    JSON.stringify({
      id: idNumber,
      type: "get_states",
    })
  );
  console.log("getStates");
  idNumber++;
};

socket.onmessage = (event) => {
  const data1 = JSON.parse(event.data);
  // console.log("Received message:", data1); //debug
  // console.log("Stringified: ", JSON.stringify(data1)); //debug
  console.log("Type= ", data1.type); //debug

  try {
    //In the 'event' that...
    if (data1.type == "event") {
      // ...it is a 'state change'...
      if (data1.event.event_type == "state_changed") {
        // ... of a device we are familiar with...
        const deviceID = data1.event.data.entity_id;
        console.log("EntityID: ", deviceID); //debug
        //Act accordingly

        switch (deviceID) {
          case lampLight:
            const offLight = document.getElementById("fancyTest-OFF");
            const onLight = document.getElementById("fancyTest-ON");
            if (data1.event.data.new_state.state == "on") {
              onLight.style.color = "green";
              offLight.style.color = "red";
            } else if (data1.event.data.new_state.state) {
              onLight.style.color = "red";
              offLight.style.color = "green";
            } else {
              console.log("LIGHTUNKNOWN");
            }
            break;
          case luminSensor:
            console.log("LIGHTSSSSSSSS: ", data1);
            const fLumUp = document.getElementById("fancyTest-LightUp");
            const fLumDown = document.getElementById("fancyTest-LightDown");
            if (
              data1.event.data.new_state.state >
              data1.event.data.old_state.state
            ) {
              fLumUp.style.color = "green";
              fLumDown.style.color = "red";
            } else if (
              data1.event.data.new_state.state <=
              data1.event.data.old_state.state
            ) {
              fLumUp.style.color = "red";
              fLumDown.style.color = "green";
            } else {
              console.log("LUMUNKNOWN");
            }
            break;
          case motionSensor:
            const mLeft = document.getElementById("fancyTest-MotionLeft");
            const mEnter = document.getElementById("fancyTest-MotionEnter");
            const mPresence = document.getElementById(
              "fancyTest-MotionPresence"
            );
            console.log("Motion: ", data1);
            if (data1.event.data.new_state.state == "on") {
              mPresence.style.color = "green";
              mLeft.style.color = "red";
            } else if (data1.event.data.new_state.state == "off") {
              mPresence.style.color = "red";
              mLeft.style.color = "green";
            } else {
              console.log("MOTIONUKNOWN");
            }
            break;
          case weightSensor:
            console.log("WeightS: ", data1);
          default:
            //... unless we actually aren't familiar with it.
            console.log("Unlisted ID");
        }
      } else if (data1.event.data.event_type == "call_service") {
        console.log("CalledService");
      } else {
        // Known event types: (["call_service","config_entry_discovered"])
        console.log("Strange event type: ", data1.event.data.event_type);
        console.log("Data Problem: ", data1);
      }
    }
  } catch (error) {
    console.error("Error: Uncooperative JSON", error);
    console.log("Problem JSON: ", JSON.stringify(JSON.parse(event.data)));
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
