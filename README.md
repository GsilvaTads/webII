# Projeto: Kanban MVC em TypeScript

Aplicação web de gerenciamento de tarefas no estilo **Kanban** desenvolvida em **TypeScript** com **Express**, estruturada sob o padrão  **MVC (Model-View-Controller)**, com desacoplamento via **Ports & Adapters (Inversão de Dependência)**, aderência ao padrão **Post/Redirect/Get (PRG)** e suíte de testes automatizados com **100% de cobertura**.

---

## Tecnologias Utilizadas

- **Linguagem:** TypeScript
- **Backend / Servidor:** Node.js com Express
- **Camada de Visão (View):** EJS com Tailwind CSS
- **Testes Automatizados:** Vitest com provedor de cobertura `@vitest/coverage-v8`
- **Testes de Integração HTTP:** Supertest

---

## Arquitetura e Decisões de Design

A aplicação foi organizada com separação rígida de responsabilidades:

- **Model (`src/boards`, `src/cards`):** Entidades de domínio ricas (`Board`, `Column`, `Card`) com encapsulamento estrito (protegendo dados internos e permitindo alterações apenas por métodos de negócio como `rename()`, `changePriority()` e `changeColumn()`). A persistência é gerenciada por repositórios (`BoardRepository`, `CardRepository`).
- **View (`src/views`):** Templates EJS que consom ViewModels preparados (`boardView.ts`, `cardView.ts`), evitando expor métodos internos de domínio diretamente à camada de apresentação.
- **Controller (`src/boards/BoardController.ts`, `src/cards/CardController.ts`):** Orquestram o fluxo de entrada HTTP, acionam as validações de domínio e retornam instruções de renderização ou redirecionamento via padrão PRG.
- **Desacoplamento via Ports & Adapters (DIP):** Para evitar acoplamento direto entre os módulos `cards` e `boards`, o `CardController` depende da interface/porta `ColumnChecker`, implementada pelo adaptador `BoardColumnChecker`.

---

## Atividades Implementadas
- **Atividade 1** — Criar cartão (`POST /cards`)
- **Atividade 2** — Mover cartão entre colunas (`POST /cards/:id/move`)
- **Atividade 3**— Editar cartão (`POST /cards/:id/update`)
- **Atividade 4** — Excluir cartão (`POST /cards/:id/delete`)
- **Atividade 5** — Aplicar limite de WIP na coluna "Em Andamento"
- **Atividade 6** — Impedir título duplicado na mesma coluna
- **Atividade 7** — Criar novas colunas (`POST /columns`)

---

## Suíte de Testes e Relatório de Cobertura

Relatório de Cobertura Almejado em 100% de linhas, ramificações e funções:


File                   | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-----------------------|---------|----------|---------|---------|-------------------
All files              |     100 |      100 |     100 |     100 |                   
 src                   |     100 |      100 |     100 |     100 |                   
  routes.ts            |     100 |      100 |     100 |     100 |                   
  seed.ts              |     100 |      100 |     100 |     100 |                   
  server.ts            |     100 |      100 |     100 |     100 |                   
 src/boards            |     100 |      100 |     100 |     100 |                   
  Board.ts             |     100 |      100 |     100 |     100 |                   
  BoardColumnChecker.ts|     100 |      100 |     100 |     100 |                   
  BoardController.ts   |     100 |      100 |     100 |     100 |                   
  BoardRepository.ts   |     100 |      100 |     100 |     100 |                   
  Column.ts            |     100 |      100 |     100 |     100 |                   
  boardView.ts         |     100 |      100 |     100 |     100 |                   
  errors.ts            |     100 |      100 |     100 |     100 |                   
 src/cards             |     100 |      100 |     100 |     100 |                   
  Card.ts              |     100 |      100 |     100 |     100 |                   
  CardController.ts    |     100 |      100 |     100 |     100 |                   
  CardRepository.ts    |     100 |      100 |     100 |     100 |                   
  cardView.ts          |     100 |      100 |     100 |     100 |                   
  errors.ts            |     100 |      100 |     100 |     100 |                   
 src/shared            |     100 |      100 |     100 |     100 |                   
  errorHandler.ts      |     100 |      100 |     100 |     100 |                   
  errors.ts            |     100 |      100 |     100 |     100 |                   
  http.ts              |     100 |      100 |     100 |     100 |   




## Como Instalar e Executar Localmente
Pré-requisitos:
    - Node.js versão 18 ou superior
    - Gerenciador de dependências npm

1 - Clonar o repositório:
    
    git clone https://github.com/GsilvaTads/webII.git

2 - Instalar os pacotes necessários:

    npm install

3 - Executar a suíte de testes completa:
   
    npm test

4 - Executar a verificação com relatório de cobertura

    npm run test:coverage

5 - Iniciar a aplicação em modo de desenvolvimento:
    
    npm run dev

6 - Acessar a interface gráfica no navegador web:

    http://localhost:3002



## Apresentação em Vídeo

Demonstração prática gravada em vídeo — cobrindo o percurso pelas atividades implementadas, navegação no código-fonte pelo VS Code e validação da suíte de testes.

Link dos vídeos/atividades:

    




