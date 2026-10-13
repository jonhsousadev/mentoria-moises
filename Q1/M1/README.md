# M1 — Contratos de API

Primeiro mes do Q1. Tema central: desenhar API antes de codar (REST + OpenAPI).

## Aulas

| Aula | Tema | Status |
|------|------|--------|
| 01 | REST + OpenAPI | criado |
| 02 | Node + Express aplicando a spec | planejada |
| 03 | Versionamento, erros e testes de contrato | planejada |
| 04 | Dockerizando a API + checkpoint do mes | planejada |

## Aula 01 — REST + OpenAPI

Deck: [`aula01/index.html`](aula01/index.html) — 12 slides.

- Abra direto no navegador ou sirva com `npx serve aula01`.
- Conteudo: restricoes de REST, URIs/verbos, status codes, idempotencia,
  erros RFC 7807, anatomia de `openapi.yaml` e o desenho com REST Client.

## Exercício — a ordem importa

O `.http` tem 3 partes. A API de exemplo cobre só a primeira.

1. **Parte 1** — subir [`aula01/exemplo-api`](aula01/exemplo-api) e deixar
   verde os endpoints prontos (200/201/204/400/404).
2. **Parte 2 (o exercício)** — [`aula01/exercicio-aula01.http`](aula01/exercicio-aula01.http)
   pede 4 endpoints que a API ainda **não** tem: filtro da lista, PATCH e o
   sub-recurso de etiquetas (GET/POST). Implementá-los em
   `exemplo-api/src/routes/notas.js` seguindo o contrato comentado.
3. **Parte 3** — conferir a idempotência do POST com `Idempotency-Key`.
4. Só depois disso tudo: gerar o `openapi.yaml`.

O `.http` é versionado no repositorio e revisado em PR como codigo.


## Entrega do mes

API REST documentada com `openapi.yaml`, paginao, erros padrao e
implementacao em Node + Express.
