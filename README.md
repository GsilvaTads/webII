# Projeto: Kanban MVC em TypeScript

- Disciplina: WebII
- Professor: Vinicius
- Aluno: Gustavo Luis Silva
- Semestre: 2026/2

Aplicação web de gerenciamento de tarefas no estilo **Kanban** desenvolvida em **TypeScript** com **Express**, estruturada sob o padrão  **MVC (Model-View-Controller)**, com desacoplamento via **Ports & Adapters (Inversão de Dependência)**, aderência ao padrão **Post/Redirect/Get (PRG)** e suíte de testes automatizados com **100% de cobertura**.

---

## Discussão obrigatória (respostas antes de codar)

**1. Esse acoplamento é um problema real ou aceitável para o tamanho atual?**
Aceitável em um contexto simples, se introduzir operções extras e demais abstraçẽos neste contexto, aumentaria a complexidade sem ganho imediato mensurável, se a aplicação crescer pode sim se tornar um problema em funcionalidades onde será necessário mais trabalho e tempo para desacoplar os módulos.
 
**2. Se "cards" precisasse virar um serviço separado no futuro, o que quebraria primeiro?**
Quebraria primeiro as operações de criação e movimentação dos cartões, pois dependem de memória para validaões(cartões exixtente e limites de colunas). Em um serviços separados vai exigir mais da aplicação podendo ocasionar lentidão e falhas parciais.
 
**3. Uma alternativa seria o `Board` "possuir" a lista de ids de cartões**
     (em vez de `CardController` perguntar ao `BoardRepository`):
# O que resolveria?
Centraliza a vida do código e gerenciamento nas colunas(boards). O módulo cards não precisaria mais consultar o BoardRepository para validar colunas ou limites de WIP, eliminando a dependência de cards -> boards.
# O que criaria de novo: 
Complexidade de sincronização e transação. Qualquer operação de criar, mover ou deletar um cartão exigiria atualizar o array de IDs dentro da entidade Board, exigindo mecanismos de consistência concorrente (evitar que dois cartões sejam movidos ao mesmo tempo corrompendo a lista).

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

Relatório de Cobertura esperado em 100% de linhas, ramificações e funções.

---

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

4 - Executar a verificação com relatório de cobertura:

    npm run test:coverage

5 - Iniciar a aplicação em modo de desenvolvimento:

    npm run dev

6 - Acessar a interface gráfica no navegador web:

    http://localhost:3002

---

### Apresentação em Vídeo

Demonstração prática gravada em vídeo — cobrindo o percurso pelas atividades implementadas, navegação no código-fonte pelo VS Code e validação da suíte de testes.

Link dos vídeos/atividades:

- **Atividade 1,2:** [https://drive.google.com/file/d/1yy_-P2XGagAbGHBmtrJ5SqkPkLIfoSdM/view?usp=sharing](https://drive.google.com/file/d/1yy_-P2XGagAbGHBmtrJ5SqkPkLIfoSdM/view?usp=drive_link)
- **Atividade   3:** https://drive.google.com/file/d/1A40BjTqkBkOKR7D_5-EQs-Fwyy84kUDU/view?usp=drive_link
- **Atividade   4:** https://drive.google.com/file/d/1jl-lIGgIFq5RpjtsnGjevI6bTY5E2KnJ/view?usp=drive_link
- **Atividade   5:** https://drive.google.com/file/d/1Nd18KieG_7-zEBDiMwKR1cEB7zcy7YRK/view?usp=drive_link
- **Atividade   6:** https://drive.google.com/file/d/1SLdGZKxP82EtLKzz4zLMU5iiZ0tdEUWb/view?usp=drive_link
- **Atividade   7:** https://drive.google.com/file/d/1jqLo9YYozZJEsFcdqQF2C4yCQHeNj8w_/view?usp=drive_link
- **Interface    :** https://drive.google.com/file/d/1JU6FFbxyfZrFLELJSh0Bl38EpOtixM2Y/view?usp=drive_link


    




