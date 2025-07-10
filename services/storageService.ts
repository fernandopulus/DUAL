// services/firestoreEvaluationStorage.ts
import { SavedEvaluation } from '../types';
import { 
  saveEvaluation as firestoreSaveEvaluation, 
  getAllEvaluations as firestoreGetAllEvaluations,
  deleteEvaluation as firestoreDeleteEvaluation
} from './firestoreService';

// Guarda una evaluación en Firestore
export async function saveEvaluation(evaluation: SavedEvaluation): Promise<string> {
  try {
    // Ajusta los campos si SavedEvaluation difiere de lo que espera firestoreSaveEvaluation
    const { studentName, scores, feedbackText = '', evaluatorName = '' } = evaluation;
    const id = await firestoreSaveEvaluation(studentName, scores, feedbackText, evaluatorName);
    return id;
  } catch (error) {
    console.error("Error saving evaluation to Firestore:", error);
    throw error;
  }
}

// Obtiene todas las evaluaciones desde Firestore
export async function getAllEvaluations(): Promise<SavedEvaluation[]> {
  try {
    const evaluations = await firestoreGetAllEvaluations();
    return evaluations as SavedEvaluation[]; // Ajusta el cast si tus tipos son distintos
  } catch (error) {
    console.error("Error retrieving evaluations from Firestore:", error);
    return [];
  }
}

// Borra todas las evaluaciones desde Firestore (¡esto borra uno por uno!)
export async function clearAllEvaluations(): Promise<void> {
  try {
    const evaluations = await firestoreGetAllEvaluations();
    for (const evaluation of evaluations) {
      if (evaluation.id) {
        await firestoreDeleteEvaluation(evaluation.id);
      }
    }
    console.log("Todas las evaluaciones han sido eliminadas de Firestore.");
  } catch (error) {
    console.error("Error clearing evaluations from Firestore:", error);
  }
}
