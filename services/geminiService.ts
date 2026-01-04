import { GoogleGenAI, Type } from "@google/genai";
import { Grid, CellCoords, HintResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartHint = async (
  currentBoard: Grid, 
  initialBoard: Grid,
  solvedBoard: Grid,
  selectedCell: CellCoords | null
): Promise<HintResponse> => {
  
  // Format the board for the prompt
  const boardStr = currentBoard.map(row => row.map(c => c === 0 ? '.' : c).join(' ')).join('\n');
  const solvedStr = solvedBoard.map(row => row.map(c => c === 0 ? '.' : c).join(' ')).join('\n');
  
  let prompt = `You are a Sudoku expert.
  Current Board (0 or . is empty):
  ${boardStr}
  
  Solved Board (Goal):
  ${solvedStr}
  
  The user is stuck. Provide a helpful, logical hint.
  Rules:
  1. If the user has selected a cell (Coords: ${selectedCell ? `Row ${selectedCell.row}, Col ${selectedCell.col}` : 'None'}), focus on that cell if it is empty.
  2. If the selected cell is already filled correctly, tell them to select an empty cell.
  3. If no cell is selected or the selected cell is difficult, find the easiest logical step on the board to solve next (e.g., a "naked single").
  4. Explain the LOGIC (e.g., "In the top-left box, the number 5 can only go here because...").
  5. Do not just give the number immediately unless it's the only way to help. Be educational.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Fast, logical
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "The hint explanation." },
            row: { type: Type.INTEGER, description: "The target row index (0-8) for the hint." },
            col: { type: Type.INTEGER, description: "The target column index (0-8) for the hint." },
            value: { type: Type.INTEGER, description: "The correct value for that cell." }
          },
          required: ["text"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    const data = JSON.parse(jsonText);
    
    return {
      text: data.text,
      coords: (data.row !== undefined && data.col !== undefined) ? { row: data.row, col: data.col } : undefined,
      value: data.value
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      text: "I'm having trouble analyzing the board right now. Please try again later.",
    };
  }
};