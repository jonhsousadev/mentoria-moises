import { randomUUID } from 'node:crypto';

const notas = new Map();

criarNotaNoStore({
  titulo: 'Estudar REST',
  conteudo: 'URIs em plural, verbos HTTP, status codes.',
  tags: ['rest', 'q1'],
  status: 'aberta',
});

criarNotaNoStore({
  titulo: 'Desenhar a API no .http',
  conteudo: 'Rodar as requests no REST Client antes de codar.',
  tags: ['rest', 'exercise'],
  status: 'aberta',
});

criarNotaNoStore({
  titulo: 'Escrever o openapi.yaml',
  conteudo: 'Só depois que o .http estiver verde.',
  tags: ['openapi'],
  status: 'concluida',
});

export function listarNotas({ page, limit }) {
  const todas = [...notas.values()].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  const inicio = (page - 1) * limit;

  return {
    data: todas.slice(inicio, inicio + limit),
    total: todas.length,
  };
}

export function buscarNota(id) {
  return notas.get(id);
}

export function criarNotaNoStore({ titulo, conteudo = '', tags = [], status = 'aberta' }) {
  const nota = {
    id: randomUUID(),
    titulo: titulo.trim(),
    conteudo,
    tags,
    status,
    criadoEm: new Date().toISOString(),
  };

  notas.set(nota.id, nota);

  return nota;
}

export function substituirNota(id, { titulo, conteudo = '', tags = [], status = 'aberta' }) {
  const existente = notas.get(id);

  if (!existente) {
    return undefined;
  }

  const nota = { ...existente, titulo: titulo.trim(), conteudo, tags, status };
  notas.set(id, nota);

  return nota;
}

export function removerNota(id) {
  return notas.delete(id);
}
