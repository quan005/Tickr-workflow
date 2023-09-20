export interface PositionDetails {
  targetedEntry: number;
  reversalEntry: number;
}

export interface PositionSetup {
  demand: {
    primary: PositionDetails | null,
    secondary: PositionDetails | null
  };
  supply: {
    primary: PositionDetails | null,
    secondary: PositionDetails | null
  };
}