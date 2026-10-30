import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 3000);

const app = createApp();

app.listen(port, () => {
  console.log(`API de notas no ar em http://localhost:${port}`);
  console.log('Requests de teste: exercicio-aula01.http (pasta aula01)');
});
