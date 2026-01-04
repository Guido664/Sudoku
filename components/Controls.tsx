import React from 'react';

interface ControlsProps {
  onNumberClick: (num: number) => void;
  onDelete: () => void;
  onNewGame: () => void;
  mistakes: number;
}

const Controls: React.FC<ControlsProps> = ({ 
  onNumberClick, 
  onDelete, 
  onNewGame,
  mistakes
}) => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto mt-6">
      
      {/* Stats Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-white rounded-lg shadow-sm">
        <div className="text-slate-600 font-medium">Mistakes: <span className={`${mistakes >= 3 ? 'text-red-500' : 'text-slate-900'}`}>{mistakes}/3</span></div>
        <div className="text-slate-400 text-sm font-medium">Classic Mode</div>
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => onNumberClick(num)}
            className="h-12 sm:h-14 bg-white border border-slate-200 rounded-lg shadow-sm text-2xl font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 active:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {num}
          </button>
        ))}
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