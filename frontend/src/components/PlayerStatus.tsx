interface PlayerStatusProps {
  playerId: number | null;
  players: number;
}

const PlayerStatus = ({ playerId, players }: PlayerStatusProps) => {
  let player = playerId == 1 ? "O" : "X";
  return (
    <>
      <div className="mt-2">
        {playerId === null
          ? "There's already 2 players"
          : players === 2
          ? "Both players connected"
          : `Waiting for ${2 - players} player(s)`}
      </div>

      <div className="my-2">
        {playerId === null
          ? "You are not connected"
          : `You are player ${player}`}
      </div>
    </>
  );
};
export default PlayerStatus;
