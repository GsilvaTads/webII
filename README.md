# Documentação do Projeto: Kanban MVC em TypeScript

Aplicação web de gerenciamento de tarefas no estilo **Kanban** desenvolvida em **TypeScript** com **Express**, estruturada sob o padrão arquitetural **MVC (Model-View-Controller)**, com desacoplamento via **Ports & Adapters (Inversão de Dependência)**, aderência ao padrão **Post/Redirect/Get (PRG)** e suíte de testes automatizados com **100% de cobertura**.

---

## Tecnologias Utilizadas

- **Linguagem:** [TypeScript](https://www.typescriptlang.org/) (ESM nativo)
- **Backend / Servidor:** [Node.js](https://nodejs.org/) com [Express](https://expressjs.com/)
- **Camada de Visão (View):** [EJS](https://ejs.co/) (Embedded JavaScript) estilizado com [Tailwind CSS](https://tailwindcss.com/)
- **Testes Automatizados:** [Vitest](https://vitest.dev/) com provedor de cobertura `@vitest/coverage-v8`
- **Testes de Integração HTTP:** [Supertest](https://github.com/ladjs/supertest)

---

## Arquitetura e Decisões de Design

A aplicação foi organizada com separação rígida de responsabilidades:

- **Model (`src/boards`, `src/cards`):** Entidades de domínio ricas (`Board`, `Column`, `Card`) com encapsulamento estrito (protegendo dados internos e permitindo alterações apenas por métodos de negócio como `rename()`, `changePriority()` e `changeColumn()`). A persistência é gerenciada por repositórios (`BoardRepository`, `CardRepository`).
- **View (`src/views`):** Templates EJS que consom ViewModels preparados (`boardView.ts`, `cardView.ts`), evitando expor métodos internos de domínio diretamente à camada de apresentação.
- **Controller (`src/boards/BoardController.ts`, `src/cards/CardController.ts`):** Orquestram o fluxo de entrada HTTP, acionam as validações de domínio e retornam instruções de renderização ou redirecionamento via padrão PRG.
- **Desacoplamento via Ports & Adapters (DIP):** Para evitar acoplamento direto entre os módulos `cards` e `boards`, o `CardController` depende da interface/porta `ColumnChecker`, implementada pelo adaptador `BoardColumnChecker`.

---

## Atividades Implementadas

| Atividade | Descrição | Arquivos Modificados / Criados |
| :--- | :--- | :--- |
| **Atividade 1** | Criação de novos cartões em coluna específica via `POST /cards` com redirecionamento PRG. | `src/cards/CardController.ts`, `src/views/board/index.ejs` |
| **Atividade 2** | Movimentação de cartões entre colunas via `POST /cards/:id/move`. | `src/cards/CardController.ts`, `src/cards/Card.ts`, `src/views/board/index.ejs` |
| **Atividade 3** | Edição de título, descrição e prioridade via `POST /cards/:id/update`. | `src/cards/CardController.ts`, `src/cards/Card.ts`, `src/views/board/index.ejs` |
| **Atividade 4** | Exclusão de cartões via `POST /cards/:id/delete` com diálogo nativo de confirmação (`confirm()`). | `src/cards/CardController.ts`, `src/views/board/index.ejs` |
| **Atividade 5** | Limite de WIP (*Work in Progress*) com bloqueio HTTP 409 (*Conflict*) no `move` e no `create`. | `src/cards/CardController.ts`, `src/cards/errors.ts`, `src/shared/errorHandler.ts` |
| **Atividade 6** | Prevenção de cartões com títulos duplicados na mesma coluna (HTTP 409 Conflict). | `src/cards/CardRepository.ts`, `src/cards/CardController.ts` |
| **Atividade 7** | Criação dinâmica de novas colunas com limite opcional de WIP via `POST /columns`. | `src/boards/Board.ts`, `src/boards/BoardController.ts`, `src/views/board/index.ejs` |

---

## Suíte de Testes e Relatório de Cobertura

A cobertura de código cobre 100% de linhas, ramificações, funções e instruções:

```bash
# Executar a suíte de testes completa
npm test

# Executar a verificação com relatório de cobertura
npm run test:coverage
