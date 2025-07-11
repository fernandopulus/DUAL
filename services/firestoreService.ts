import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../src/firebase'; // SOLO importa db, no inicialices aquí
import { StudentEvaluation } from '../types';

// Asegúrate de tener estos campos en tu tipo:
export interface EvaluationRecord {
  id?: string;
  studentName: string;
  course: string;
  scores: StudentEvaluation;
  finalGrade: number;
  feedbackText: string;
  totalScore: number;
  percentage: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  evaluatorName?: string;
}

// GUARDAR EVALUACIÓN COMPLETA
export async function saveEvaluation(
  studentName: string,
  course: string,
  scores: StudentEvaluation,
  finalGrade: number,
  feedbackText: string,
  evaluatorName: string = ''
): Promise<string> {
  try {
    const totalScore = Object.values(scores).reduce((sum, score) => sum + (score || 0), 0);
    const maxScore = Object.keys(scores).length * 4; // Ajusta si tienes otra lógica
    const percentage = Math.round((totalScore / maxScore) * 100);

    const evaluationData: Omit<EvaluationRecord, 'id'> = {
      studentName,
      course,
      scores,
      finalGrade,
      feedbackText,
      totalScore,
      percentage,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      evaluatorName
    };

    const docRef = await addDoc(collection(db, 'evaluations'), evaluationData);
    console.log('Evaluación guardada con ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error al guardar evaluación:', error);
    throw new Error('No se pudo guardar la evaluación');
  }
}

// LEER TODAS LAS EVALUACIONES
export async function getAllEvaluations(): Promise<EvaluationRecord[]> {
  try {
    const q = query(
      collection(db, 'evaluations'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const evaluations: EvaluationRecord[] = [];
    querySnapshot.forEach((docItem) => {
      const data = docItem.data() as any;
      evaluations.push({
        id: docItem.id,
        studentName: data.studentName,
        course: data.course,
        scores: data.scores,
        finalGrade: typeof data.finalGrade === 'number' ? data.finalGrade : Number(data.finalGrade),
        feedbackText: data.feedbackText,
        totalScore: typeof data.totalScore === 'number' ? data.totalScore : Number(data.totalScore),
        percentage: typeof data.percentage === 'number' ? data.percentage : Number(data.percentage),
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        evaluatorName: data.evaluatorName ?? ''
      });
    });
    return evaluations;
  } catch (error) {
    console.error('Error al obtener evaluaciones:', error);
    throw new Error('No se pudieron cargar las evaluaciones');
  }
}

// LEER POR ESTUDIANTE
export async function getEvaluationsByStudent(studentName: string): Promise<EvaluationRecord[]> {
  try {
    const q = query(
      collection(db, 'evaluations'),
      where('studentName', '==', studentName),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const evaluations: EvaluationRecord[] = [];
    querySnapshot.forEach((docItem) => {
      const data = docItem.data() as any;
      evaluations.push({
        id: docItem.id,
        studentName: data.studentName,
        course: data.course,
        scores: data.scores,
        finalGrade: typeof data.finalGrade === 'number' ? data.finalGrade : Number(data.finalGrade),
        feedbackText: data.feedbackText,
        totalScore: typeof data.totalScore === 'number' ? data.totalScore : Number(data.totalScore),
        percentage: typeof data.percentage === 'number' ? data.percentage : Number(data.percentage),
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        evaluatorName: data.evaluatorName ?? ''
      });
    });
    return evaluations;
  } catch (error) {
    console.error('Error al obtener evaluaciones del estudiante:', error);
    throw new Error('No se pudieron cargar las evaluaciones del estudiante');
  }
}

// ACTUALIZAR EVALUACIÓN
export async function updateEvaluation(
  evaluationId: string,
  updateData: Partial<Omit<EvaluationRecord, 'id'>>
): Promise<void> {
  try {
    const evaluationRef = doc(db, 'evaluations', evaluationId);
    await updateDoc(evaluationRef, {
      ...updateData,
      updatedAt: Timestamp.now()
    });
    console.log('Evaluación actualizada:', evaluationId);
  } catch (error) {
    console.error('Error al actualizar evaluación:', error);
    throw new Error('No se pudo actualizar la evaluación');
  }
}

// ELIMINAR UNA EVALUACIÓN
export async function deleteEvaluation(evaluationId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'evaluations', evaluationId));
    console.log('Evaluación eliminada:', evaluationId);
  } catch (error) {
    console.error('Error al eliminar evaluación:', error);
    throw new Error('No se pudo eliminar la evaluación');
  }
}

// ELIMINAR TODAS LAS EVALUACIONES
export async function clearAllEvaluations(): Promise<void> {
  try {
    const evaluations = await getAllEvaluations();
    for (const evaluation of evaluations) {
      if (evaluation.id) {
        await deleteEvaluation(evaluation.id);
      }
    }
    console.log("Todas las evaluaciones han sido eliminadas de Firestore.");
  } catch (error) {
    console.error("Error clearing evaluations from Firestore:", error);
  }
}

// ESTADÍSTICAS GENERALES
export async function getEvaluationStats(): Promise<{
  totalEvaluations: number;
  averageScore: number;
  topStudents: Array<{ name: string, score: number }>;
}> {
  try {
    const evaluations = await getAllEvaluations();
    if (evaluations.length === 0) {
      return {
        totalEvaluations: 0,
        averageScore: 0,
        topStudents: []
      };
    }

    const totalEvaluations = evaluations.length;
    const averageScore = evaluations.reduce((sum, record) => sum + record.percentage, 0) / totalEvaluations;
    const studentScores = new Map<string, number>();
    evaluations.forEach(record => {
      if (
        !studentScores.has(record.studentName) ||
        record.percentage > studentScores.get(record.studentName)!
      ) {
        studentScores.set(record.studentName, record.percentage);
      }
    });
    const topStudents = Array.from(studentScores.entries())
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return {
      totalEvaluations,
      averageScore: Math.round(averageScore),
      topStudents
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw new Error('No se pudieron cargar las estadísticas');
  }
}