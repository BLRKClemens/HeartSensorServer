const { io } = require("socket.io-client");
const Ant = require("gd-ant-plus");

const socket = io("http://192.168.11.182:3000");

var stick1 = new Ant.GarminStick2();
let playerMap = [
  {
    playerName: "Nakamura",
    deviceID: 61433,
    fideID: 2016192,
    sensor: new Ant.HeartRateSensor(stick1),
  },
  {
    playerName: "Caruana",
    deviceID: 60311,
    fideID: 2020009,
    sensor: new Ant.HeartRateSensor(stick1),
  },
];
const sensor = new Ant.HeartRateSensor(stick1);
stick1.on("startup", function () {
  console.log("startup stick1");
  attachSensors();
  function attachSensors() {
    playerMap.forEach((player, i) => {
      player.sensor.attach(i, player.deviceID);
      player.sensor.on("attached", () => {
        console.log(
          player.playerName,
          "attached. device ID: ",
          player.deviceID
        );
      });
    });

    // sensor.attach(0, 0);
    // sensor.on("attached", () => {
    //   console.log("sensor attached");
    // });
  }
});

addHBEventListeners();

function addHBEventListeners() {
  playerMap.forEach((player) => {
    player.sensor.on("hbData", (hbData) => {
      console.log(player.playerName, hbData.DeviceID, hbData.ComputedHeartRate);
      const data = {
        playerData: { name: player.playerName, fideID: player.fideID },
        laptopID: "Clemens",
        hbData: hbData,
      };
      socket.emit("hbData", data);
    });
  });
}

if (!stick1.open()) {
  console.log("Stick1 not found!");
}
