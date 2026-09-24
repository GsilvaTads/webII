# Documentação do Projeto: Kanban MVC em TypeScript

Aplicação web de gerenciamento de tarefas no estilo **Kanban** desenvolvida em **TypeScript** com **Express**, estruturada sob o padrão arquitetural **MVC (Model-View-Controller)**, com desacoplamento via **Ports & Adapters (Inversão de Dependência)**, aderência ao padrão **Post/Redirect/Get (PRG)** e suíte de testes automatizados com **100% de cobertura**.

---

## Tecnologias Utilizadas

- **Linguagem:** [TypeScript]
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
### Atividade 1 — Criar cartão (`POST /cards`)
**Arquivos:** `src/cards/CardController.ts` (`create`), possivelmente `src/cards/errors.ts`.
**Critério de aceite:**
- Corpo `{ title, columnId, priority?, description? }`; usa `Card.create` (já valida título/prioridade/coluna estruturalmente).
- Retorna 404 se `columnId` não existe no quadro (`boardRepository.getDefault().hasColumn(...)`).
- Salva com `cardRepository.save(...)` e redireciona (ou renderiza) de volta para `/`.
- Testes: substituam o `test.todo` de criação em `cards.routes.test.ts` por um teste real; removam o teste "responde 501" para `POST /cards`.

### Atividade 2 — Mover cartão entre colunas (`POST /cards/:id/move`)
**Arquivos:** `src/cards/Card.ts` (`changeColumn`), `src/cards/CardController.ts` (`move`).
**Critério de aceite:**
- 404 se o cartão não existe; 404 se a coluna destino não existe.
- `Card#changeColumn` deixa de lançar `NotImplementedError` e efetivamente troca `columnId`.
- (Podem aplicar o limite de WIP aqui mesmo, ou deixar para a Atividade 5 — decisão do grupo, documentem qual escolheram.)

### Atividade 3 — Editar cartão (`POST /cards/:id/update`)
**Arquivos:** `src/cards/Card.ts` (`rename`, `changePriority`), `src/cards/CardController.ts` (`update`).
**Critério de aceite:**
- Aceita título, descrição e/ou prioridade novos; 404 se o cartão não existe; 400 se o novo título for inválido.

### Atividade 4 — Excluir cartão (`POST /cards/:id/delete`)
**Arquivos:** `src/cards/CardController.ts` (`remove`).
**Critério de aceite:**
- 404 se o cartão não existe; `cardRepository.delete(id)` e redireciona para `/`.
- Discussão em grupo: deveria haver alguma restrição para excluir um cartão em "Concluído" (paralelo à regra da Aula 02)? Se decidirem que sim, criem o erro correspondente e registrem em `shared/errorHandler.ts`.

### Atividade 5 — Aplicar limite de WIP na coluna "Em Andamento"
**Critério de aceite:**
- Um cartão não pode entrar numa coluna cujo `wipLimit` já foi atingido (`column.wipLimit !== null && cardRepository.findByColumn(columnId).length >= column.wipLimit`).
- Resposta 409 quando a regra é violada.
- A View (`boardView.ts`) já calcula `isOverWipLimit` e o template já destaca a coluna em vermelho quando isso acontece — vocês só precisam impedir que a violação aconteça no Controller.

### Atividade 6 — Impedir título duplicado na mesma coluna
**Arquivos:** `src/cards/CardController.ts` (`create`, `update`), novo erro `DuplicateCardTitleError`.
**Critério de aceite:**
- Usa `cardRepository.existsWithTitleInColumn(...)` (já implementado e testado) para checar antes de salvar.
- Resposta 409 quando duplicado. Mesmo título em colunas diferentes é permitido (igual à Aula 02).

### Atividade 7 — Criar novas colunas (`POST /columns`)
**Arquivos:** `src/boards/Board.ts` (`addColumn`), `src/boards/BoardController.ts` (`createColumn`).
**Critério de aceite:**
- `Board#addColumn` gera um id, define a próxima `order` e adiciona a coluna à lista interna.
- Nome de coluna inválido (`InvalidColumnNameError`, já existe) deve resultar em 400.
- Decisão do grupo: permitir nomes de coluna duplicados no mesmo quadro? Documentem a escolha.

---

## Suíte de Testes e Relatório de Cobertura

A cobertura de código cobre 100% de linhas, ramificações, funções e instruções:

```bash
# Executar a suíte de testes completa
npm test

# Executar a verificação com relatório de cobertura
npm run test:coverage
