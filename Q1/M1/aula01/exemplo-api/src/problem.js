import { randomUUID } from 'node:crypto';

/**
 * Erro no formato RFC 7807 (application/problem+json).
 * Mesmo formato para 400, 404, 500 — o cliente trata um único shape.
 */
export function problem(response, status, title, detail) {
  const traceId = randomUUID().replaceAll('-', '').slice(0, 8);

  return response
    .status(status)
    .type('application/problem+json')
    .json({
      type: `https://api.exemplo.com/erros/${paraSlug(title)}`,
      title,
      status,
      detail,
      traceId,
    });
}

function paraSlug(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
