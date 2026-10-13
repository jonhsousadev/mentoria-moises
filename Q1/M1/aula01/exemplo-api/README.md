# Exemplo — Aula 01 · API de Notas (Node + Express)

Implementação de referência da aula. A **metade já existe**; a outra metade é o
exercício.

## Rodar

```bash
npm install
npm start        # http://localhost:3000
```

Requests: [`../exercicio-aula01.http`](../exercicio-aula01.http) com a extensão
**REST Client** do VS Code (ou httpYac).

## Estrutura

```
exemplo-api/
├── src/
│   ├── server.js          # sobe o servidor
│   ├── app.js             # middlewares + 404 + handler de erro
│   ├── routes/notas.js    # endpoints prontos + bloco do EXERCÍCIO
│   ├── store.js           # armazenamento em memória
│   ├── idempotency.js     # Idempotency-Key (comentário didático completo)
│   └── problem.js         # erros application/problem+json (RFC 7807)
└── package.json
```

## O que já está pronto (Parte 1 do `.http`)

| Método | Rota | Status |
|--------|------|--------|
| GET | `/v1/notas?page&limit` | 200 |
| GET | `/v1/notas/:id` | 200 / 404 |
| POST | `/v1/notas` | 201 + `Location` / 400 |
| PUT | `/v1/notas/:id` | 200 / 404 |
| DELETE | `/v1/notas/:id` | 204 / 404 |

## Exercício (Parte 2 do `.http`) — ainda NÃO implementados

| Método | Rota | O que falta |
|--------|------|-------------|
| GET | `/v1/notas?status&tag` | filtrar de verdade (hoje ignora os params) |
| PATCH | `/v1/notas/:id` | atualização parcial |
| GET | `/v1/notas/:id/etiquetas` | sub-recurso de leitura |
| POST | `/v1/notas/:id/etiquetas` | sub-recurso de criação |

Cada request traz o contrato comentado (status esperados e regras).
Implemente em `src/routes/notas.js`, no bloco `EXERCÍCIO DA AULA`, e reexecute
o `.http` até ficar verde.

## Idempotência (Parte 3)

`POST` não é idempotente: um retry de rede duplica o recurso. Por isso a API
aceita o header opcional `Idempotency-Key` — a segunda execução com a mesma
chave devolve a resposta original com `Idempotency-Replayed: true`.

Explicação completa no comentário de [`src/idempotency.js`](src/idempotency.js);
em produção o cache vive em Redis com TTL e trava para requisições concorrentes.

## Ordem do exercício

1. `.http` parte 1 verde (API de exemplo no ar).
2. `.http` parte 2: implementar os 4 endpoints faltantes.
3. `.http` parte 3: conferir o replay de idempotência.
4. Só então gerar o `openapi.yaml`.
