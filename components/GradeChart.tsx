import React from 'react';
import { SavedEvaluation } from '../types';
import { GRADING_CONSTANTS } from '../constants';

interface GradeChartProps {
  evaluations: SavedEvaluation[];
}

export const GradeChart = ({ evaluations }: GradeChartProps) => {
  // Función para proteger contra valores indefinidos
  const safeNumber = (v: any, fallback = 0) =>
    typeof v === 'number' && !isNaN(v) && isFinite(v) ? v : fallback;

  if (evaluations.length === 0) {
    return (
      <div className="bg-slate-50 p-6 rounded-lg text-center text-slate-500 mt-8">
        <p>No hay datos para mostrar en el gráfico para el filtro seleccionado.</p>
      </div>
    );
  }

  const sortedEvaluations = [...evaluations].sort((a, b) => a.studentName.localeCompare(b.studentName));

  const maxGrade = GRADING_CONSTANTS.MAX_GRADE;
  const minGrade = 1.0; // Start axis at 1.0 for better visual representation of school grades

  const gradeRange = maxGrade - minGrade;
  const passingGradePosition = gradeRange > 0 ? ((GRADING_CONSTANTS.PASSING_GRADE - minGrade) / gradeRange) * 100 : 0;

  return (
    <div className="p-4 md:p-6 bg-slate-50 rounded-lg mt-8">
      <h3 className="text-xl font-semibold text-slate-700 mb-6">Gráfico de Calificaciones por Estudiante</h3>
      <div className="w-full h-80 flex items-end pl-8 pr-4 relative">
        {/* Y-axis Container */}
        <div className="absolute left-0 top-0 h-full w-8 flex flex-col justify-between text-xs text-slate-500 py-4 items-end pr-2">
            <span>{safeNumber(maxGrade).toFixed(1)}</span>
            <span className="font-bold">{safeNumber(GRADING_CONSTANTS.PASSING_GRADE).toFixed(1)}</span>
            <span>{safeNumber(minGrade).toFixed(1)}</span>
        </div>
        {/* Chart Area */}
        <div className="w-full h-full flex space-x-2 md:space-x-4 items-end border-b-2 border-l-2 border-slate-300 relative">
            {/* Passing Grade Line */}
            <div className="absolute w-full h-px bg-slate-400 border-t border-dashed" style={{ bottom: `${passingGradePosition}%` }} />
            
            {sortedEvaluations.map((ev) => {
              const finalGrade = safeNumber(ev.finalGrade);
              const heightPercentage = gradeRange > 0 ? ((finalGrade - minGrade) / gradeRange) * 100 : 0;
              const isPassing = finalGrade >= GRADING_CONSTANTS.PASSING_GRADE;

              return (
                <div key={ev.id} className="flex-1 flex flex-col items-center justify-end h-full group">
                  <div
                    className="w-full rounded-t-md transition-all duration-300 ease-in-out relative group"
                    style={{ 
                        height: `${Math.max(0, heightPercentage)}%`,
                        backgroundColor: isPassing ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)',
                        border: `1px solid ${isPassing ? 'rgba(22, 163, 74, 0.8)' : 'rgba(220, 38, 38, 0.8)'}`
                    }}
                    title={`${ev.studentName}: ${finalGrade.toFixed(1)}`}
                  >
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-xs px-2 py-1 rounded-md transition-opacity pointer-events-none">
                        {finalGrade.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 w-full text-center overflow-hidden text-ellipsis whitespace-nowrap" title={ev.studentName}>
                    {ev.studentName.split(' ')[0]}
                  </p>
                </div>
              );
            })}
        </div>
      </div>
       <div className="flex justify-center items-center mt-4 space-x-4 text-sm text-slate-600">
          <div className="flex items-center">
            <span className="w-3.5 h-3.5 bg-green-500/70 border border-green-700/80 rounded-sm mr-2"></span>
            <span>Aprobado</span>
          </div>
          <div className="flex items-center">
            <span className="w-3.5 h-3.5 bg-red-500/70 border border-red-700/80 rounded-sm mr-2"></span>
            <span>Reprobado</span>
          </div>
          <div className="flex items-center">
            <span className="border-t-2 border-slate-400 border-dashed w-4 h-px mr-2"></span>
            <span>Nota de Aprobación</span>
          </div>
        </div>
    </div>
  );
};