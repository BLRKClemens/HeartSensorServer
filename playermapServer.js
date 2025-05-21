const { io } = require("socket.io-client");
const socket = io("https://chess-api.buildarocket.com");
// const socket = io("http://localhost:3000");

let playerMap = [
  {
    playerName: "Clemens",
    deviceID: 60311,
    fideID: 2016192,
  },
  {
    playerName: "Caruana",
    deviceID: 61433,
    fideID: 2020009,
  },
  {
    playerName: "Dommaraju",
    deviceID: 35107,
    fideID: 46616543,
  },
  {
    playerName: "Carlsen",
    deviceID: 31621,
    fideID: 1503014,
  },
  {
    playerName: "Keymer",
    deviceID: 31610,
    fideID: 12940690,
  },
  {
    playerName: "Aronian",
    deviceID: 31794,
    fideID: 13300474,
  },
  {
    playerName: "Sindarov",
    deviceID: 31619,
    fideID: 14205483,
  },
  {
    playerName: "Fedoseev",
    deviceID: 13945,
    fideID: 24130737,
  },
  {
    playerName: "Abdusattorov",
    deviceID: 31619,
    fideID: 14204118,
  },
  {
    playerName: "Firouzja",
    deviceID: 45,
    fideID: 12573981,
  },
  {
    playerName: "test1",
    deviceID: 1,
    fideID: 1,
  },
  {
    playerName: "test2",
    deviceID: 2,
    fideID: 2,
  },
  {
    playerName: "test3",
    deviceID: 3,
    fideID: 3,
  },
  {
    playerName: "test4",
    deviceID: 4,
    fideID: 4,
  },
  {
    playerName: "test5",
    deviceID: 5,
    fideID: 5,
  },
  {
    playerName: "testMulti",
    deviceID: 50,
    fideID: 76,
  },
];
console.log("Number of Players: ", playerMap.length);

socket.on("connect", () => {
  console.log("Connected to server with id: ", socket.id);
  socket.emit("updatePlayerMapHeartRate", { playerMap });
});

socket.on("requestPlayerMapHeartRate", (requesterId) => {
  socket.emit("updatePlayerMapHeartRate", { playerMap, requesterId });
});
