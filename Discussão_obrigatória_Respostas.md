# Discussão obrigatória (antes de codar)

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
