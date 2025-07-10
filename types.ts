
export type ScorePoints = 1 | 2 | 3 | 4;

export interface ScoreLevelDetail {
  points: ScorePoints;
  levelName: string;
  description: string;
}

export interface RubricItem {
  id: string;
  title: string;
  levels: ScoreLevelDetail[];
}

export interface StudentEvaluation {
  [indicatorId: string]: ScorePoints | undefined;
}

// Grounding related types
export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunkRetrieval {
  uri: string;
  title: string;
}
export interface GroundingChunkAttribution {
  web?: GroundingChunkWeb;
  retrievedContext?: GroundingChunkRetrieval;
  // Potentially other sources in the future
}

export interface GroundingMetadata {
  webSearchQueries?: string[];
  groundingAttributions?: GroundingChunkAttribution[]; // Changed from groundingChunks
  // Potentially other metadata fields
}


// Structure for saved evaluations
export interface SavedEvaluation {
  id: string; // Unique ID for the evaluation, e.g., timestamp
  studentName: string;
  course: string;
  evaluationDate: string; // Date of saving/evaluation
  scores: StudentEvaluation;
  totalScore: number;
  finalGrade: number;
  aiFeedback: string;
  groundingMetadata?: GroundingMetadata; // Store the whole metadata object
}