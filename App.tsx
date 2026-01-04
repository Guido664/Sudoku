import React, { useState, useEffect, useCallback } from 'react';
import { generateSudoku } from './services/sudokuLogic';
import Board from './components/Board';
import Controls from './components/Controls';
import { Difficulty, GameStatus, Grid, CellCoords, NotesGrid } from './types';

const App: React.FC = () => {
  // Game State
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [initialGrid, setInitialGrid] = useState<Grid>([]);
  const [grid, setGrid] = useState<Grid>([]);
  const [notes, setNotes] = useState<NotesGrid>([]); // State for pencil marks
  const [solvedGrid, setSolvedGrid] = useState<Grid>([]);
  const [selectedCell, setSelectedCell] = useState<CellCoords | null>(null);
  const [mistakes, setMistakes] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [status, setStatus] = useState<GameStatus>(GameStatus.PLAYING);
  const [errorCell, setErrorCell] = useState<CellCoords | null>(null);
  const [isNoteMode, setIsNoteMode] = useState<boolean>(false); // Toggle for Note Mode
  
  // Helper to create empty notes grid
  const createEmptyNotes = (): NotesGrid => 
    Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>()));

  // Initialize Game
  const startNewGame = useCallback((diff: Difficulty = difficulty) => {
    const { initialGrid: newInitial, solvedGrid: newSolved } = generateSudoku(diff);
    // Deep copy for playable grid
    const playableGrid = newInitial.map(row => [...row]);
    
    setInitialGrid(newInitial);
    setGrid(playableGrid);
    setNotes(createEmptyNotes());
    setSolvedGrid(newSolved);
    setMistakes(0);
    setScore(0);
    setTimer(0);
    setStatus(GameStatus.PLAYING);
    setSelectedCell(null);
    setErrorCell(null);
    setIsNoteMode(false);
  }, [difficulty]);

  useEffect(() => {
    startNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (status === GameStatus.PLAYING) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Calculate completed numbers (appear 9 times)
  const getCompletedNumbers = () => {
    const counts: Record<number, number> = {};
    grid.forEach(row => {
      row.forEach(num => {
        if (num !== 0) {
          counts[num] = (counts[num] || 0) + 1;
        }
      });
    });
    const completed = new Set<number>();
    for (let i = 1; i <= 9; i++) {
      if (counts[i] === 9) completed.add(i);
    }
    return completed;
  };

  const completedNumbers = getCompletedNumbers();
  
  // Handle Interactions
  const handleCellClick = (row: number, col: number) => {
    if (status !== GameStatus.PLAYING) return;
    setSelectedCell({ row, col });
  };

  const handleNumberInput = (num: number) => {
    if (status !== GameStatus.PLAYING || !selectedCell) return;
    
    const { row, col } = selectedCell;

    // Cannot edit initial cells
    if (initialGrid[row][col] !== 0) return;

    // --- NOTE MODE LOGIC ---
    if (isNoteMode) {
      // Can only add notes to empty cells
      if (grid[row][col] !== 0) return;

      setNotes(prevNotes => {
        const newNotes = prevNotes.map(r => r.map(set => new Set(set)));
        const cellNotes = newNotes[row][col];
        if (cellNotes.has(num)) {
          cellNotes.delete(num);
        } else {
          cellNotes.add(num);
        }
        return newNotes;
      });
      return;
    }

    // --- NORMAL MODE LOGIC ---
    
    // Check if number is already completed (only applies to normal mode entry)
    if (completedNumbers.has(num)) return;

    // If cell is already filled, prevent overwrite unless we want to allow correction
    if (grid[row][col] !== 0) return; 
    
    // Validate against SOLVED grid (Strict Mode)
    const isCorrect = solvedGrid[row][col] === num;

    if (isCorrect) {
      const newGrid = grid.map(r => [...r]);
      newGrid[row][col] = num;
      setGrid(newGrid);
      
      // Update Score
      const diffMultiplier = difficulty === Difficulty.EASY ? 1 : difficulty === Difficulty.MEDIUM ? 2 : 3;
      setScore(prev => prev + (50 * diffMultiplier));

      // Clear notes in this cell when a number is placed
      setNotes(prevNotes => {
        const newNotes = prevNotes.map(r => r.map(set => new Set(set)));
        newNotes[row][col].clear();
        return newNotes;
      });

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
      // Penalty for mistake
      setScore(prev => Math.max(0, prev - 100));
      // Flash error
      setErrorCell({ row, col });
      setTimeout(() => setErrorCell(null), 800);
    }
  };

  const handleDelete = () => {
    if (status !== GameStatus.PLAYING || !selectedCell) return;
    const { row, col } = selectedCell;
    if (initialGrid[row][col] !== 0) return; // Cannot delete initial

    // If cell has a value, remove it
    if (grid[row][col] !== 0) {
      const newGrid = grid.map(r => [...r]);
      newGrid[row][col] = 0;
      setGrid(newGrid);
    } else {
      // If cell is empty, clear notes
      setNotes(prevNotes => {
        const newNotes = prevNotes.map(r => r.map(set => new Set(set)));
        newNotes[row][col].clear();
        return newNotes;
      });
    }
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDiff = e.target.value as Difficulty;
    setDifficulty(newDiff);
    startNewGame(newDiff);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING) return;

      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleDelete();
      } else if (e.key === 'n' || e.key === 'N') {
        setIsNoteMode(prev => !prev); // Shortcut for notes
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
  }, [selectedCell, status, grid, completedNumbers, isNoteMode]); 

  return (
    <div className="min-h-screen flex flex-col items-center py-6 px-2 sm:px-4 bg-sudoku-bg text-sudoku-text font-sans overflow-y-auto">
      
      {/* Header */}
      <header className="w-full max-w-md lg:max-w-xl flex justify-between items-center mb-6 transition-all duration-300">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-blue-600">Sudoku</h1>
        <div className="flex items-center gap-3">
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
            <div className="flex justify-center gap-4 mb-4 text-slate-700">
              <div className="font-semibold">Score: {score}</div>
              <div className="font-semibold">Time: {Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}</div>
            </div>
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
      <div className="flex flex-col items-center w-full max-w-md lg:max-w-xl transition-all duration-300">
        
        <Board 
          grid={grid}
          initialGrid={initialGrid}
          notes={notes}
          selectedCell={selectedCell}
          onCellClick={handleCellClick}
          errorCell={errorCell}
          highlightNumber={selectedCell && grid[selectedCell.row][selectedCell.col] !== 0 ? grid[selectedCell.row][selectedCell.col] : null}
        />

        <Controls 
          onNumberClick={handleNumberInput}
          onDelete={handleDelete}
          onNewGame={() => startNewGame()}
          onToggleNotes={() => setIsNoteMode(!isNoteMode)}
          isNoteMode={isNoteMode}
          mistakes={mistakes}
          score={score}
          timer={timer}
          completedNumbers={completedNumbers}
        />
      </div>
    </div>
  );
};

export default App;