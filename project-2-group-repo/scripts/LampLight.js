const socket = new WebSocket("wss://homeassistant.local:8123/api/websocket");
var idNumber = 1;

socket.onopen = (event) => {
  console.log("WebSocket connection opened:", event);

  // Authenticate with Home Assistant
  socket.send(
    JSON.stringify({
      type: "auth",
      access_token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhMmM3MWI4YTdjZjU0NTdkOWVmZmVjMTI3ZTcyNmM0YyIsImlhdCI6MTcwMDI0MDU3NiwiZXhwIjoyMDE1NjAwNTc2fQ.qU9qQdmwScJHjUrVa9eSNRUUvaoMPUFfjzteBh-YYLw", // Replace with your Home Assistant access token
    })
  );
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received message:", data);

  // Process received messages if needed
};

socket.onclose = (event) => {
  console.log("WebSocket connection closed:", event);
};

function sendMessage(message) {
  console.log("Sending message:", message);
  socket.send(message);
}

function turnOnLight() {
  const message = JSON.stringify({
    id: idNumber,
    type: "call_service",
    domain: "light",
    service: "turn_on",
    service_data: {
      entity_id: "light.switch.thing2", // Replace with your light entity ID in Home Assistant
    },
  });
  idNumber++;
  sendMessage(message);
}

function turnOffLight() {
  const message = JSON.stringify({
    id: idNumber,
    type: "call_service",
    domain: "light",
    service: "turn_off",
    service_data: {
      entity_id: "light.switch.thing2", // Replace with your light entity ID in Home Assistant
    },
  });
  idNumber++;
  sendMessage(message);
}

function toggleLightSwitch() {
  const lightSwitch = document.getElementById("Light");
  if (lightSwitch.checked) {
    turnOnLight();
  } else {
    turnOffLight();
  }
}

// Attach event listener to toggle switch change
document.getElementById("Light").addEventListener("change", toggleLightSwitch);
