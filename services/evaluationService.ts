// src/services/evaluationService.ts
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { SavedEvaluation } from "../types";

const COLLECTION_NAME = "evaluations";

export async function saveEvaluation(evaluation: SavedEvaluation) {
  const evaluationWithDate = {
    ...evaluation,
    createdAt: Timestamp.now()
  };
  await addDoc(collection(db, COLLECTION_NAME), evaluationWithDate);
}

export async function getAllEvaluations(): Promise<SavedEvaluation[]> {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as SavedEvaluation[];
}
