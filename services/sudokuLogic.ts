import { Difficulty, Grid } from '../types';

const BLANK = 0;

// Helper: Check if placing num at board[row][col] is valid
export const isValid = (board: Grid, row: number, col: number, num: number): boolean => {
  // Check Row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  // Check Col
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }

  // Check 3x3 Box
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }

  return true;
};

// Solves the board using backtracking. Returns true if solvable.
// Modifies the board in place.
const solveSudoku = (board: Grid): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === BLANK) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) {
              return true;
            }
            board[row][col] = BLANK;
          }
        }
        return false;
      }
    }
  }
  return true;
};

// Returns a deep copy of the grid
const copyGrid = (grid: Grid): Grid => grid.map(row => [...row]);

// Generate a full valid board
const generateFullBoard = (): Grid => {
  const board = Array.from({ length: 9 }, () => Array(9).fill(BLANK));

  // Fill diagonal 3x3 matrices first (they are independent of each other)
  // This speeds up the solver significantly
  for (let i = 0; i < 9; i += 3) {
    fillBox(board, i, i);
  }

  // Solve the rest
  solveSudoku(board);
  return board;
};

const fillBox = (board: Grid, row: number, col: number) => {
  let num: number;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      do {
        num = Math.floor(Math.random() * 9) + 1;
      } while (!isSafeInBox(board, row, col, num));
      board[row + i][col + j] = num;
    }
  }
};

const isSafeInBox = (board: Grid, row: number, col: number, num: number) => {
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }
  return true;
};

// Remove K digits to make the puzzle
const removeKDigits = (board: Grid, k: number): Grid => {
  const puzzle = copyGrid(board);
  let count = k;
  while (count > 0) {
    const cellId = Math.floor(Math.random() * 81);
    const i = Math.floor(cellId / 9);
    const j = cellId % 9;
    if (puzzle[i][j] !== BLANK) {
      puzzle[i][j] = BLANK;
      count--;
    }
  }
  return puzzle;
};

export const generateSudoku = (difficulty: Difficulty) => {
  const solvedGrid = generateFullBoard();
  let attempts = 30; // Easy
  switch (difficulty) {
    case Difficulty.MEDIUM: attempts = 45; break;
    case Difficulty.HARD: attempts = 55; break;
  }
  
  const initialGrid = removeKDigits(solvedGrid, attempts);
  
  return {
    initialGrid,
    solvedGrid
  };
};