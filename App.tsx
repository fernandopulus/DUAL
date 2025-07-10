import React, { useState, useCallback, useEffect } from 'react';
import { EvaluationForm } from './components/EvaluationForm';
import { ScoreDisplay } from './components/ScoreDisplay';
import { FeedbackSection } from './components/FeedbackSection';
import { DashboardView } from './components/DashboardView';
import { StudentEvaluation, ScorePoints, GroundingMetadata, SavedEvaluation } from './types';
import { RUBRIC_DATA, GRADING_CONSTANTS } from './constants';
import { calculateTotalScore, calculateFinalGrade, areAllIndicatorsScored } from './services/gradingService';
import { generateAIFeedback } from './services/geminiService';
import { downloadReportAsPDF } from './services/pdfService';
import { saveEvaluationToFirestore, getAllEvaluationsFromFirestore, clearAllEvaluationsFromFirestore } from './services/evaluationService';

import CalculateIcon from './components/icons/CalculateIcon';
import SparklesIcon from './components/icons/SparklesIcon';
import DownloadIcon from './components/icons/DownloadIcon';
import SaveIcon from './components/icons/SaveIcon';
import DashboardIcon from './components/icons/DashboardIcon';
import ArrowLeftIcon from './components/icons/ArrowLeftIcon';

// ...rest of the file remains unchanged until the useEffect to load evaluations...

useEffect(() => {
// Load saved evaluations from Firestore on initial mount
getAllEvaluationsFromFirestore().then(setSavedEvaluations);
}, []);

// ...inside handleSaveEvaluation replace storage logic with Firestore...

const handleSaveEvaluation = useCallback(async () => {
if (!validateForm(true) || finalGrade === null || !aiFeedback) {
setErrorMessage("Complete la evaluación, calcule nota y genere retroalimentación antes de guardar.");
return;
}
const newEvaluation: SavedEvaluation = {
id: Date.now().toString(),
studentName,
course,
evaluationDate: new Date().toLocaleDateString('es-CL'),
scores,
totalScore,
finalGrade,
aiFeedback,
groundingMetadata,
};
try {
await saveEvaluationToFirestore(newEvaluation);
const updatedEvaluations = await getAllEvaluationsFromFirestore();
setSavedEvaluations(updatedEvaluations);
displaySuccessMessage(Evaluación para ${studentName} guardada.);
} catch (err) {
console.error("Error saving evaluation to Firestore:", err);
setErrorMessage("No se pudo guardar la evaluación en la nube.");
}
}, [studentName, course, scores, totalScore, finalGrade, aiFeedback, groundingMetadata]);

// ...replace clearAllEvaluations logic...

const handleClearAllEvaluations = async () => {
try {
await clearAllEvaluationsFromFirestore();
setSavedEvaluations([]);
displaySuccessMessage("Todas las evaluaciones han sido borradas de la nube.");
} catch (error) {
console.error("Error clearing evaluations:", error);
setErrorMessage("Error al borrar las evaluaciones en la nube.");
}
};

// el resto del código queda igual

