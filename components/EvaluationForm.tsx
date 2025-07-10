
import React from 'react';
import { RUBRIC_DATA, COURSE_OPTIONS } from '../src/constants';
import { StudentEvaluation, ScorePoints } from '../types';
import { IndicatorItem } from './IndicatorItem';

interface EvaluationFormProps {
  studentName: string;
  onStudentNameChange: (name: string) => void;
  course: string;
  onCourseChange: (course: string) => void;
  scores: StudentEvaluation;
  onScoreChange: (indicatorId: string, score: ScorePoints) => void;
  isSubmitted: boolean;
}

export const EvaluationForm = ({
  studentName,
  onStudentNameChange,
  course,
  onCourseChange,
  scores,
  onScoreChange,
  isSubmitted,
}: EvaluationFormProps) => {
  const nameError = isSubmitted && !studentName.trim();
  const courseError = isSubmitted && !course;

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Formulario de Evaluación</h2>
      
      <div className="mb-6">
        <label htmlFor="studentName" className="block text-sm font-medium text-slate-700 mb-1">
          Nombre del Estudiante
        </label>
        <input
          type="text"
          id="studentName"
          value={studentName}
          onChange={(e) => onStudentNameChange(e.target.value)}
          className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150 ${nameError ? 'border-red-500 ring-red-500' : 'border-slate-300'}`}
          placeholder="Ingrese el nombre completo del estudiante"
        />
        {nameError && (
          <p className="text-red-600 text-xs mt-1">El nombre del estudiante es requerido.</p>
        )}
      </div>

      <div className="mb-8">
        <label htmlFor="course" className="block text-sm font-medium text-slate-700 mb-1">
          Curso
        </label>
        <select
          id="course"
          value={course}
          onChange={(e) => onCourseChange(e.target.value)}
          className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150 ${courseError ? 'border-red-500 ring-red-500' : 'border-slate-300'}`}
        >
          <option value="" disabled>Seleccione un curso</option>
          {COURSE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {courseError && (
          <p className="text-red-600 text-xs mt-1">La selección del curso es requerida.</p>
        )}
      </div>


      <div>
        <h3 className="text-xl font-semibold text-slate-700 mb-4">Indicadores de Evaluación</h3>
        {RUBRIC_DATA.map((item) => (
          <IndicatorItem
            key={item.id}
            item={item}
            selectedScore={scores[item.id]}
            onScoreSelect={onScoreChange}
            isSubmitted={isSubmitted}
          />
        ))}
      </div>
    </div>
  );
};
