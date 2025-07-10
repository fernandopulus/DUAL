// functions/src/index.ts

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// Limita a 10 el número máximo de instancias concurrentes por función
setGlobalOptions({maxInstances: 10});

// Función básica para probar el deploy
export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("¡Hola desde Firebase con TypeScript!");
});
