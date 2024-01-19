interface BoardProps {
  board: string[];
  handleClick: (index: number) => void;
}

const Board = ({ board, handleClick }: BoardProps) => (
  <div className="grid grid-cols-3 gap-1">
    {board.map((cell, index) => (
      <div key={index} className="cell" onClick={() => handleClick(index)}>
        {cell}
      </div>
    ))}
  </div>
);

export default Board;
