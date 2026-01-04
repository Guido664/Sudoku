import React, { useState, useEffect, useCallback } from 'react';
import { generateSudoku, isValid } from './services/sudokuLogic';
import { getSmartHint } from './services/geminiService';
import Board from './components/Board';
import Controls from './components/Controls';
import { Difficulty, GameStatus, Grid, CellCoords } from './types';

const App: React.FC = () => {
  // Game State
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [initialGrid, setInitialGrid] = useState<Grid>([]);
  const [grid, setGrid] = useState<Grid>([]);
  const [solvedGrid, setSolvedGrid] = useState<Grid>([]);
  const [selectedCell, setSelectedCell] = useState<CellCoords | null>(null);
  const [mistakes, setMistakes] = useState<number>(0);
  const [status, setStatus] = useState<GameStatus>(GameStatus.PLAYING);
  const [errorCell, setErrorCell] = useState<CellCoords | null>(null);
  
  // Hint State
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  
  // Online State
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Initialize Game
  const startNewGame = useCallback((diff: Difficulty = difficulty) => {
    const { initialGrid: newInitial, solvedGrid: newSolved } = generateSudoku(diff);
    // Deep copy for playable grid
    const playableGrid = newInitial.map(row => [...row]);
    
    setInitialGrid(newInitial);
    setGrid(playableGrid);
    setSolvedGrid(newSolved);
    setMistakes(0);
    setStatus(GameStatus.PLAYING);
    setSelectedCell(null);
    setHintMessage(null);
    setErrorCell(null);
  }, [difficulty]);

  useEffect(() => {
    startNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle Interactions
  const handleCellClick = (row: number, col: number) => {
    if (status !== GameStatus.PLAYING) return;
    setSelectedCell({ row, col });
    setHintMessage(null); // Clear hint on move
  };

  const handleNumberInput = (num: number) => {
    if (status !== GameStatus.PLAYING || !selectedCell) return;
    
    const { row, col } = selectedCell;

    // Cannot edit initial cells or already filled cells
    if (initialGrid[row][col] !== 0) return;
    if (grid[row][col] !== 0) return; // Optional: Allow overwriting? Typically Sudoku apps don't if it's correct.
    
    // Validate against SOLVED grid (Strict Mode)
    // Alternatively, validate against current board rules. 
    // Most apps validate against the true solution immediately.
    const isCorrect = solvedGrid[row][col] === num;

    if (isCorrect) {
      const newGrid = grid.map(r => [...r]);
      newGrid[row][col] = num;
      setGrid(newGrid);
      
      // Check Win Condition
      const isFull = newGrid.every(r => r.every(c => c !== 0));
      if (isFull) {
        setStatus(GameStatus.WON);
      }
    } else {
      setMistakes(prev => {
        const newMistakes = prev + 1;
        if (newMistakes >= 3) setStatus(GameStatus.LOST);
        return newMistakes;
      });
      // Flash error
      setErrorCell({ row, col });
      setTimeout(() => setErrorCell(null), 800);
    }
  };

  const handleDelete = () => {
    if (status !== GameStatus.PLAYING || !selectedCell) return;
    const { row, col } = selectedCell;
    if (initialGrid[row][col] !== 0) return; // Cannot delete initial

    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = 0;
    setGrid(newGrid);
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDiff = e.target.value as Difficulty;
    setDifficulty(newDiff);
    startNewGame(newDiff);
  };

  const handleSmartHint = async () => {
    if (isHintLoading || status !== GameStatus.PLAYING || !isOnline) return;
    setIsHintLoading(true);
    setHintMessage("Analyzing the board for the best logical move...");

    const hint = await getSmartHint(grid, initialGrid, solvedGrid, selectedCell);
    
    setHintMessage(hint.text);
    if (hint.coords) {
      setSelectedCell(hint.coords);
    }
    setIsHintLoading(false);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING) return;

      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleDelete();
      } else if (selectedCell) {
        let { row, col } = selectedCell;
        if (e.key === 'ArrowUp') row = Math.max(0, row - 1);
        if (e.key === 'ArrowDown') row = Math.min(8, row + 1);
        if (e.key === 'ArrowLeft') col = Math.max(0, col - 1);
        if (e.key === 'ArrowRight') col = Math.min(8, col + 1);
        setSelectedCell({ row, col });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, status, grid]); // Deps needed for state access inside listener

  return (
    <div className="min-h-screen flex flex-col items-center py-6 px-2 sm:px-4 bg-sudoku-bg text-sudoku-text font-sans">
      
      {/* Header */}
      <header className="w-full max-w-md flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-blue-600">Sudoku</h1>
        <div className="flex items-center gap-3">
          {!isOnline && (
            <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded-full animate-pulse">
              Offline Mode
            </span>
          )}
          <select 
            value={difficulty} 
            onChange={handleDifficultyChange}
            className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none"
          >
            <option value={Difficulty.EASY}>Easy</option>
            <option value={Difficulty.MEDIUM}>Medium</option>
            <option value={Difficulty.HARD}>Hard</option>
          </select>
        </div>
      </header>

      {/* Game Over Overlays */}
      {status !== GameStatus.PLAYING && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className={`text-6xl mb-4 ${status === GameStatus.WON ? 'text-green-500' : 'text-red-500'}`}>
              {status === GameStatus.WON ? '🎉' : '💀'}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {status === GameStatus.WON ? 'Puzzle Solved!' : 'Game Over'}
            </h2>
            <p className="text-slate-600 mb-6">
              {status === GameStatus.WON ? "Great job! Your mind is sharp." : "Too many mistakes. Try again!"}
            </p>
            <button 
              onClick={() => startNewGame()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Main Board Area */}
      <div className="flex flex-col items-center w-full max-w-md">
        
        {/* Hint Box */}
        {hintMessage && (
          <div className="mb-4 w-full bg-indigo-50 border border-indigo-100 p-4 rounded-lg shadow-sm animate-fade-in relative">
            <button 
              onClick={() => setHintMessage(null)}
              className="absolute top-2 right-2 text-indigo-300 hover:text-indigo-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                  ✨
                </div>
              </div>
              <div className="text-sm text-indigo-900 leading-relaxed">
                <span className="font-semibold block mb-1 text-indigo-700">Gemini Hints:</span>
                {hintMessage}
              </div>
            </div>
          </div>
        )}

        <Board 
          grid={grid}
          initialGrid={initialGrid}
          selectedCell={selectedCell}
          onCellClick={handleCellClick}
          errorCell={errorCell}
          highlightNumber={selectedCell && grid[selectedCell.row][selectedCell.col] !== 0 ? grid[selectedCell.row][selectedCell.col] : null}
        />

        <Controls 
          onNumberClick={handleNumberInput}
          onDelete={handleDelete}
          onNewGame={() => startNewGame()}
          onHint={handleSmartHint}
          isHintLoading={isHintLoading}
          mistakes={mistakes}
          isOnline={isOnline}
        />
      </div>
    </div>
  );
};

export default App;