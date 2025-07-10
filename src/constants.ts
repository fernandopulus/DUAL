
import { RubricItem } from '../types';

export const RUBRIC_DATA: RubricItem[] = [
  {
    id: "indicador1",
    title: "Presentación personal",
    levels: [
      { points: 1, levelName: "Desarrollo Débil", description: "Presentación básica de datos personales, vestimenta adecuada" },
      { points: 2, levelName: "Desarrollo Incipiente", description: "Incluye desarrollo de aprendizajes e hitos de últimos 2 años, sin piercing" },
      { points: 3, levelName: "Desarrollo Satisfactorio", description: "Agrega reconocimiento de habilidades, competencias, metas y proyecciones" },
      { points: 4, levelName: "Desarrollo Avanzado", description: "Incluye aspectos a fortalecer y ejemplo de experiencia DUAL" },
    ],
  },
  {
    id: "indicador2",
    title: "Descripción de su proceso de vinculación en la alternancia DUAL",
    levels: [
      { points: 1, levelName: "Desarrollo Débil", description: "Descripción superficial del proceso de vinculación" },
      { points: 2, levelName: "Desarrollo Incipiente", description: "Descripción detallada de pasos, involucrados y roles" },
      { points: 3, levelName: "Desarrollo Satisfactorio", description: "Incluye sentimientos y emociones del proceso" },
      { points: 4, levelName: "Desarrollo Avanzado", description: "Agrega estrategias para gestionar emociones" },
    ],
  },
  {
    id: "indicador3",
    title: "Descripción del centro de aprendizaje",
    levels: [
      { points: 1, levelName: "Desarrollo Débil", description: "Características generales básicas" },
      { points: 2, levelName: "Desarrollo Incipiente", description: "Incluye organigrama y profesionales de interacción" },
      { points: 3, levelName: "Desarrollo Satisfactorio", description: "Explica procesos de producción/servicio detalladamente" },
      { points: 4, levelName: "Desarrollo Avanzado", description: "Identifica 10 características y matriz FODA" },
    ],
  },
  {
    id: "indicador4",
    title: "Experiencia de trabajo en Equipo",
    levels: [
      { points: 1, levelName: "Desarrollo Débil", description: "Describe experiencia observada de trabajo en equipo" },
      { points: 2, levelName: "Desarrollo Incipiente", description: "Experiencia asignada, funciones y objetivo común" },
      { points: 3, levelName: "Desarrollo Satisfactorio", description: "Identifica dificultades del proceso" },
      { points: 4, levelName: "Desarrollo Avanzado", description: "Explica cómo resolvió las dificultades" },
    ],
  },
  {
    id: "indicador5",
    title: "Experiencia de resolución de conflictos",
    levels: [
      { points: 1, levelName: "Desarrollo Débil", description: "Identifica crisis/conflicto observado" },
      { points: 2, levelName: "Desarrollo Incipiente", description: "Reconoce componentes y alternativas de resolución" },
      { points: 3, levelName: "Desarrollo Satisfactorio", description: "Identifica componentes, situaciones, emociones y resolución" },
      { points: 4, levelName: "Desarrollo Avanzado", description: "Presenta alternativas adicionales de resolución" },
    ],
  },
  {
    id: "indicador6",
    title: "Experiencia Técnica",
    levels: [
      { points: 1, levelName: "Desarrollo Débil", description: "Explica tareas generales sin experiencia específica" },
      { points: 2, levelName: "Desarrollo Incipiente", description: "Experiencia específica con vocabulario técnico parcial" },
      { points: 3, levelName: "Desarrollo Satisfactorio", description: "Vocabulario técnico completo, vincula habilidades, identifica errores" },
      { points: 4, levelName: "Desarrollo Avanzado", description: "Plantea propuestas de mejora para futuras tareas" },
    ],
  },
  {
    id: "indicador7",
    title: "Propuesta de mejora",
    levels: [
      { points: 1, levelName: "Desarrollo Débil", description: "Propuesta sin diagnóstico claro" },
      { points: 2, levelName: "Desarrollo Incipiente", description: "Identifica oportunidades y propone acción específica" },
      { points: 3, levelName: "Desarrollo Satisfactorio", description: "Incluye comparación y flujograma/ejemplos" },
      { points: 4, levelName: "Desarrollo Avanzado", description: "Propuesta de implementación real" },
    ],
  },
  {
    id: "indicador8",
    title: "Evaluación de su desarrollo y aprendizaje",
    levels: [
      { points: 1, levelName: "Desarrollo Débil", description: "Resume experiencia y tareas generales" },
      { points: 2, levelName: "Desarrollo Incipiente", description: "Detalla aprendizajes y experiencias significativas" },
      { points: 3, levelName: "Desarrollo Satisfactorio", description: "Explica impacto de aprendizajes en el futuro" },
      { points: 4, levelName: "Desarrollo Avanzado", description: "Reconoce elementos por aprender y propuesta para lograrlo" },
    ],
  },
  {
    id: "indicador9",
    title: "Expresión oral",
    levels: [
      { points: 1, levelName: "Desarrollo Débil", description: "Ideas sin claridad en argumentos" },
      { points: 2, levelName: "Desarrollo Incipiente", description: "Ideas claras, elocuentes y fluidas" },
      { points: 3, levelName: "Desarrollo Satisfactorio", description: "Adecua comunicación al contexto y receptor" },
      { points: 4, levelName: "Desarrollo Avanzado", description: "Estrategias para captar atención, buena oratoria y disposición" },
    ],
  },
  {
    id: "indicador10",
    title: "Presentación",
    levels: [
      { points: 1, levelName: "Desarrollo Débil", description: "Al menos un recurso innovador/creativo" },
      { points: 2, levelName: "Desarrollo Incipiente", description: "Presentación atractiva con recursos físicos y digitales" },
      { points: 3, levelName: "Desarrollo Satisfactorio", description: "Mantiene formalidad durante exposición" },
      { points: 4, levelName: "Desarrollo Avanzado", description: "Responde preguntas de participantes" },
    ],
  },
  {
    id: "indicador11",
    title: "Uso eficiente del Tiempo",
    levels: [
      { points: 1, levelName: "Desarrollo Débil", description: "Menos de 6 minutos" },
      { points: 2, levelName: "Desarrollo Incipiente", description: "6-8 minutos, elementos parciales" },
      { points: 3, levelName: "Desarrollo Satisfactorio", description: "8-10 minutos, elementos completos sin profundidad" },
      { points: 4, levelName: "Desarrollo Avanzado", description: "10-12 minutos, profundidad en todos los elementos" },
    ],
  },
  {
    id: "indicador12",
    title: "Empatía",
    levels: [
      { points: 1, levelName: "Desarrollo Débil", description: "Respeto ocasional hacia compañeros/docentes" },
      { points: 2, levelName: "Desarrollo Incipiente", description: "Respeto constante, necesita recordatorio de contexto" },
      { points: 3, levelName: "Desarrollo Satisfactorio", description: "Respeto permanente, atiende presentaciones de pares" },
      { points: 4, levelName: "Desarrollo Avanzado", description: "Demuestra inquietudes y valoraciones oportunas" },
    ],
  },
  {
    id: "indicador13",
    title: "Normas de Seguridad",
    levels: [
      { points: 1, levelName: "Desarrollo Débil", description: "Algunos EPPs y normas, o solo uno de los criterios" },
      { points: 2, levelName: "Desarrollo Incipiente", description: "Algunos EPPs y normas de seguridad" },
      { points: 3, levelName: "Desarrollo Satisfactorio", description: "Todos los EPPs y normas de seguridad" },
      { points: 4, levelName: "Desarrollo Avanzado", description: "Detalla importancia de EPPs y reconoce normas" },
    ],
  },
];

export const GRADING_CONSTANTS = {
  MIN_POSSIBLE_SCORE_PER_INDICATOR: 1,
  MAX_POSSIBLE_SCORE_PER_INDICATOR: 4,
  TOTAL_INDICATORS: RUBRIC_DATA.length,
  get MIN_TOTAL_POSSIBLE_SCORE() { return this.TOTAL_INDICATORS * this.MIN_POSSIBLE_SCORE_PER_INDICATOR; }, // 13
  get MAX_TOTAL_POSSIBLE_SCORE() { return this.TOTAL_INDICATORS * this.MAX_POSSIBLE_SCORE_PER_INDICATOR; }, // 52
  
  SCORE_FOR_PASSING_GRADE: 31.2, // 60% of 52, yields a 4.0
  
  MIN_GRADE: 2.0,
  PASSING_GRADE: 4.0,
  MAX_GRADE: 7.0,
};

export const COURSE_OPTIONS = ["3ºA", "3ºB", "3ºC", "3ºD"];
