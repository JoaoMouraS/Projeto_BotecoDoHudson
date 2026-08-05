# Requisitos do Site do Boteco do Hudson

Este documento apresenta os requisitos funcionais e não funcionais propostos para o desenvolvimento do site do Boteco do Hudson.

## 1. Requisitos Funcionais

### 1.1 Apresentação do estabelecimento
- RF01 - O sistema deve exibir uma página inicial com informações sobre o boteco, sua identidade visual e apresentação do ambiente.
- RF02 - O sistema deve possuir uma seção de história do boteco para mostrar sua trajetória e contexto cultural.
- RF03 - O sistema deve apresentar uma seção com a história dos funcionários, quando desejado, para humanizar a marca.

### 1.2 Cardápio e produtos
- RF04 - O sistema deve exibir os pratos típicos e itens disponíveis no estabelecimento.
- RF05 - O sistema deve permitir que o administrador atualize o cardápio com nome, descrição, preço e imagem dos itens.

### 1.3 Eventos
- RF06 - O sistema deve exibir os eventos futuros e informações relacionadas, como data, horário, tema e descrição.
- RF07 - O sistema deve permitir que o administrador cadastre, edite e exclua eventos.
- RF08 - O sistema deve permitir que o cliente visualize detalhes de cada evento ao clicar na página correspondente.

### 1.4 Reservas
- RF09 - O sistema deve permitir que o cliente faça uma reserva informando data, horário, quantidade de pessoas e observações.
- RF10 - O sistema deve permitir que o cliente escolha um tipo de reserva, como comum, aniversário ou comemoração especial.
- RF11 - O sistema deve validar a quantidade mínima de pessoas para a reserva ser efetivada, conforme regra definida pelo estabelecimento.
- RF12 - O sistema deve permitir a confirmação da reserva após o processo de pagamento ou validação da presença mínima.
- RF13 - O sistema deve permitir que o cliente cancele ou edite uma reserva, dentro do prazo definido pelo estabelecimento.
- RF14 - O sistema deve permitir que o administrador visualize, confirme, recuse ou cancele reservas.
- RF15 - O sistema deve permitir a organização de reservas por data, horário e quantidade de pessoas.

### 1.5 Galeria de fotos
- RF16 - O sistema deve exibir uma galeria com fotos do boteco e dos eventos realizados.
- RF17 - O sistema deve permitir que fotógrafos ou administradores enviem fotos para a galeria.
- RF18 - O sistema deve aplicar uma marca d’água nas fotos exibidas na galeria pública.
- RF19 - O sistema deve permitir que o cliente baixe a foto sem marca d’água mediante pagamento de uma taxa opcional.
- RF20 - O sistema deve permitir que o cliente busque suas fotos por meio de Face ID ou foto do rosto.
- RF21 - O sistema deve exibir ao usuário as fotos em que ele aparece, quando a busca for realizada com sucesso.

### 1.6 Atendimento e comunicação
- RF22 - O sistema deve oferecer um chatbot para atendimento ao cliente via WhatsApp.
- RF23 - O sistema deve permitir que o chatbot responda perguntas frequentes sobre o boteco, reservas, eventos e cardápio.
- RF24 - O sistema deve enviar notificações para clientes sobre eventos, confirmações, lembretes ou alterações.
- RF25 - O sistema deve permitir que o administrador acesse mensagens e interações do chatbot.

### 1.7 Autenticação e administração
- RF26 - O sistema deve possuir uma área administrativa com login seguro para o gestor do estabelecimento.
- RF27 - O sistema deve permitir que o administrador gerencie usuários, reservas, eventos, cardápio e galeria.
- RF28 - O sistema deve permitir o cadastro, edição e exclusão de conteúdos administrativos.
- RF29 - O sistema deve registrar ações administrativas para auditoria e controle interno.

### 1.8 Experiência do cliente
- RF30 - O sistema deve oferecer navegação intuitiva entre as principais páginas do site.
- RF31 - O sistema deve apresentar informações claras sobre contato, endereço e formas de chegar ao estabelecimento.
- RF32 - O sistema deve oferecer uma experiência responsiva para mobile, tablet e desktop.

## 2. Requisitos Não Funcionais

### 2.1 Desempenho
- RNF01 - O sistema deve carregar as páginas principais em até 3 segundos em uma conexão estável.
- RNF02 - O sistema deve responder às operações de reserva e cadastro sem atrasos perceptíveis para o usuário.

### 2.2 Segurança
- RNF03 - O sistema deve proteger dados de usuários e reservas com autenticação e criptografia.
- RNF04 - O sistema deve impedir acessos não autorizados à área administrativa.
- RNF05 - O sistema deve armazenar senhas de forma segura, utilizando mecanismos de hash adequados.

### 2.3 Usabilidade
- RNF06 - A interface deve ser intuitiva, com navegação simples e clara para qualquer público.
- RNF07 - O sistema deve utilizar linguagem visual e textos acessíveis, com boa legibilidade.
- RNF08 - O site deve ser responsivo e funcionar corretamente em diferentes tamanhos de tela.

### 2.4 Disponibilidade
- RNF09 - O sistema deve estar disponível durante a maior parte do tempo, com mecanismos de recuperação de falhas.
- RNF10 - O sistema deve possuir backup e recuperação de dados para evitar perdas significativas.

### 2.5 Manutenibilidade
- RNF11 - O sistema deve ser desenvolvido com estrutura organizada, facilitando futuras alterações e expansões.
- RNF12 - O código e a documentação devem seguir boas práticas de desenvolvimento.

### 2.6 Compatibilidade
- RNF13 - O sistema deve funcionar corretamente nos navegadores mais usados, como Chrome, Edge e Firefox.
- RNF14 - O sistema deve oferecer compatibilidade com dispositivos móveis e desktops.

### 2.7 Confiabilidade
- RNF15 - O sistema deve tratar erros de forma amigável, sem interromper completamente o uso do site.
- RNF16 - O sistema deve validar entradas do usuário para evitar dados inconsistentes.

## 3. Observação

Esses requisitos servem como base inicial para o desenvolvimento do site e podem ser ajustados conforme a evolução do projeto, necessidades do estabelecimento e feedback dos usuários.
