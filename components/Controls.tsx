import React from 'react';

interface ControlsProps {
  onNumberClick: (num: number) => void;
  onDelete: () => void;
  onNewGame: () => void;
  onHint: () => void;
  isHintLoading: boolean;
  mistakes: number;
  isOnline: boolean;
}

const Controls: React.FC<ControlsProps> = ({ 
  onNumberClick, 
  onDelete, 
  onNewGame,
  onHint,
  isHintLoading,
  mistakes,
  isOnline
}) => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto mt-6">
      
      {/* Stats Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-white rounded-lg shadow-sm">
        <div className="text-slate-600 font-medium">Mistakes: <span className={`${mistakes >= 3 ? 'text-red-500' : 'text-slate-900'}`}>{mistakes}/3</span></div>
        <div className="flex gap-2">
           <button 
            onClick={onHint}
            disabled={isHintLoading || !isOnline}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all
              ${!isOnline 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : isHintLoading 
                    ? 'bg-purple-100 text-purple-400' 
                    : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95'}
            `}
          >
            {isHintLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Thinking...
              </>
            ) : !isOnline ? (
               <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                Offline
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                AI Hint
              </>
            )}
          </button>
        </div>
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