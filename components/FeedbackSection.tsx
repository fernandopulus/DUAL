
import React from 'react';
import { GroundingMetadata } from '../types'; // Updated import

interface FeedbackSectionProps {
  aiFeedback: string | null;
  isLoadingFeedback: boolean;
  groundingMetadata?: GroundingMetadata; // Updated prop type
}

export const FeedbackSection = ({ aiFeedback, isLoadingFeedback, groundingMetadata }: FeedbackSectionProps) => {
  if (isLoadingFeedback) {
    return (
      <div className="bg-white shadow-xl rounded-lg p-6 mt-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Retroalimentación con IA</h2>
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-slate-600">Generando retroalimentación, por favor espera...</p>
        </div>
      </div>
    );
  }

  if (!aiFeedback) {
    return null;
  }

  const attributions = groundingMetadata?.groundingAttributions;

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-3">Retroalimentación Personalizada (IA)</h2>
      <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap">
        {aiFeedback}
      </div>
      {attributions && attributions.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Fuentes Consultadas por IA (Google Search):</h3>
          {groundingMetadata?.webSearchQueries && groundingMetadata.webSearchQueries.length > 0 && (
            <p className="text-sm text-slate-500 mb-2">Consultas realizadas: {groundingMetadata.webSearchQueries.join(', ')}</p>
          )}
          <ul className="list-disc list-inside space-y-1">
            {attributions.map((attr, index) => {
              const source = attr.web || attr.retrievedContext; // Prioritize web, fallback to retrievedContext
              if (source && source.uri) {
                return (
                  <li key={index} className="text-sm">
                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                      {source.title || source.uri}
                    </a>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
