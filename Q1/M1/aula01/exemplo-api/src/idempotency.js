/**
 * IDEMPOTÊNCIA — exemplo prático da Aula 01.
 *
 * Definição: repetir a MESMA requisição N vezes produz o mesmo efeito
 * de executá-la UMA vez. Ou seja, o estado final do servidor é igual,
 * mesmo que a rede reenvie o pacote.
 *
 * ------------------------------------------------------------------
 * Quem É idempotente (RFC 9110):
 *
 *   GET    /v1/notas/1  ->  ler não muda nada. Repetir é de graça.
 *   PUT    /v1/notas/1  ->  substitui por completo.
 *        1ª vez: {titulo: "A"}  -> nota = A
 *        2ª vez: {titulo: "A"}  -> nota = A (mesmo resultado)
 *   DELETE /v1/notas/1  ->  remove.
 *        1ª vez: 204, 2ª vez: 404 — status muda, MAS o estado final é
 *        o mesmo (a nota continua não existindo). Por isso é idempotente.
 *
 * ------------------------------------------------------------------
 * Quem NÃO é idempotente:
 *
 *   POST /v1/notas  ->  cada chamada cria UMA NOTA NOVA.
 *        1ª vez: nota id=abc  -> 201 Created
 *        2ª vez: nota id=def  -> 201 Created  (DUPLICOU!)
 *
 *   Cenário de bug real: o cliente clica em "Salvar", a rede cai no
 *   meio da resposta, o fetch/axios reenvia automaticamente... e o
 *   usuário acaba com a mesma nota cadastrada DUAS vezes.
 *
 * ------------------------------------------------------------------
 * Solução: header opcional `Idempotency-Key` no POST.
 *
 *   POST /v1/notas
 *   Idempotency-Key: 4f1a9c2e-...   (uuid gerado no cliente)
 *
 *   1ª execução: processa, guarda a chave + a resposta devolvida.
 *   Reenvio com a MESMA chave: NÃO reprocessa — devolve a resposta
 *     original (status, Location e corpo) e sinaliza
 *     `Idempotency-Replayed: true`.
 *   Chave diferente: trata como uma nova requisição.
 *
 *   Em produção isso vive em Redis/TTL de 24h, com a chave ligada ao
 *   usuário autenticado e trava para requisições concorrentes com a
 *   mesma chave (devolver 409 ou 425 enquanto a primeira não terminar).
 *
 * A idempotência do POST é OPCIONAL: sem o header, o middleware deixa
 * a requisição passar e o POST continua comum.
 */

const cacheDeRespostas = new Map();

export function idempotency() {
  return (request, response, next) => {
    const chave = request.get('Idempotency-Key');

    // Sem chave = cliente não quer proteção. Segue o fluxo normal.
    if (!chave) {
      return next();
    }

    const respostaGuardada = cacheDeRespostas.get(chave);

    // Reenvio da mesma chave: replay da resposta original, sem reprocessar.
    if (respostaGuardada) {
      response.status(respostaGuardada.status);
      response.set(respostaGuardada.headers);
      response.set('Idempotency-Replayed', 'true');
      return response.json(respostaGuardada.corpo);
    }

    interceptaRespostaDeSucesso(response, chave);

    return next();
  };
}

/**
 * Guarda a resposta só quando ela for de sucesso (2xx).
 * Erro não é cacheado: o cliente pode corrigir o payload e reenviar
 * com a MESMA chave, e aí a requisição precisa ser processada de verdade.
 */
function interceptaRespostaDeSucesso(response, chave) {
  const jsonOriginal = response.json.bind(response);

  response.json = (corpo) => {
    const foiSucesso = response.statusCode >= 200 && response.statusCode < 300;

    if (foiSucesso) {
      cacheDeRespostas.set(chave, {
        status: response.statusCode,
        corpo,
        headers: { Location: response.get('Location') ?? '' },
      });
    }

    return jsonOriginal(corpo);
  };
}
