
import { StudentEvaluation } from '../types'; // ScorePoints removed as it's not directly used here
import { GRADING_CONSTANTS } from '../constants';

export function calculateTotalScore(scores: StudentEvaluation): number {
  return Object.values(scores).reduce((sum, score) => sum + (score || 0), 0);
}

export function calculateFinalGrade(obtainedScore: number): number {
  const { 
    MIN_TOTAL_POSSIBLE_SCORE, 
    SCORE_FOR_PASSING_GRADE, 
    MAX_TOTAL_POSSIBLE_SCORE,
    MIN_GRADE,
    PASSING_GRADE,
    MAX_GRADE
  } = GRADING_CONSTANTS;

  let grade: number;

  if (obtainedScore >= SCORE_FOR_PASSING_GRADE) {
    // Score is in the range that maps to grades 4.0 - 7.0
    const scorePointsInUpperRange = obtainedScore - SCORE_FOR_PASSING_GRADE;
    const totalPossiblePointsInUpperRange = MAX_TOTAL_POSSIBLE_SCORE - SCORE_FOR_PASSING_GRADE;
    
    if (totalPossiblePointsInUpperRange === 0) { // Avoid division by zero
      grade = obtainedScore === MAX_TOTAL_POSSIBLE_SCORE ? MAX_GRADE : PASSING_GRADE;
    } else {
      grade = PASSING_GRADE + (scorePointsInUpperRange / totalPossiblePointsInUpperRange) * (MAX_GRADE - PASSING_GRADE);
    }
  } else {
    // Score is in the range that maps to grades 2.0 - 4.0
    const scorePointsInLowerRange = obtainedScore - MIN_TOTAL_POSSIBLE_SCORE;
    const totalPossiblePointsInLowerRange = SCORE_FOR_PASSING_GRADE - MIN_TOTAL_POSSIBLE_SCORE;

    if (totalPossiblePointsInLowerRange === 0) { // Avoid division by zero
        grade = obtainedScore === SCORE_FOR_PASSING_GRADE ? PASSING_GRADE : MIN_GRADE;
    } else {
       grade = MIN_GRADE + (scorePointsInLowerRange / totalPossiblePointsInLowerRange) * (PASSING_GRADE - MIN_GRADE);
    }
  }
  
  // Clamp grade to be between MIN_GRADE and MAX_GRADE and round to one decimal place
  const clampedGrade = Math.min(Math.max(grade, MIN_GRADE), MAX_GRADE);
  return parseFloat(clampedGrade.toFixed(1));
}

export function areAllIndicatorsScored(scores: StudentEvaluation, totalIndicators: number): boolean {
  return Object.values(scores).filter(score => score !== undefined).length === totalIndicators;
}