const { io } = require("socket.io-client");
const Ant = require("gd-ant-plus");

const socket = io("https://chess-api.buildarocket.com");
// const socket = io("http://192.168.178.20:3000");

socket.on("connect", () => {
  console.log("Connected to server with id: ", socket.id);
  socket.emit("requestPlayerMapHeartRate");
  // socket.emit("updatePlayerMapHeartRate", playerMap);
});
const sticks = [null, null];

socket.on("updatePlayerMapHeartRate", (playerMap) => {
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
      function attachFirstSensor(playerMapForStick) {
        playerMapForStick[0].sensor.attach(0, playerMapForStick[0].deviceID);
        addHeartRateListener(playerMapForStick[0]);
      }
      function attachRemainingSensors(playerMapForStick) {
        function addAttachedListenerToLastSensor(
          playerMapForStick,
          previousIndex
        ) {
          playerMapForStick[previousIndex].sensor.on("attached", () => {
            logAttachedMessage(playerMapForStick, previousIndex, i);
          });
        }
        function logAttachedMessage(playerMapForStick, previousIndex, i) {
          console.log(
            `${playerMapForStick[previousIndex].playerName} attached to slot ${previousIndex} of stick ${i}. device ID: ${playerMapForStick[previousIndex].deviceID} `
          );
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
      function addHeartRateListener(player) {
        player.sensor.on("hbData", (hbData) => {
          console.log(
            player.playerName,
            hbData.DeviceID,
            hbData.ComputedHeartRate
          );
          const data = {
            playerData: { name: player.playerName, fideID: player.fideID },
            laptopID: "Clemens",
            hbData: hbData,
          };
          socket.emit("hbData", data);
        });
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
        const cancellationToken = stick.openAsync((err) => {
          if (err) console.log("stick could not be opened!", err);
          else console.log(`stick ${i} opened successfully!`);
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

    sticks[i].on("startup", function () {
      stickStartup(sticks[i], i);
    });
  }
  for (let i = 0; i < sticks.length; i++) {
    initialiseStick(i);
  }
});
