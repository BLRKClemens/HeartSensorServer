const { io } = require("socket.io-client");
const Ant = require("gd-ant-plus");

// const socket = io("https://chess-api.buildarocket.com");
const socket = io("http://192.168.178.20:3000");

socket.on("connect", () => {
  console.log("Connected to server with id: ", socket.id);
  socket.emit("requestPlayerMapHeartRate");
  // socket.emit("updatePlayerMapHeartRate", playerMap);
});

let stick1;
let stick2;
const sticks = [stick1, stick2];

socket.on("updatePlayerMapHeartRate", (playerMap) => {
  console.log("updatePlayerMapHeartRate", playerMap);
  const playerNumber = playerMap.length;
  const playerNumberPerStick = Math.ceil(playerNumber / 2);

  // sticks.forEach(stick,)
  // stick1 = new Ant.GarminStick2();
  // stick2 = new Ant.GarminStick2();
  console.log("sticks", sticks);

  for (let i = 0; i < sticks.length; i++) {
    if (sticks[i]) {
      console.log("stick in use!");
      sticks[i].close();
      sticks[i].on("shutdown", () => {
        initialiseStick(i);
      });
    } else {
      initialiseStick(i);
    }
    function initialiseStick(i) {
      sticks[i] = new Ant.GarminStick2();

      sticks[i].on("startup", function () {
        stickStartup(sticks[i], i);
        function stickStartup(stick, i) {
          console.log("startup stick", i);
          const from = i * playerNumberPerStick;
          const to = i * playerNumberPerStick + playerNumberPerStick;
          console.log(`initializing from ${from} to ${to}`);

          const playerMapForStick = playerMap.slice(from, to);
          addSensorsToPlayers(stick, playerMapForStick);
          function addSensorsToPlayers(stick, playerMapForStick) {
            console.log("addSensorsToPlayers", playerMapForStick);
            playerMapForStick.forEach((player, i) => {
              player.sensor = new Ant.HeartRateSensor(stick);
            });
          }

          attachFirstSensor(playerMapForStick);
          function attachFirstSensor(playerMapForStick) {
            // Attach the first sensor
            playerMapForStick[0].sensor.attach(
              0,
              playerMapForStick[0].deviceID
            );
            addHeartRateListener(playerMapForStick[0]);
          }

          attachRemainingSensors(playerMapForStick);
          function attachRemainingSensors(playerMapForStick) {
            // Attach the remaining sensors
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
        }
      });
      if (!sticks[i].open()) {
        console.log("stick not found!");
      }
    }
  }
});
