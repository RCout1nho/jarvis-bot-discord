# jarvis-bot-discord
Jarvis é um projeto de bot para Discord, de forma totalmente open-source.

Jarvis encontra-se em fase de desenvolvimento, estando totalmente aberto a contribuição de outros devs que quiserem colaborar com o projeto.

E-mail de contato: jrsscoutinho1@gmail.com
## Tecnologias
Desenvolvido em nodeJS com Typescript e atualmente online na plataforma Heroku devido ao baixo custo (gratuito).

Para o desenvolimentos do bot é utilizada a lib do próprio Discord, o Discord.js.

## Features (v1.0)
* Reprodução de músicas do youtube
* Cargos por reação
* Cargos por comando direto
* Limpador de chat

## Manual
O prefixo para acionamento do bot é "**$**"

### Comandos
* **$clear_chat**: Limpar o chat atual (somente usuários com permissão no servidor)
* **$embed**: Retorna uma EmbedMessage do Discord com alguns dados simples (apenas para demonstração)
* **$p**: Adicionar música à fila ou tocar se a fila estiver vazia
* **$pause**: Pausa a música que está tocando
* **$stop**: Para música que está tocando e limpa a fila
* **$resume**: Continuar música pausada
* **$skip**: Pula para a próxima música da fila
* **$vol**: Ajusta volume da música (entre 0-10, aceitando decimais)
* **$help**: Mostra todos os comandos disponíveis

## Como usar no Discord
Bastar clicar nesse [link](https://discord.com/api/oauth2/authorize?client_id=767231960258314240&permissions=8&scope=bot)

## Como rodar em desenvolvimento
Basta fazer um clone ou fork do repositório, e usar os seguinte comandos:

`yarn` para instalar as dependências

`yarn start:dev` para rodar em desenvolvimento com o ts-dev

`yarn build` para gerar a build em javascript

`yarn start` para rodar em produção sob os arquivos gerados na build
