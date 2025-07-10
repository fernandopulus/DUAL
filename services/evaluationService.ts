// src/services/evaluationService.ts
import { collection, addDoc, getDocs, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "../src/firebase";
import { SavedEvaluation } from "../types";

const COLLECTION_NAME = "evaluations";

export async function saveEvaluationToFirestore(evaluation: SavedEvaluation) {
  const evaluationWithDate = {
    ...evaluation,
    createdAt: Timestamp.now()
  };
  await addDoc(collection(db, COLLECTION_NAME), evaluationWithDate);
}

export async function getAllEvaluationsFromFirestore(): Promise<SavedEvaluation[]> {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as SavedEvaluation[];
}

export async function clearAllEvaluationsFromFirestore(): Promise<void> {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  const deletePromises = snapshot.docs.map(document => 
    deleteDoc(doc(db, COLLECTION_NAME, document.id))
  );
  await Promise.all(deletePromises);
}

export async function deleteEvaluationFromFirestore(evaluationId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, evaluationId));
}

export async function updateEvaluationInFirestore(evaluationId: string, updates: Partial<SavedEvaluation>): Promise<void> {
  const { updateDoc } = await import("firebase/firestore");
  await updateDoc(doc(db, COLLECTION_NAME, evaluationId), {
    ...updates,
    updatedAt: Timestamp.now()
  });
}
