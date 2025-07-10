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
import { 
  saveEvaluation as saveEvaluationToFirestore, 
  getAllEvaluations as getAllEvaluationsFromFirestore, 
  clearAllEvaluations as clearAllEvaluationsFromFirestore 
} from './services/firestoreService';

import CalculateIcon from './components/icons/CalculateIcon';
import SparklesIcon from './components/icons/SparklesIcon';
import DownloadIcon from './components/icons/DownloadIcon';
import SaveIcon from './components/icons/SaveIcon';
import DashboardIcon from './components/icons/DashboardIcon';
import ArrowLeftIcon from './components/icons/ArrowLeftIcon';

type ViewMode = 'form' | 'dashboard';

export const App = () => {
  const [studentName, setStudentName] = useState<string>('');
  const [course, setCourse] = useState<string>('');
  const [scores, setScores] = useState<StudentEvaluation>({});
  const [totalScore, setTotalScore] = useState<number>(0);
  const [finalGrade, setFinalGrade] = useState<number | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [groundingMetadata, setGroundingMetadata] = useState<GroundingMetadata | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState<ViewMode>('form');
  const [savedEvaluations, setSavedEvaluations] = useState<SavedEvaluation[]>([]);
  const [isLoadingEvaluations, setIsLoadingEvaluations] = useState<boolean>(true);

  // Cargar evaluaciones desde Firestore al iniciar o al limpiar/agregar
  const refreshEvaluations = useCallback(() => {
    setIsLoadingEvaluations(true);
    getAllEvaluationsFromFirestore()
      .then(setSavedEvaluations)
      .finally(() => setIsLoadingEvaluations(false));
  }, []);

  useEffect(() => {
    refreshEvaluations();
  }, [refreshEvaluations]);

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
    setScores(prevScores => ({ ...prevScores, [indicatorId]: score }));
    setFinalGrade(null); 
    setAiFeedback(null); 
    setGroundingMetadata(undefined);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  const handleStudentNameChange = useCallback((name: string) => {
    setStudentName(name);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);
  
  const handleCourseChange = useCallback((c: string) => {
    setCourse(c);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  const displaySuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000); // Hide after 3 seconds
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
    if (!areAllIndicatorsScored(scores, RUBRIC_DATA.length)) {
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

    const currentTotalScore = calculateTotalScore(scores);
    setTotalScore(currentTotalScore);
    const currentFinalGrade = calculateFinalGrade(currentTotalScore);
    setFinalGrade(currentFinalGrade);
    displaySuccessMessage("Nota calculada exitosamente.");
  }, [scores, studentName, course]);

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
  }, [studentName, scores, finalGrade, course]);

  const handleSaveEvaluation = useCallback(async () => {
    if (!validateForm(true) || finalGrade === null || !aiFeedback) {
      setErrorMessage("Complete la evaluación, calcule nota y genere retroalimentación antes de guardar.");
      return;
    }
    try {
      await saveEvaluationToFirestore(
        studentName,
        scores,
        aiFeedback,
        "" // puedes pasar evaluatorName aquí si lo tienes
      );
      displaySuccessMessage(`Evaluación para ${studentName} guardada.`);
      refreshEvaluations(); // Recarga evaluaciones desde Firestore
      // Optionally, reset the form after saving:
      // resetFormState();
    } catch (err) {
      setErrorMessage("Error al guardar la evaluación.");
    }
  }, [studentName, scores, aiFeedback, finalGrade, refreshEvaluations]);

  const handleDownloadReport = useCallback(async () => {
    if (!validateForm(true) || finalGrade === null || !aiFeedback) {
      setErrorMessage("Complete la evaluación, calcule nota y genere retroalimentación antes de descargar.");
      return;
    }
    const evaluationDate = new Date().toLocaleDateString('es-CL');
    try {
      await downloadReportAsPDF({
        studentName,
        course,
        evaluationDate,
        scores,
        totalScore,
        finalGrade,
        aiFeedback,
        rubricData: RUBRIC_DATA,
        groundingMetadata,
      });
      displaySuccessMessage("Informe PDF descargado.");
    } catch (error) {
        console.error("Error downloading PDF:", error);
        setErrorMessage("Error al descargar el informe PDF.");
    }
  }, [studentName, course, scores, totalScore, finalGrade, aiFeedback, groundingMetadata]);

  useEffect(() => {
    if (studentName.trim() && course && areAllIndicatorsScored(scores, RUBRIC_DATA.length)) {
      if (
        errorMessage === 'El nombre del estudiante es requerido.' ||
        errorMessage === 'El curso del estudiante es requerido.' ||
        errorMessage === 'Todos los indicadores deben ser evaluados para continuar.'
      ) {
        setErrorMessage(null);
      }
    }
  }, [studentName, course, scores, errorMessage]);

  const canProceedAfterFormFill = studentName.trim() && course && areAllIndicatorsScored(scores, RUBRIC_DATA.length);
  const allStepsCompletedForActions = canProceedAfterFormFill && finalGrade !== null && aiFeedback !== null && !aiFeedback.startsWith("Error:");

  const toggleView = () => {
    setCurrentView(prev => prev === 'form' ? 'dashboard' : 'form');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleResetAndNew = () => {
    resetFormState();
    setCurrentView('form');
    displaySuccessMessage("Formulario reiniciado para una nueva evaluación.");
  };

  const handleClearAllEvaluations = async () => {
    await clearAllEvaluationsFromFirestore();
    setSavedEvaluations([]);
    displaySuccessMessage("Todas las evaluaciones han sido borradas.");
    refreshEvaluations();
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-10 text-center relative">
        <h1 className="text-4xl font-extrabold text-slate-900 mt-4">Evaluación de Presentaciones Duales 🔩</h1>
        <p className="mt-2 text-lg text-slate-600">Liceo Industrial de Recoleta</p>
        <div className="absolute top-0 right-0 p-2 sm:p-4">
            <button
                onClick={toggleView}
                className="flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-150"
                title={currentView === 'form' ? "Ver Dashboard" : "Volver al Formulario"}
            >
                {currentView === 'form' ? (
                    <>
                        <DashboardIcon className="h-5 w-5 sm:mr-2" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </>
                ) : (
                    <>
                        <ArrowLeftIcon className="h-5 w-5 sm:mr-2" />
                        <span className="hidden sm:inline">Formulario</span>
                    </>
                )}
            </button>
        </div>
      </header>

      {successMessage && (
        <div className="max-w-4xl mx-auto mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="max-w-4xl mx-auto mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}

      <main className="max-w-4xl mx-auto">
        {currentView === 'form' ? (
          <>
            <EvaluationForm
              studentName={studentName}
              onStudentNameChange={handleStudentNameChange}
              course={course}
              onCourseChange={handleCourseChange}
              scores={scores}
              onScoreChange={handleScoreChange}
              isSubmitted={isSubmitted}
            />

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleCalculateGrade}
                disabled={isLoadingFeedback || !canProceedAfterFormFill}
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 transition-colors duration-150"
              >
                <CalculateIcon className="h-5 w-5 mr-2" />
                Calcular Nota
              </button>
              <button
                onClick={handleGenerateFeedback}
                disabled={isLoadingFeedback || !canProceedAfterFormFill || finalGrade === null}
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-slate-400 transition-colors duration-150"
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                {isLoadingFeedback ? 'Generando IA...' : 'Retroalimentación IA'}
              </button>
            </div>
            
            {finalGrade !== null && (
                <ScoreDisplay totalScore={totalScore} finalGrade={finalGrade} />
            )}

            <FeedbackSection 
                aiFeedback={aiFeedback} 
                isLoadingFeedback={isLoadingFeedback}
                groundingMetadata={groundingMetadata}
            />

            {allStepsCompletedForActions && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleSaveEvaluation}
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                >
                  <SaveIcon className="h-5 w-5 mr-2" />
                  Guardar Evaluación
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150"
                >
                  <DownloadIcon className="h-5 w-5 mr-2" />
                  Descargar Informe (PDF)
                </button>
              </div>
            )}
            <div className="mt-8 text-center">
                <button
                    onClick={handleResetAndNew}
                    className="px-6 py-3 border border-slate-300 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                >
                    Limpiar y Nueva Evaluación
                </button>
            </div>
          </>
        ) : (
          <DashboardView
            evaluations={savedEvaluations}
            onBackToForm={toggleView}
            onClearAll={handleClearAllEvaluations}
            isLoading={isLoadingEvaluations}
          />
        )}
      </main>
      <footer className="text-center mt-12 py-6 border-t border-slate-300">
        <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} Liceo Industrial de Recoleta. Herramienta de Evaluación.</p>
      </footer>
      <div id="pdf-report-content" style={{ position: 'absolute', left: '-9999px', width: '0px', height: '0px', overflow: 'hidden' }}></div>
    </div>
  );
};
