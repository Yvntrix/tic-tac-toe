import { useEffect, useState } from "react";
import PlayerStatus from "./components/PlayerStatus";
import Board from "./components/Board";
import useWebSocket from "./hooks/useWebSocket";

function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [winner, setWinner] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [players, setPlayers] = useState(0);
  let player = playerId == 1 ? "O" : "X";

  const { ws, isConnected, connectWebSocket } = useWebSocket({
    onMessage: (data) => {
      if (data.type === "BOARD") {
        setBoard(data.board);
        setWinner(null);
      } else if (data.type === "GAME_OVER") {
        setWinner(data.winner);
      } else if (data.type === "PLAYER_CONNECTED") {
        setPlayers(data.players);
      } else if (data.type === "PLAYER_ID") {
        setPlayerId(data.id);
      } else if (data.type === "PLAYER_LEFT") {
        setPlayers(data.players);
        alert("The other player has left the game.");
      }
    },
  });

  useEffect(() => {
    if (winner) {
      if (winner === "Draw") {
        alert("It's a Draw!");
      } else if (winner === player) {
        alert("You win!");
      } else {
        alert("You lose!");
      }
    }
  }, [winner]);

  const handleClick = (index: number) => {
    if (
      ws &&
      ws.readyState === WebSocket.OPEN &&
      board[index] === null &&
      !winner &&
      playerId !== null
    ) {
      ws.send(JSON.stringify({ type: "MOVE", index, player: player }));
    }
  };

  const handleRestart = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "RESTART" }));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen App">
      <h1 className="text-3xl">Tic Tac Toe</h1>
      {!isConnected ? (
        <button onClick={connectWebSocket} className="my-5 btn-primary">
          Connect to Game
        </button>
      ) : (
        <>
          {playerId !== null ? (
            <>
              <PlayerStatus playerId={playerId} players={players} />
              <Board board={board} handleClick={handleClick} />
              <button onClick={handleRestart} className="mt-2 btn-primary">
                Restart Game
              </button>
            </>
          ) : (
            <h1>Game is already full, comeback later. Thanks!</h1>
          )}
        </>
      )}
    </div>
  );
}

export default App;
