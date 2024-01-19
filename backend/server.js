const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let currentPlayer = "X";
let board = Array(9).fill(null);
let players = [];

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner() {
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return board.includes(null) ? null : "Draw";
}

function sendToAllClients(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

function handleMove(data, ws) {
  const playerIndex = players.indexOf(ws);
  const player = playerIndex === 0 ? "X" : "O";

  if (player !== currentPlayer || checkWinner() || board[data.index] !== null) {
    console.error("Invalid move:", data);
    return;
  }
  board[data.index] = currentPlayer;
  currentPlayer = currentPlayer === "X" ? "O" : "X";

  sendToAllClients({ type: "BOARD", board });

  const winner = checkWinner();
  if (winner) {
    sendToAllClients({ type: "GAME_OVER", winner });
  }
}

function handleRestart() {
  board = Array(9).fill(null);
  currentPlayer = "X";

  sendToAllClients({ type: "BOARD", board });
}

wss.on("connection", (ws) => {
  if (players.length >= 2) {
    ws.close();
    return;
  }

  players.push(ws);
  const playerId = players.indexOf(ws);

  ws.send(JSON.stringify({ type: "PLAYER_ID", id: playerId }));
  ws.send(JSON.stringify({ type: "BOARD", board }));

  ws.on("message", (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (err) {
      console.error("Invalid JSON:", message);
      return;
    }

    switch (data.type) {
      case "MOVE":
        handleMove(data, ws);
        break;
      case "RESTART":
        handleRestart();
        break;
      default:
        console.error("Unknown message type:", data.type);
    }
  });

  ws.on("close", () => {
    players = players.filter((player) => player !== ws);
    currentPlayer = "X";
    board = Array(9).fill(null);

    sendToAllClients({ type: "PLAYER_LEFT", players: players.length });
    sendToAllClients({ type: "BOARD", board });
  });

  sendToAllClients({ type: "PLAYER_CONNECTED", players: players.length });
});

server.listen(3001, () => {
  console.log("Server listening on http://localhost:3001");
});
