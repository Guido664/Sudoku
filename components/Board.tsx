import React from 'react';
import { Grid, CellCoords, NotesGrid } from '../types';

interface BoardProps {
  grid: Grid;
  initialGrid: Grid;
  notes: NotesGrid;
  selectedCell: CellCoords | null;
  onCellClick: (row: number, col: number) => void;
  errorCell: CellCoords | null;
  highlightNumber: number | null;
}

const Board: React.FC<BoardProps> = ({ 
  grid, 
  initialGrid, 
  notes,
  selectedCell, 
  onCellClick,
  errorCell,
  highlightNumber
}) => {
  return (
    <div className="select-none touch-manipulation">
      <div className="grid grid-cols-9 border-4 border-slate-800 bg-slate-800 gap-[1px]">
        {grid.map((row, rowIndex) => (
          row.map((cellValue, colIndex) => {
            const isInitial = initialGrid[rowIndex][colIndex] !== 0;
            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const isError = errorCell?.row === rowIndex && errorCell?.col === colIndex;
            
            // Highlight logic
            const isRelated = selectedCell && (selectedCell.row === rowIndex || selectedCell.col === colIndex);
            // Highlight same number
            const isSameNumber = cellValue !== 0 && highlightNumber === cellValue;
            
            // 3x3 Box borders - Using borders for consistent thickness
            const borderRight = (colIndex + 1) % 3 === 0 && colIndex !== 8 ? 'border-r-2 border-slate-800' : '';
            const borderBottom = (rowIndex + 1) % 3 === 0 && rowIndex !== 8 ? 'border-b-2 border-slate-800' : '';

            let bgClass = 'bg-white';
            if (isError) bgClass = '!bg-red-200';
            else if (isSelected) bgClass = '!bg-blue-400 text-white';
            else if (isSameNumber) bgClass = '!bg-blue-200';
            else if (isRelated) bgClass = 'bg-blue-50';

            const textClass = isInitial ? 'font-bold text-slate-900' : 'text-blue-600 font-medium';
            
            // Get notes for this cell
            const cellNotes = notes[rowIndex][colIndex];
            const hasNotes = cellValue === 0 && cellNotes && cellNotes.size > 0;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => onCellClick(rowIndex, colIndex)}
                className={`
                  w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 
                  flex items-center justify-center cursor-pointer transition-colors duration-75 relative
                  ${bgClass} ${textClass}
                  ${borderRight} ${borderBottom}
                `}
              >
                {cellValue !== 0 ? (
                  <span className="text-lg sm:text-xl md:text-2xl">{cellValue}</span>
                ) : hasNotes ? (
                  /* Notes Grid (3x3) */
                  <div className="grid grid-cols-3 w-full h-full p-0.5 pointer-events-none">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(noteNum => (
                      <div key={noteNum} className="flex items-center justify-center">
                        {cellNotes.has(noteNum) && (
                          <span className={`text-[8px] sm:text-[10px] leading-none ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                            {noteNum}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
};

export default Board;