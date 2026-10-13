import { Router } from 'express';

import { problem } from '../problem.js';
import {
  buscarNota,
  criarNotaNoStore,
  listarNotas,
  removerNota,
  substituirNota,
} from '../store.js';

export const notasRouter = Router();

const LIMITE_PADRAO = 10;
const LIMITE_MAXIMO = 50;

// ---------------------------------------------------------------------------
// PRONTOS — endpoints já implementados (teste no exercicio-aula01.http)
// ---------------------------------------------------------------------------

notasRouter.get('/', (request, response) => {
  const page = paraNumeroPositivo(request.query.page, 1);
  const limit = Math.min(paraNumeroPositivo(request.query.limit, LIMITE_PADRAO), LIMITE_MAXIMO);

  const { data, total } = listarNotas({ page, limit });

  response.json({ data, page, limit, total });
});

notasRouter.get('/:id', (request, response) => {
  const nota = buscarNota(request.params.id);

  if (!nota) {
    return problem(response, 404, 'Nota não encontrada', `Não existe nota com id ${request.params.id}`);
  }

  return response.json(nota);
});

notasRouter.post('/', (request, response) => {
  const nota = request.body ?? {};
  const erroDeValidacao = validarTitulo(nota.titulo);

  if (erroDeValidacao) {
    return problem(response, 400, 'Payload inválido', erroDeValidacao);
  }

  const criada = criarNotaNoStore(nota);

  // 201 sempre devolve Location do recurso criado.
  return response.location(`/v1/notas/${criada.id}`).status(201).json(criada);
});

notasRouter.put('/:id', (request, response) => {
  const nota = request.body ?? {};
  const erroDeValidacao = validarTitulo(nota.titulo);

  if (erroDeValidacao) {
    return problem(response, 400, 'Payload inválido', erroDeValidacao);
  }

  const substituida = substituirNota(request.params.id, nota);

  if (!substituida) {
    return problem(response, 404, 'Nota não encontrada', `Não existe nota com id ${request.params.id}`);
  }

  return response.json(substituida);
});

notasRouter.delete('/:id', (request, response) => {
  const removeu = removerNota(request.params.id);

  if (!removeu) {
    return problem(response, 404, 'Nota não encontrada', `Não existe nota com id ${request.params.id}`);
  }

  return response.status(204).send();
});

// ---------------------------------------------------------------------------
// EXERCÍCIO DA AULA — endpoints PEDIDOS no .http e AINDA NÃO implementados.
//
// Eles respondem 404 "Não existe rota ..." até você criá-los aqui,
// seguindo o contrato descrito em exercicio-aula01.http:
//
//   GET    /v1/notas?status=aberta&tag=rest   -> filtro na listagem (200)
//   PATCH  /v1/notas/:id                      -> atualização parcial (200/400/404)
//   GET    /v1/notas/:id/etiquetas            -> sub-recurso (200/404)
//   POST   /v1/notas/:id/etiquetas            -> cria no sub-recurso (201/400/404)
//
// Antes de codar: descreva a request no .http, execute, leia o 404,
// e só então implemente. Contrato primeiro, framework depois.
// ---------------------------------------------------------------------------

function validarTitulo(titulo) {
  if (typeof titulo !== 'string' || titulo.trim() === '') {
    return 'O campo "titulo" é obrigatório e não pode ser vazio.';
  }

  if (titulo.length > 120) {
    return 'O campo "titulo" deve ter no máximo 120 caracteres.';
  }

  return undefined;
}

function paraNumeroPositivo(valor, padrao) {
  const numero = Number(valor);

  if (!Number.isInteger(numero) || numero < 1) {
    return padrao;
  }

  return numero;
}
