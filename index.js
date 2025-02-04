const { io } = require("socket.io-client");
const Ant = require("gd-ant-plus");

const socket = io("https://chess-api.buildarocket.com");

var stick1 = new Ant.GarminStick2();
var stick2 = new Ant.GarminStick2();

let playerMap = [
  {
    playerName: "Nakamura",
    deviceID: 9885,
    fideID: 2016192,
    sensor: new Ant.HeartRateSensor(stick1),
  },
  {
    playerName: "Caruana",
    deviceID: 3127,
    fideID: 2020009,
    sensor: new Ant.HeartRateSensor(stick1),
  },
  {
    playerName: "Dommaraju",
    deviceID: 35107,
    fideID: 46616543,
    sensor: new Ant.HeartRateSensor(stick1),
  },
  {
    playerName: "Carlsen",
    deviceID: 31621,
    fideID: 1503014,
    sensor: new Ant.HeartRateSensor(stick1),
  },
  {
    playerName: "Keymer",
    deviceID: 31610,
    fideID: 12940690,
    sensor: new Ant.HeartRateSensor(stick1),
  },
  {
    playerName: "Aronian",
    deviceID: 31794,
    fideID: 13300474,
    sensor: new Ant.HeartRateSensor(stick2),
  },
  {
    playerName: "Sindarov",
    deviceID: 31619,
    fideID: 14205483,
    sensor: new Ant.HeartRateSensor(stick2),
  },
  {
    playerName: "Fedoseev",
    deviceID: 13945,
    fideID: 24130737,
    sensor: new Ant.HeartRateSensor(stick2),
  },
  {
    playerName: "Abdusattorov",
    deviceID: 31619,
    fideID: 14204118,
    sensor: new Ant.HeartRateSensor(stick2),
  },
  {
    playerName: "Firouzja",
    deviceID: 31619,
    fideID: 12573981,
    sensor: new Ant.HeartRateSensor(stick2),
  },
];

stick1.on("startup", function () {
  console.log("startup");
  //attachSensors();
  function attachSensors() {
    // playerMap[0].sensor.attach(0, playerMap[0].deviceID);
    // playerMap.slice(1).forEach((player, prevIndex) => {
    //   playerMap[prevIndex].sensor.on("attached", () => {
    //     console.log(playerMap[prevIndex].playerName, "attached");
    //     //wait for prev sensor to be attached
    //     player.sensor.attach(prevIndex + 1, player.deviceID);
    //   });
    // });

    playerMap.slice(0,5).forEach((player, i) => {
      player.sensor.attach(i, player.deviceID);
    });
  }

  //playerMap[6].sensor.attach(0, 0);

  //sensor1.attach(0, 0);
});
stick2.on("startup", function () {
  console.log("startup");
  //attachSensors();
  function attachSensors() {
    // playerMap[0].sensor.attach(0, playerMap[0].deviceID);
    // playerMap.slice(1).forEach((player, prevIndex) => {
    //   playerMap[prevIndex].sensor.on("attached", () => {
    //     console.log(playerMap[prevIndex].playerName, "attached");
    //     //wait for prev sensor to be attached
    //     player.sensor.attach(prevIndex + 1, player.deviceID);
    //   });
    // });

    playerMap.slice(5).forEach((player, i) => {
      player.sensor.attach(i, player.deviceID);
    });
  }

  playerMap[8].sensor.attach(0, 0);

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
if (!stick2.open()) {
  console.log("Stick not found!");
}
