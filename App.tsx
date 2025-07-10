import React, { useState, useCallback, useEffect } from 'react';
import { EvaluationForm } from './components/EvaluationForm';
import { ScoreDisplay } from './components/ScoreDisplay';
import { FeedbackSection } from './components/FeedbackSection';
import { DashboardView } from './components/DashboardView';
import { StudentEvaluation, ScorePoints, GroundingMetadata, SavedEvaluation } from './types';
import { RUBRIC\_DATA, GRADING\_CONSTANTS } from './constants';
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

type ViewMode = 'form' | 'dashboard';

export const App = () => {
const \[studentName, setStudentName] = useState<string>('');
const \[course, setCourse] = useState<string>('');
const \[scores, setScores] = useState<StudentEvaluation>({});
const \[totalScore, setTotalScore] = useState<number>(0);
const \[finalGrade, setFinalGrade] = useState\<number | null>(null);
const \[aiFeedback, setAiFeedback] = useState\<string | null>(null);
const \[isLoadingFeedback, setIsLoadingFeedback] = useState<boolean>(false);
const \[isSubmitted, setIsSubmitted] = useState<boolean>(false);
const \[groundingMetadata, setGroundingMetadata] = useState\<GroundingMetadata | undefined>(undefined);
const \[errorMessage, setErrorMessage] = useState\<string | null>(null);
const \[successMessage, setSuccessMessage] = useState\<string | null>(null);
const \[currentView, setCurrentView] = useState<ViewMode>('form');
const \[savedEvaluations, setSavedEvaluations] = useState\<SavedEvaluation\[]>(\[]);

useEffect(() => {
getAllEvaluationsFromFirestore().then(setSavedEvaluations);
}, \[]);

const resetFormState = () => {
setStudentName('');
setCourse('');
setScores({});
setTotalScore(0);
setFinalGrade(null);
setAiFeedback(null);
setGroundingMetadata(undefined);
setIsSubmitted(false);
setErrorMessage(null);
setSuccessMessage(null);
};

const handleScoreChange = useCallback((indicatorId: string, score: ScorePoints) => {
setScores(prevScores => ({ ...prevScores, \[indicatorId]: score }));
setFinalGrade(null);
setAiFeedback(null);
setGroundingMetadata(undefined);
setErrorMessage(null);
setSuccessMessage(null);
}, \[]);

const handleStudentNameChange = useCallback((name: string) => {
setStudentName(name);
setErrorMessage(null);
setSuccessMessage(null);
}, \[]);

const handleCourseChange = useCallback((c: string) => {
setCourse(c);
setErrorMessage(null);
setSuccessMessage(null);
}, \[]);

const displaySuccessMessage = (message: string) => {
setSuccessMessage(message);
setTimeout(() => setSuccessMessage(null), 3000);
};

const validateForm = (checkFeedbackAndGrade = false): boolean => {
setIsSubmitted(true);
if (!studentName.trim()) {
setErrorMessage('El nombre del estudiante es requerido.');
return false;
}
if (!course) {
setErrorMessage('El curso del estudiante es requerido.');
return false;
}
if (!areAllIndicatorsScored(scores, RUBRIC\_DATA.length)) {
setErrorMessage('Todos los indicadores deben ser evaluados para continuar.');
return false;
}
if (checkFeedbackAndGrade) {
if (finalGrade === null) {
setErrorMessage('Por favor, calcule la nota final primero.');
return false;
}
if (!aiFeedback) {
setErrorMessage('Por favor, genere la retroalimentación IA primero.');
return false;
}
}
setErrorMessage(null);
return true;
};

const handleCalculateGrade = useCallback(() => {
if (!validateForm()) return;

```
const currentTotalScore = calculateTotalScore(scores);
setTotalScore(currentTotalScore);
const currentFinalGrade = calculateFinalGrade(currentTotalScore);
setFinalGrade(currentFinalGrade);
displaySuccessMessage("Nota calculada exitosamente.");
```

}, \[scores, studentName, course]);

const handleGenerateFeedback = useCallback(async () => {
if (!validateForm()) return;
if (finalGrade === null) {
const currentTotalScore = calculateTotalScore(scores);
setTotalScore(currentTotalScore);
const currentFinalGrade = calculateFinalGrade(currentTotalScore);
setFinalGrade(currentFinalGrade);
if (currentFinalGrade === null) {
setErrorMessage("Error al calcular la nota antes de generar retroalimentación.");
return;
}
}

```
setIsLoadingFeedback(true);
setAiFeedback(null);
setGroundingMetadata(undefined);
setSuccessMessage(null);
try {
  const { feedbackText, groundingMetadata: meta } = await generateAIFeedback(studentName, scores);
  setAiFeedback(feedbackText);
  setGroundingMetadata(meta);
  if (!feedbackText.startsWith("Error:")) {
    displaySuccessMessage("Retroalimentación generada exitosamente.");
  } else {
    setErrorMessage(feedbackText);
  }
} catch (error) {
  console.error("Error in handleGenerateFeedback:", error);
  setErrorMessage("Error al generar retroalimentación. Verifique la consola para más detalles.");
  setAiFeedback("Error al generar retroalimentación. Verifique la consola para más detalles.");
} finally {
  setIsLoadingFeedback(false);
}
```

}, \[studentName, scores, finalGrade, course]);

const handleSaveEvaluation = useCallback(async () => {
if (!validateForm(true) || finalGrade === null || !aiFeedback) {
setErrorMessage("Complete la evaluación, calcule nota y genere retroalimentación antes de guardar.");
return;
}

```
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
  displaySuccessMessage(`Evaluación para ${studentName} guardada.`);
} catch (err) {
  console.error("Error saving evaluation to Firestore:", err);
  setErrorMessage("No se pudo guardar la evaluación en la nube.");
}
```

}, \[studentName, course, scores, totalScore, finalGrade, aiFeedback, groundingMetadata]);

const handleClearAllEvaluations = async () => {
try {
await clearAllEvaluationsFromFirestore();
setSavedEvaluations(\[]);
displaySuccessMessage("Todas las evaluaciones han sido borradas de la nube.");
} catch (error) {
console.error("Error clearing evaluations:", error);
setErrorMessage("Error al borrar las evaluaciones en la nube.");
}
};

// El resto del componente permanece igual
return ( <div> {/\* UI aquí \*/} </div>
);
};
