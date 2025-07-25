const { io } = require("socket.io-client");
const Ant = require("gd-ant-plus");
require("dotenv").config();

DEVICE_ID = process.env.DEVICE_ID;
STICK_NUMBER = parseInt(process.env.STICK_NUMBER);
if (!DEVICE_ID) {
  console.log("please put DEVICE_ID in .env file");
  process.exit(-1);
}

if (!STICK_NUMBER) {
  console.log(
    "please provide STICK_NUMBER in .env file (1 stick can handle up to 8 sensors)"
  );
  process.exit(-1);
}

console.log("DEVICE_ID:", DEVICE_ID);
console.log("STICK_NUMBER:", STICK_NUMBER);

const socket = io("https://chess-api.buildarocket.com");
// const socket = io("http://192.168.178.20:3000");

socket.on("connect", () => {
  console.log("Connected to server with id: ", socket.id);
  socket.emit("requestPlayerMapHeartRate");
  // socket.emit("updatePlayerMapHeartRate", playerMap);
});
const sticks = new Array(STICK_NUMBER).fill(null);
console.log("sticks length", sticks.length);
const playerMap = [
  {
    fideID: 2093596,
    playerName: "Niemann",
    deviceID: 31610,
  },
  {
    fideID: 1503014,
    playerName: "Carlsen",
    deviceID: 31621,
  },
  {
    fideID: 13300474,
    playerName: "Aronian",
    deviceID: 15888,
  },
  {
    fideID: 14204118,
    playerName: "Abdusattorov",
    deviceID: 31794,
  },
  {
    fideID: 2040506,
    playerName: "Sevian",
    deviceID: 55112,
  },
  {
    fideID: 25059530,
    playerName: "Praggnanandhaa",
    deviceID: 13945,
  },
  {
    fideID: 5029465,
    playerName: "Vidit",
    deviceID: 35107,
  },
  {
    fideID: 2020009,
    playerName: "Caruana",
    deviceID: 3127,
  },
  {
    fideID: 3503240,
    playerName: "Domínguez Perez",
    deviceID: 16010,
  },
  {
    fideID: 2016192,
    playerName: "Nakamura",
    deviceID: 9885,
  },
  {
    fideID: 5202213,
    playerName: "So",
    deviceID: 4962,
  },
  {
    fideID: 35009192,
    playerName: "Arjun",
    deviceID: 31619,
  },
  {
    fideID: 2093596,
    playerName: "Niemann",
    deviceID: 55111,
  },
  {
    fideID: 14205483,
    playerName: "Sindarov",
    deviceID: 16247,
  },
  {
    fideID: 2093596,
    playerName: "Niemann",
    deviceID: 55930,
  },
  {
    fideID: 14205483,
    playerName: "Sindarov",
    deviceID: 7604,
  },
];
console.log("updatePlayerMapHeartRate", playerMap);
const playerNumber = playerMap.length;
const playerNumberPerStick = Math.ceil(playerNumber / 2);

function initialiseStick(i) {
  function stickStartup(stick, i) {
    function addSensorsToPlayers(stick, playerMapForStick) {
      // console.log("addSensorsToPlayers", playerMapForStick);
      playerMapForStick.forEach((player, i) => {
        player.sensor = new Ant.HeartRateSensor(stick);
      });
    }
    function addHeartRateListener(player) {
      player.sensor.on("hbData", (hbData) => {
        console.log(
          player.playerName,
          hbData.DeviceID,
          hbData.ComputedHeartRate
        );
        const data = {
          playerData: { name: player.playerName, fideID: player.fideID },
          DEVICE_ID,
          hbData: hbData,
        };
        socket.emit("hbData", data);
      });
    }
    function attachFirstSensor(playerMapForStick) {
      playerMapForStick[0].sensor.attach(0, playerMapForStick[0].deviceID);
      addHeartRateListener(playerMapForStick[0]);
    }
    function attachRemainingSensors(playerMapForStick) {
      function logAttachedMessage(playerMapForStick, previousIndex, i) {
        console.log(
          `${playerMapForStick[previousIndex].playerName} attached to slot ${previousIndex} of stick ${i}. device ID: ${playerMapForStick[previousIndex].deviceID} `
        );
      }
      function addAttachedListenerToLastSensor(
        playerMapForStick,
        previousIndex
      ) {
        playerMapForStick[previousIndex].sensor.on("attached", () => {
          logAttachedMessage(playerMapForStick, previousIndex, i);
        });
      }

      playerMapForStick.slice(1).forEach((player, previousIndex) => {
        playerMapForStick[previousIndex].sensor.on("attached", () => {
          logAttachedMessage(playerMapForStick, previousIndex, i);
          player.sensor.attach(previousIndex + 1, player.deviceID);
          addHeartRateListener(player);
        });
      });
      addAttachedListenerToLastSensor(
        playerMapForStick,
        playerMapForStick.length - 1
      );
    }

    console.log("startup stick", i);
    const from = i * playerNumberPerStick;
    const to = i * playerNumberPerStick + playerNumberPerStick;
    console.log(`initializing from ${from} to ${to}`);

    const playerMapForStick = playerMap.slice(from, to);
    addSensorsToPlayers(stick, playerMapForStick);
    attachFirstSensor(playerMapForStick);
    attachRemainingSensors(playerMapForStick);
  }
  function createNewStick(sticks, i) {
    function openStick(stick) {
      function openStickAsync(stick) {
        const cancellationToken = stick.openAsync((err) => {
          if (err) console.log("stick could not be opened!", err);
          else console.log(`stick ${i} opened successfully!`);
        });
      }
      function openStickNormally(stick) {
        if (!stick.open()) console.log("stick not found!");
      }

      openStickAsync(stick);
      stick.on("startup", function () {
        stickStartup(stick, i);
      });
    }
    sticks[i] = new Ant.GarminStick2();
    openStick(sticks[i]);
  }
  function handleAlreadyOpenedStick(sticks, i) {
    console.log(`stick ${i} already opened!`);
    sticks[i].close();
    sticks[i].on("shutdown", () => {
      console.log(`stick ${i} shutdown!`);
      createNewStick(sticks, i);
    });
  }

  function detachSensors(sensors) {
    function detachFirstSensor(sensors) {
      sensors[0].detach();
    }
    function detachRemainingSensors(sensors) {
      function onLastSensorDetached() {
        const lastSensor = sensors[sensors.length - 1];
        lastSensor.on("detached", () => {
          console.log(`detached sensor ${lastSensor.deviceID}`);
        });
      }
      sensors.slice(1).forEach((currentSensor, prevIndex) => {
        const previousSensor = sensors[prevIndex];
        previousSensor.on("detached", () => {
          console.log(`detached sensor ${previousSensor.deviceID}`);
          currentSensor.detach();
        });
      });
      onLastSensorDetached();
    }
    detachFirstSensor(sensors);
    detachRemainingSensors(sensors);
  }

  if (sticks[i]) {
    handleAlreadyOpenedStick(sticks, i);
  } else {
    createNewStick(sticks, i);
  }
}
for (let i = 0; i < sticks.length; i++) {
  initialiseStick(i);
}
