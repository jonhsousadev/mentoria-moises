import express from 'express';

import { idempotency } from './idempotency.js';
import { problem } from './problem.js';
import { notasRouter } from './routes/notas.js';

export function createApp() {
  const app = express();

  app.use(express.json());

  // Toda requisição passa pela checagem de Idempotency-Key antes das rotas.
  app.use(idempotency());

  app.use('/v1/notas', notasRouter);

  app.use((request, response) => {
    problem(
      response,
      404,
      'Recurso não encontrado',
      `Não existe rota ${request.method} ${request.path}`,
    );
  });

  // Erro de JSON malformado vira 400 problem+json, nunca HTML de stack trace.
  app.use((error, request, response, next) => {
    if (error instanceof SyntaxError && 'body' in error) {
      return problem(response, 400, 'Payload inválido', 'JSON malformado no corpo da requisição.');
    }

    console.error(error);
    return problem(response, 500, 'Erro interno', 'Algo quebrou no servidor. Use o traceId nos logs.');
  });

  return app;
}
