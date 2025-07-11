import React, { useState, useMemo } from 'react';
import { SavedEvaluation } from '../types';
import { RUBRIC_DATA, GRADING_CONSTANTS, COURSE_OPTIONS } from '../constants';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import TrashIcon from './icons/TrashIcon';
import { GradeChart } from './GradeChart';

interface DashboardViewProps {
  evaluations: SavedEvaluation[];
  onBackToForm: () => void;
  onClearAll: () => void;
}

export const DashboardView = ({ evaluations, onBackToForm, onClearAll }: DashboardViewProps) => {
  const [selectedCourse, setSelectedCourse] = useState('all');

  const handleClear = () => {
    if (window.confirm("¿Estás seguro de que quieres borrar TODAS las evaluaciones guardadas? Esta acción no se puede deshacer.")) {
      onClearAll();
    }
  };
  
  const filteredEvaluations = useMemo(() => {
    if (selectedCourse === 'all') {
      return evaluations;
    }
    return evaluations.filter(ev => ev.course === selectedCourse);
  }, [evaluations, selectedCourse]);

  if (evaluations.length === 0) {
    return (
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 mt-8">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-slate-800">Dashboard de Desempeño</h2>
          <button
            onClick={onBackToForm}
            className="flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Volver al Formulario
          </button>
        </div>
        <p className="text-slate-600 text-center py-10">No hay evaluaciones guardadas para mostrar en el dashboard.</p>
      </div>
    );
  }

  const indicatorStats: { [key: string]: { sum: number; count: number } } = {};
  RUBRIC_DATA.forEach(item => {
    indicatorStats[item.id] = { sum: 0, count: 0 };
  });

  filteredEvaluations.forEach(evaluation => {
    Object.entries(evaluation.scores).forEach(([indicatorId, score]) => {
      if (score !== undefined && indicatorStats[indicatorId]) {
        indicatorStats[indicatorId].sum += score;
        indicatorStats[indicatorId].count += 1;
      }
    });
  });

  const averageScores = RUBRIC_DATA.map(item => ({
    indicatorId: item.id,
    title: item.title,
    averageScore: indicatorStats[item.id].count > 0 ? indicatorStats[item.id].sum / indicatorStats[item.id].count : 0,
    count: indicatorStats[item.id].count,
  }));

  // Protege contra division por cero y valores indefinidos
  const safeNumber = (v: any, fallback = 0) =>
    typeof v === 'number' && !isNaN(v) && isFinite(v) ? v : fallback;

  const overallAverageScore = (() => {
    const totalCount = averageScores.reduce((acc, curr) => acc + curr.count, 0);
    return totalCount > 0
      ? averageScores.reduce((acc, curr) => acc + curr.averageScore * curr.count, 0) / totalCount
      : 0;
  })();

  const overallAverageGrade = filteredEvaluations.length > 0
    ? filteredEvaluations.reduce((sum, ev) => sum + (ev.finalGrade ?? 0), 0) / filteredEvaluations.length
    : 0;

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 mt-8">
      <div className="flex justify-between items-center mb-6 border-b pb-4 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard de Desempeño</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-grow">
            <label htmlFor="courseFilter" className="sr-only">Filtrar por Curso</label>
            <select
              id="courseFilter"
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
            >
              <option value="all">Todos los cursos</option>
              {COURSE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button
            onClick={handleClear}
            className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Limpiar Todo
          </button>
          <button
            onClick={onBackToForm}
            className="flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Volver
          </button>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-slate-700 mb-4">Resumen General ({selectedCourse === 'all' ? 'Todos los cursos' : selectedCourse})</h3>
      <div className="mb-8 p-6 bg-slate-50 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm font-medium text-slate-600">Total Evaluaciones</p>
          <p className="text-3xl font-bold text-blue-600">{filteredEvaluations.length}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-600">Promedio de Puntaje</p>
          <p className="text-3xl font-bold text-purple-600">
            {safeNumber(overallAverageScore).toFixed(1)}
            <span className="text-lg font-normal text-slate-500">
              {" "} / {safeNumber(GRADING_CONSTANTS.MAX_POSSIBLE_SCORE_PER_INDICATOR).toFixed(0)}
            </span>
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-600">Promedio de Nota Final</p>
          <p className="text-3xl font-bold text-green-600">{safeNumber(overallAverageGrade).toFixed(1)}</p>
        </div>
      </div>

      <GradeChart evaluations={filteredEvaluations} />

      <h3 className="text-xl font-semibold text-slate-700 mt-8 mb-4">Historial de Evaluaciones</h3>
      {filteredEvaluations.length > 0 ? (
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 border-b-2 border-slate-200 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nombre del Estudiante</th>
                <th className="px-6 py-3 border-b-2 border-slate-200 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Curso</th>
                <th className="px-6 py-3 border-b-2 border-slate-200 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 border-b-2 border-slate-200 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nota Final</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {[...filteredEvaluations].reverse().map(ev => (
                <tr key={ev.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap border-b border-slate-200">{ev.studentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-slate-200">{ev.course}</td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-slate-200">{ev.evaluationDate}</td>
                  <td className={`px-6 py-4 whitespace-nowrap border-b border-slate-200 font-medium ${ev.finalGrade < GRADING_CONSTANTS.PASSING_GRADE ? 'text-red-600' : 'text-green-600'}`}>
                    {safeNumber(ev.finalGrade).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-slate-50 p-6 rounded-lg text-center text-slate-500">
          <p>No hay evaluaciones que coincidan con el filtro de curso seleccionado.</p>
        </div>
      )}

      <h3 className="text-xl font-semibold text-slate-700 mt-8 mb-4">Promedio por Indicador</h3>
      <div className="space-y-4">
        {averageScores.map(avg => (
          <div key={avg.indicatorId} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-800">{avg.title}</span>
              <span className={`font-bold text-lg ${
                avg.averageScore >= (GRADING_CONSTANTS.MAX_POSSIBLE_SCORE_PER_INDICATOR * 0.75) ? 'text-green-600' :
                avg.averageScore >= (GRADING_CONSTANTS.MAX_POSSIBLE_SCORE_PER_INDICATOR * 0.5) ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {safeNumber(avg.averageScore).toFixed(1)} / {safeNumber(GRADING_CONSTANTS.MAX_POSSIBLE_SCORE_PER_INDICATOR).toFixed(0)}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
              <div 
                className={`h-2.5 rounded-full ${
                  avg.averageScore >= (GRADING_CONSTANTS.MAX_POSSIBLE_SCORE_PER_INDICATOR * 0.75) ? 'bg-green-500' :
                  avg.averageScore >= (GRADING_CONSTANTS.MAX_POSSIBLE_SCORE_PER_INDICATOR * 0.5) ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${(safeNumber(avg.averageScore) / safeNumber(GRADING_CONSTANTS.MAX_POSSIBLE_SCORE_PER_INDICATOR)) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 mt-1">Basado en {avg.count} evaluaciones.</p>
          </div>
        ))}
      </div>
    </div>
  );
};
