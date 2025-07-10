
import { SavedEvaluation } from '../types';

const EVALUATIONS_STORAGE_KEY = 'dualPresentationEvaluations';

export function saveEvaluation(evaluation: SavedEvaluation): void {
  try {
    const existingEvaluations = getAllEvaluations();
    existingEvaluations.push(evaluation);
    localStorage.setItem(EVALUATIONS_STORAGE_KEY, JSON.stringify(existingEvaluations));
  } catch (error) {
    console.error("Error saving evaluation to localStorage:", error);
    // Optionally, notify the user or handle the error more gracefully
  }
}

export function getAllEvaluations(): SavedEvaluation[] {
  try {
    const storedEvaluations = localStorage.getItem(EVALUATIONS_STORAGE_KEY);
    if (storedEvaluations) {
      const parsed = JSON.parse(storedEvaluations);
      // Basic validation to ensure it's an array
      return Array.isArray(parsed) ? parsed : [];
    }
    return [];
  } catch (error) {
    console.error("Error retrieving evaluations from localStorage:", error);
    return []; // Return empty array on error to prevent app crash
  }
}

export function clearAllEvaluations(): void {
  try {
    localStorage.removeItem(EVALUATIONS_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing evaluations from localStorage:", error);
  }
}
