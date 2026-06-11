# ALEXANDRIA

Plataforma web para organizar leituras, montar uma biblioteca pessoal digital e acompanhar a jornada do leitor.

O ALEXANDRIA permite pesquisar livros, visualizar detalhes, salvar obras na biblioteca, controlar status de leitura, registrar avaliacoes, interagir em uma comunidade interna e acompanhar conquistas por XP.

## Aplicacao publicada

- Frontend: https://frontend-production-afa3.up.railway.app
- Backend: https://backend-production-ddd2.up.railway.app
- Health check da API: https://backend-production-ddd2.up.railway.app/api/health

Observacao: abrir a URL raiz do backend diretamente pode retornar acesso negado, pois a maior parte da API exige autenticacao. Para verificar disponibilidade, use o endpoint `/api/health`.

## Funcionalidades

- Cadastro e login de usuarios com autenticacao JWT.
- Recuperacao de senha por token temporario.
- Perfil do usuario com consulta e edicao de dados.
- Pesquisa de livros usando a Google Books API pelo backend.
- Tela de detalhes do livro com capa, autores, descricao e dados bibliograficos.
- Biblioteca pessoal por usuario.
- Status de leitura: quero ler, lendo, lido e abandonado.
- Marcacao de livros favoritos.
- Remocao de livros da biblioteca.
- Avaliacoes com nota de 1 a 5 e resenha.
- Edicao, exclusao e listagem de avaliacoes do usuario logado.
- Exportacao das avaliacoes em CSV.
- Comunidade com publicacoes, curtidas e comentarios.
- Publicacao automatica na comunidade quando uma avaliacao e criada.
- Sistema de conquistas, niveis e XP persistido por usuario.
- Isolamento de dados entre contas diferentes.

## Tecnologias

### Frontend

- React 19
- Vite
- React Router
- Axios
- CSS por paginas e componentes

### Backend

- Java 17
- Spring Boot 4.0.5
- Spring Security
- JWT
- Spring Data JPA
- Hibernate
- PostgreSQL
- Google Books API

### Deploy

- Railway para frontend, backend e PostgreSQL.
- GitHub como repositorio remoto.

## Estrutura do projeto

```text
alexandria-full/
  backend/    API REST em Spring Boot
  frontend/   Aplicacao web em React + Vite
```

## Como rodar localmente

### 1. Backend

Entre na pasta do backend:

```bash
cd backend
```

Crie/configure as variaveis de ambiente com base em `backend/.env.example`:

```env
SPRING_PROFILES_ACTIVE=local
PORT=8080
DB_URL=jdbc:postgresql://localhost:5432/alexandria
DB_USERNAME=postgres
DB_PASSWORD=sua_senha_local
JWT_SECRET=troque_por_uma_chave_forte_com_no_minimo_32_caracteres
FRONTEND_URL=http://localhost:5173
JPA_DDL_AUTO=update
JPA_SHOW_SQL=false
JPA_FORMAT_SQL=false
GOOGLE_BOOKS_API_KEY=SUA_CHAVE_AQUI
GOOGLE_BOOKS_LANG=pt
GOOGLE_BOOKS_COUNTRY=BR
```

Execute:

```bash
./mvnw spring-boot:run
```

No Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

### 2. Frontend

Entre na pasta do frontend:

```bash
cd frontend
```

Crie `frontend/.env.local` com a URL da API:

```env
VITE_API_URL=http://localhost:8080
```

Instale as dependencias e rode:

```bash
npm install
npm run dev
```

## Build e validacao

Backend:

```bash
cd backend
./mvnw test
./mvnw -DskipTests package
```

Frontend:

```bash
cd frontend
npm run build
```

## Variaveis no Railway

### Backend

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `FRONTEND_URL`
- `GOOGLE_BOOKS_API_KEY`
- `GOOGLE_BOOKS_LANG`
- `GOOGLE_BOOKS_COUNTRY`
- `JPA_DDL_AUTO`
- `JPA_SHOW_SQL`
- `JPA_FORMAT_SQL`

### Frontend

- `VITE_API_URL`

Importante: chaves reais, senhas e segredos devem ficar apenas nas variaveis de ambiente do Railway ou em arquivos locais ignorados pelo Git.

## Roteiro rapido para demonstracao

1. Abrir o frontend publicado.
2. Criar uma conta nova.
3. Fazer login.
4. Pesquisar um livro na aba Explorar.
5. Abrir os detalhes e adicionar o livro a biblioteca.
6. Alterar status de leitura e marcar como favorito.
7. Criar uma avaliacao com nota e resenha.
8. Abrir Minhas avaliacoes e testar edicao/exportacao CSV.
9. Abrir Comunidade e confirmar a publicacao automatica da avaliacao.
10. Curtir e comentar uma publicacao.
11. Abrir Conquistas e verificar XP, nivel e historico.
12. Entrar com outra conta para demonstrar isolamento de dados.

## Branches

- `main`: versao estavel para apresentacao e deploy.
- `dev`: branch de desenvolvimento e integracao das funcionalidades.

