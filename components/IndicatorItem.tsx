
import React from 'react';
import { RubricItem, ScorePoints, ScoreLevelDetail } from '../types';

interface IndicatorItemProps {
  item: RubricItem;
  selectedScore?: ScorePoints;
  onScoreSelect: (indicatorId: string, score: ScorePoints) => void;
  isSubmitted: boolean; // To show validation errors
}

interface ScoreButtonProps {
  level: ScoreLevelDetail;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const ScoreButton = ({ level, isSelected, onClick, disabled }: ScoreButtonProps) => {
  const baseClasses = "w-full sm:w-auto flex-1 text-sm sm:text-xs text-center px-3 py-2.5 rounded-md border transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1";
  const selectedClasses = "bg-blue-600 text-white border-blue-700 shadow-md transform scale-105";
  const unselectedClasses = "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400";
  const disabledClasses = "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${disabled ? disabledClasses : (isSelected ? selectedClasses : unselectedClasses)}`}
      aria-pressed={isSelected}
    >
      <div className="font-semibold">{level.levelName} ({level.points} pto)</div>
      <div className="text-xs mt-1 hidden sm:block">{level.description}</div>
    </button>
  );
};


export const IndicatorItem = ({ item, selectedScore, onScoreSelect, isSubmitted }: IndicatorItemProps) => {
  const showError = isSubmitted && selectedScore === undefined;

  return (
    <div className={`bg-white shadow-lg rounded-xl p-6 mb-6 transition-all duration-300 ease-in-out ${showError ? 'ring-2 ring-red-500' : 'hover:shadow-xl'}`}>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{item.title}</h3>
      {selectedScore && (
         <p className="text-xs text-slate-500 mb-4 sm:hidden">
           {item.levels.find(l => l.points === selectedScore)?.description}
         </p>
      )}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-3">
        {item.levels.map((level) => (
          <ScoreButton
            key={level.points}
            level={level}
            isSelected={selectedScore === level.points}
            onClick={() => onScoreSelect(item.id, level.points)}
          />
        ))}
      </div>
      {showError && (
        <p className="text-red-600 text-xs mt-2">Por favor, selecciona un puntaje para este indicador.</p>
      )}
    </div>
  );
};
