export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export type Grid = number[][];

export interface CellCoords {
  row: number;
  col: number;
}

export enum GameStatus {
  PLAYING = 'playing',
  WON = 'won',
  LOST = 'lost'
}

export interface HintResponse {
  text: string;
  coords?: CellCoords;
  value?: number;
}