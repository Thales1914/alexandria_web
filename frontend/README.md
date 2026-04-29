# Alexandria Frontend (React + Vite)

Aplicacao frontend do projeto Alexandria.

## Configuracao de ambiente

1. Crie o arquivo `frontend/.env.local`.
2. Copie o conteudo de `frontend/.env.example`.
3. Preencha a chave da Google Books API em `VITE_GOOGLE_BOOKS_API_KEY`.

Exemplo:

```env
VITE_API_URL=http://localhost:8080
VITE_GOOGLE_BOOKS_URL=https://www.googleapis.com/books/v1/volumes
VITE_GOOGLE_BOOKS_API_KEY=SUA_CHAVE_AQUI
VITE_GOOGLE_BOOKS_LANG=pt
VITE_GOOGLE_BOOKS_COUNTRY=BR
```

## Onde colocar a chave

A chave deve ficar no arquivo:

`frontend/.env.local`

Use a variavel:

`VITE_GOOGLE_BOOKS_API_KEY=...`

## Rodando o projeto

```bash
npm install
npm run dev
```

Build de producao:

```bash
npm run build
```
