import { GoogleGenerativeAI } from "@google/generative-ai";
import { StudentEvaluation, RubricItem, ScorePoints, GroundingMetadata } from '../types';
import { RUBRIC_DATA } from '../constants';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable is not set.");
  console.error("Variables de entorno disponibles:", import.meta.env);
}

// Inicializar correctamente la API de Gemini
const genAI = new GoogleGenerativeAI(API_KEY || "");

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
3.  Identificar con tacto las Áreas de Oportunidad (2-3 indicadores con los puntajes más bajos). Para cada área, describe qué aspectos específicos necesitan desarrollo, basándose en la descripción del nivel alcanzado y los niveles superiores no alcanzados.
4.  Proporcionar Recomendaciones Específicas y Accionables: Para cada área de oportunidad, ofrece 1-2 sugerencias concretas y prácticas que el estudiante puede implementar para mejorar.
5.  Incluir un Reconocimiento General de su esfuerzo y participación.
6.  Ofrecer Sugerencias Generales para Futuras Presentaciones (1-2 consejos).
7.  Finalizar con una nota de aliento y motivación.
Mantén un tono profesional, empático, alentador y constructivo. El objetivo es ayudar al estudiante a comprender su desempeño y a crecer.
La retroalimentación debe ser un texto coherente y bien estructurado. Evita usar markdown excesivo en la respuesta, solo párrafos y quizás listas simples si es necesario.
`;

  try {
    // Obtener el modelo correcto
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction
    });

    // Generar contenido usando la API correcta
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.6,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });

    const response = await result.response;
    const feedbackText = response.text();

    return { feedbackText };

  } catch (error) {
    console.error("Error generating AI feedback:", error);
    let errorMessage = "Error al generar la retroalimentación con IA. Inténtalo de nuevo.";
    if (error instanceof Error) {
        errorMessage += ` Detalles: ${error.message}`;
    }
    return { feedbackText: errorMessage };
  }
}