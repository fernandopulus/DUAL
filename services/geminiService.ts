
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { StudentEvaluation, RubricItem, ScorePoints, GroundingMetadata } from '../types';
import { RUBRIC_DATA } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable is not set.");
  // Potentially throw an error or handle this state in the UI
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" }); // Fallback to prevent crash if key is missing during init

function getLevelNameForScore(rubricItem: RubricItem, score: ScorePoints): string {
    const level = rubricItem.levels.find(l => l.points === score);
    return level ? level.levelName : "Nivel Desconocido";
}

function getLevelDescriptionForScore(rubricItem: RubricItem, score: ScorePoints): string {
    const level = rubricItem.levels.find(l => l.points === score);
    return level ? level.description : "Descripción Desconocida";
}

export async function generateAIFeedback(
  studentName: string,
  scores: StudentEvaluation
): Promise<{ feedbackText: string; groundingMetadata?: GroundingMetadata }> {
  if (!API_KEY) {
    return { feedbackText: "Error: La clave API de Gemini no está configurada. Por favor, contacte al administrador." };
  }

  let promptDetails = `Nombre del Estudiante: ${studentName}\n\n`;
  promptDetails += "--- RÚBRICA Y PUNTAJES OBTENIDOS ---\n";

  RUBRIC_DATA.forEach(item => {
    const score = scores[item.id];
    if (score === undefined) return;

    promptDetails += `\nIndicador: ${item.title}\n`;
    promptDetails += `Puntaje Obtenido: ${score} (${getLevelNameForScore(item, score)})\n`;
    promptDetails += `Descripción del Nivel Alcanzado: ${getLevelDescriptionForScore(item, score)}\n`;
    promptDetails += "Niveles de la Rúbrica:\n";
    item.levels.forEach(level => {
      promptDetails += `  - ${level.levelName} (${level.points} pto): ${level.description}\n`;
    });
  });

  const systemInstruction = `Eres un asistente de IA experto en evaluación pedagógica para el Liceo Industrial de Recoleta. Estás evaluando la presentación dual de un estudiante.
Tu tarea es generar una retroalimentación constructiva, personalizada y profesional.`;
  
  const userPrompt = `${promptDetails}

--- INSTRUCCIONES PARA LA RETROALIMENTACIÓN ---
Basándote en la rúbrica y los puntajes detallados arriba, genera una retroalimentación en ESPAÑOL para el estudiante. La retroalimentación debe:
1.  Comenzar con un saludo cordial y personalizado (ej: "Estimado/a ${studentName},").
2.  Identificar claramente las Fortalezas Clave (2-3 indicadores con puntajes altos). Para cada fortaleza, explica brevemente qué hizo bien el estudiante, haciendo referencia a la descripción del nivel alcanzado en la rúbrica.
3.  Identificar con tacto las Áreas de Oportunidad (2-3 indicadores con los puntajes más bajos). Para cada área, describe qué aspectos específicos necesitan desarrollo, basándote en la descripción del nivel alcanzado y los niveles superiores no alcanzados.
4.  Proporcionar Recomendaciones Específicas y Accionables: Para cada área de oportunidad, ofrece 1-2 sugerencias concretas y prácticas que el estudiante puede implementar para mejorar.
5.  Incluir un Reconocimiento General de su esfuerzo y participación.
6.  Ofrecer Sugerencias Generales para Futuras Presentaciones (1-2 consejos).
7.  Finalizar con una nota de aliento y motivación.
Mantén un tono profesional, empático, alentador y constructivo. El objetivo es ayudar al estudiante a comprender su desempeño y a crecer.
La retroalimentación debe ser un texto coherente y bien estructurado. Evita usar markdown excesivo en la respuesta, solo párrafos y quizás listas simples si es necesario.
`;

  try {
    // Correct way to structure contents for single-turn, non-chat generation
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: userPrompt, // Direct string for simple prompts, or an array of Content objects for more complex ones.
                            // For a single user message, direct string is fine.
                            // If you need roles, it would be [{ role: "user", parts: [{text: userPrompt}] }]
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.6, 
          topP: 0.9,
          topK: 40,
          // Example of enabling Google Search if needed, though not explicitly requested for this feedback generation
          // tools: [{googleSearch: {}}], 
        }
    });
    
    const feedbackText = response.text;
    const groundingMeta = response.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined;

    return { feedbackText, groundingMetadata: groundingMeta };

  } catch (error) {
    console.error("Error generating AI feedback:", error);
    let errorMessage = "Error al generar la retroalimentación con IA. Inténtalo de nuevo.";
    if (error instanceof Error) {
        errorMessage += ` Detalles: ${error.message}`;
    }
    return { feedbackText: errorMessage };
  }
}