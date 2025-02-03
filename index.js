const { io } = require("socket.io-client");
const Ant = require("gd-ant-plus");

const socket = io("https://chess-api.buildarocket.com");

var stick1 = new Ant.GarminStick2();

let playerMap = [
  {
    playerName: "Abdusattorov",
    deviceID: 9885,
    fideID: 14204118,
    sensor: new Ant.HeartRateSensor(stick1),
  },
  {
    playerName: "Keymer",
    deviceID: 3127,
    fideID: 12940690,
    sensor: new Ant.HeartRateSensor(stick1),
  },
];

stick1.on("startup", function () {
  console.log("startup");
  attachSensors();
  function attachSensors() {
    // playerMap[0].sensor.attach(0, playerMap[0].deviceID);
    // playerMap.slice(1).forEach((player, prevIndex) => {
    //   playerMap[prevIndex].sensor.on("attached", () => {
    //     console.log(playerMap[prevIndex].playerName, "attached");
    //     //wait for prev sensor to be attached
    //     player.sensor.attach(prevIndex + 1, player.deviceID);
    //   });
    // });

    playerMap.forEach((player, i) => {
      player.sensor.attach(i, player.deviceID);
    });
  }

  //playerMap[1].sensor.attach(0, 0);

  //sensor1.attach(0, 0);
});

addHBEventListeners();
function addHBEventListeners() {
  playerMap.forEach((player) => {
    player.sensor.on("hbData", (hbData) => {
      console.log(player.playerName, hbData.DeviceID, hbData.ComputedHeartRate);
      const data = {
        playerData: { name: player.playerName, fideID: player.fideID },
        hbData: hbData,
      };
      socket.emit("hbData", data);
    });
  });
}

if (!stick1.open()) {
  console.log("Stick not found!");
}
