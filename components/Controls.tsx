import React from 'react';

interface ControlsProps {
  onNumberClick: (num: number) => void;
  onDelete: () => void;
  onNewGame: () => void;
  onToggleNotes: () => void;
  isNoteMode: boolean;
  mistakes: number;
  completedNumbers: Set<number>;
}

const Controls: React.FC<ControlsProps> = ({ 
  onNumberClick, 
  onDelete, 
  onNewGame,
  onToggleNotes,
  isNoteMode,
  mistakes,
  completedNumbers
}) => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto mt-6">
      
      {/* Stats Bar & Tools */}
      <div className="flex justify-between items-center px-4 py-2 bg-white rounded-lg shadow-sm h-14">
        <div className="text-slate-600 font-medium">Mistakes: <span className={`${mistakes >= 3 ? 'text-red-500' : 'text-slate-900'}`}>{mistakes}/3</span></div>
        
        <button
          onClick={onToggleNotes}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all
            ${isNoteMode 
              ? 'bg-blue-600 text-white ring-2 ring-offset-1 ring-blue-600' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }
          `}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          Notes {isNoteMode ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const isComplete = completedNumbers.has(num);
          
          return (
            <button
              key={num}
              onClick={() => (!isComplete || isNoteMode) && onNumberClick(num)}
              disabled={isComplete && !isNoteMode}
              className={`
                h-12 sm:h-14 rounded-lg shadow-sm text-2xl font-medium transition-colors focus:outline-none focus:ring-2
                ${isComplete && !isNoteMode
                  ? 'bg-slate-100 text-slate-200 border border-slate-100 cursor-default' 
                  : isNoteMode
                    ? 'bg-slate-50 border border-slate-300 text-slate-600 hover:bg-blue-50 focus:ring-slate-400'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 active:bg-blue-100 focus:ring-blue-300'
                }
              `}
            >
              {num}
            </button>
          );
        })}
        <button
          onClick={onDelete}
          className="h-12 sm:h-14 bg-red-50 border border-red-200 rounded-lg shadow-sm text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
          aria-label="Delete"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>

      <button 
        onClick={onNewGame}
        className="mt-4 py-3 w-full bg-slate-800 text-white rounded-lg font-semibold shadow-md hover:bg-slate-700 active:scale-[0.98] transition-all"
      >
        New Game
      </button>
    </div>
  );
};

export default Controls;