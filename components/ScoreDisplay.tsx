
import React from 'react';
import { GRADING_CONSTANTS } from '../constants';

interface ScoreDisplayProps {
  totalScore: number;
  finalGrade: number | null;
}

export const ScoreDisplay = ({ totalScore, finalGrade }: ScoreDisplayProps) => {
  if (finalGrade === null) {
    return null; // Don't display if grade hasn't been calculated
  }

  const getGradeColor = (grade: number) => {
    if (grade < GRADING_CONSTANTS.PASSING_GRADE) return 'text-red-600';
    if (grade < 5.0) return 'text-yellow-600'; // Using 5.0 as a threshold for "good"
    if (grade < 6.0) return 'text-blue-600';
    return 'text-green-600';
  };
  
  const gradeColor = getGradeColor(finalGrade);

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-3">Resultados Finales</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50 p-4 rounded-lg text-center">
          <p className="text-sm font-medium text-slate-600 mb-1">Puntaje Total Obtenido</p>
          <p className="text-3xl font-bold text-blue-600">
            {totalScore} <span className="text-lg font-normal text-slate-500">/ {GRADING_CONSTANTS.MAX_TOTAL_POSSIBLE_SCORE}</span>
          </p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg text-center">
          <p className="text-sm font-medium text-slate-600 mb-1">Nota Final Calculada</p>
          <p className={`text-3xl font-bold ${gradeColor}`}>
            {finalGrade.toFixed(1)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            (Escala {GRADING_CONSTANTS.MIN_GRADE.toFixed(1)} - {GRADING_CONSTANTS.MAX_GRADE.toFixed(1)}, Aprobación con {GRADING_CONSTANTS.PASSING_GRADE.toFixed(1)})
          </p>
        </div>
      </div>
    </div>
  );
};
