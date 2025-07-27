---
layout: post.njk
pageType: post
title: "Backend do Carta Alta!"
date: 2025-07-12
tags: [TypeScript, NestJS, MongoDB, API] 
---

## **High Card LoL - diretamente de kakegurui**

### O futuro chegou
Continuando o projeto anterior, que usa a API da Riot, agora dividindo o backend do frontend, mas também usando outras tecnologias. 

Esta parte é a do backend, que utilizando NestJS e MongoDB, também permitem a busca pela carta, mas agora será possível cadastrar um usuário (no mongodb), montar seu deck de cartas e duelar contra outro usuário!

### It's time to Duel!
Yu-Gi-Oh! 2? Não. O Carta Alta é um tradicional jogo de cartas, onde cada usuário mostra uma carta por rodada e aquele que tiver maior valor vence a rodada. Este projeto segue essa ideia, mas ao invés do valor numérico e do naipe do baralho, utiliza o KDA (pelo menos por enquanto). É uma md3, mas que pode causar empate (é raro, mas é possível que os jogadores escolham KDAs iguais, nunca se sabe o deck do oponente)

### Requisitos e Problemáticas
1. Cada jogador precisa se cadastrar, logar e montar seu deck com 10 cartas (é o limite superior). 
2. É permitido buscar pelas melhores cartas, inclusive de outros jogadores, e armazenar as escolhidas.
3. Logado e com o deck pronto, é possível entrar na fila de duelos. Onde, após encontrar um oponente, o duelo é iniciado.
4. Cada jogador recebe 3 das 10 cartas do seu deck (por meio de uma função aleatória), e a cada rodada deve escolher uma, após ambos jogadores definirem a sua carta, o vencedor da rodada é definido (maior kda vence! se kda1 === kda2: empate), e as cartas utilizadas na rodada são descartadas.

Problemas que aconteceram (pensei nessas possibilidades durante o desenho do esquema do projeto):
1. Um jogador, que perdeu a primeira rodada, força desconnect (atualizando a página pra alterar socketId) afim de cancelar o duelo. 
2. Ou o jogador que estava vencendo o duelo toma desconnect por n motivos.
Solução criada:
Caso o jogador que desconectou estivesse vencendo, o jogador remanescente recebe o resultado do duelo como empate!
Caso o jogador que desconectou estivesse perdendo, o jogador remanescente recebe o resultado do duelo como vitória!


### Etapas
1. Iniciando sobre o banco utilizado: 
   1. MongoDB Atlas (no plano 0800): criado o cluster high-card-cluster e pego a connection string MONGODB_URI, para utilizar no .env do projeto.
   2. Criado o banco high-card-db.
   3. Criada a collection 'cards' (não nessa sequência exata), mas na criação da _cards.module.ts_ e _card.schema.ts_, com Mongoose.

2. Criados os testes iniciais no _app.controller.ts_, pra verificar se há comunicação do backend com db, e a criação de uma collection com método POST, pra checar se há alteração no Atlas. (deu tudo certo)

3. Users - Criando o módulo de usuários, com:
    ~~~text
    src/users/
        ├── interfaces/
                └── user.interface.ts
        ├── schemas/
                └── user.schema.ts 
        ├── users.module.ts
        └── users.service.ts
    ~~~
    
    No _auth.service.ts_ será verificado a possível duplicidade no registro de username, com a função findByUsername do _users.service.ts_, que busca se já existe um, e caso ocorra será impedido.

4. Auth - Etapa de autenticação com o seguinte módulo: 
    ~~~text
    src/auth/
        ├── dto/
                ├── login.dto.ts
                └── register.dto.ts
        ├── strategies/
                └── jwt.strategy.ts
        ├── types/
                └── reques-with-user.ts
        ├── auth.controller.ts
        └── auth.module.ts
                ├── auth.service.ts
                └── jwt-auth-guard.ts
    ~~~

    Usando bcrypt, pra adicionar o hash na criptografia. Validação com JWT (que será WebSocket + REST, útil também na parte dos Duelos).

    Para testar o register e login, utilizei o Postman enquanto confirmava no mongoDB Atlas. 

5. Cards - Criando o módulo para as cartas:
    ~~~text
    src/cards/
        ├── dto/
                └──create-card.dto.ts
        ├── schemas/
                └──card.schema.ts
        ├── utils/
                └──card.utils.ts
        ├── cards.controller.ts
        ├── cards.module.ts
        └── cards.service.ts
    ~~~
    
    Onde o _card.schema.ts_ contém as variáveis que compoem a carta, como championName, riotIdGameName, riotIdTagline, kda, etc. E na _card.utils.ts_ ficam as funções utilitarias para fazer funcionar as que dependem. É a adaptação dos arquivos _dataFilter.js_ e _helpers.js_, do projeto anterior.
    
    Lembrando que o Deck é composto por até 10 cards (justamente as 10 necessárias para habilitar o pareamento de duelo)
 
6. Riot - Criando o módulo para as rotas da api riot:
    ~~~text  
    src/riot/
        ├── utils/
                └── riot.utils.ts
        ├── riot.controller.ts
        ├── riot.service.ts
        └── riot.module.ts
    ~~~
    
        onde estão as adaptações do _routes.js_ para o _riot.controller_ e _riot.service_, do novo projeto, o que torna até mais organizado esse processo.

    No _riot.controller.ts_ ficam apenas as rotas:
    ~~~js
        @Controller('api')
        export class RiotController {
           constructor(private readonly riotService: RiotService) {}

           @Get('player/:name/:tag/:server')
           getPUUID(
              @Param('name') name: string,
              @Param('tag') tag: string,
              @Param('server') server: string,
              ) {
                 return this.riotService.getAccountByRiotId(name, tag, server);
              }

           @Get('matches/lol/latest/:puuid/:server')
           async getLatestMatchDetails(
           @Param('puuid') puuid: string,
           @Param('server') server: string,
           ) {
              const matchIdResponse = await this.riotService.getLastMatchId(
                 puuid,
                 server,
              );
              const lastMatchId = matchIdResponse;

              console.log(`Último ID de partida: ${lastMatchId}`);

              if (!lastMatchId) {
                 throw new NotFoundException('Nenhuma partida encontrada..');
              }

              const matchDetails = await this.riotService.getMatchDetails(
                 puuid,
                 server,
                 lastMatchId,
              );
              return matchDetails;
           }

           @Get('matches/lol/specific/:puuid/:server/:matchId')
           getSpecificMatchDetails(
              @Param('puuid') puuid: string,
              @Param('server') server: string,
              @Param('matchId') matchId: string,
           ) {
              return this.riotService.getMatchDetails(puuid, server, matchId);
           }
        }
    ~~~

    As demais lógicas internas das rotas, até a geração do url que vai buscar na api da riot, é feito no _riot.services.ts_. (Abaixo um trecho disso, mas com adaptações pra não ficar tão extenso)

    ~~~js
        @Injectable()
        export class RiotService {
           private readonly apiKey = process.env.RIOT_API_KEY;

           constructor(private readonly httpService: HttpService) {}

           async getAccountByRiotId(name: string, tag: string, server: string) {
              const regionalRoute = getRegionalRoute(server);
              if (!isValidRiotId(name, tag, server)) {
                 throw new HttpException('Parâmetros inválidos', HttpStatus.BAD_REQUEST);
              }

              if (!regionalRoute) {
                 throw new HttpException('Servidor inválido', HttpStatus.BAD_REQUEST);
              }

              try {
                 const response = await firstValueFrom(
                    this.httpService.get(
                       `https://${regionalRoute}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${name}/${tag}`,
                       {
                          headers: { 'X-Riot-Token': this.apiKey },
                          validateStatus: () => true,
                          timeout: 5000,
                       },
                    ),
                 );

                 return response.data;
              } catch (err) {
                 throw new HttpException(err.response?.data?.status?.message || err.message, err.response?.status || 500);
              }
           }
        }
    ~~~

    Também transferi a lógica de gerar os achievments (que estava no _app.js_ ‘-’), para o _riot.utils_, com a buildAchievements(), dessa forma ficando totalmente no backend, pois passa a ser incorporado no createFilteredData() também, junto das demais informaçções que compõem o card.

    Terminando de configurar as adaptações do express.js pro nestjs, foi adicionado ao _main.ts_, o CORS, dependendo da variável de ambiente, que será usado pelo Angular no frontend. Então, quando for testar, serão executados simultaneamente o backend e o frontend, e depois modificado para o deploy.

    Dessa forma, as rotas criadas até então no backend são divididas nas que possuem ou não acesso.
    ~~~js
    //sem autenticação é possível fazer as buscas na api da riot, tal qual no projeto em express:
       + @Controller('api')
           1. @Get('player/:name/:tag/:server') //busca o PUUID por nome/tag/server
           2. @Get('matches/lol/latest/:puuid/:server') //busca detalhes da última matchId
           3. @Get('matches/lol/specific/:puuid/:server/:matchId') //detalhes da partida especifica
    //para autenticação, o usuário terá:
       + @Controller('auth')
           1.  @Post('register')
           2.  @Post('login')
    //usuário autenticado poderá:
       + @Controller('cards')
           1. @Get('my-deck')  //lista as cartas salvas pelo usuário
           2. @Post('save')  //salva uma carta no deck (limitado a 10)
           3. @Delete(':id') //remove uma carta do deck
    ~~~

7. Duels - Para criação do duelo com WebSockets com @nestjs/websockets e socket.io
    ~~~text
    src/duels/
        ├── types/
                └── duel.types.ts      tipos auxiliares (ex: estado do jogador, carta, partida)
        ├── duels.module.ts
        ├── duels.gateway.ts       websocket gateway
        └── duels.service.ts       lógica de pareamento, controle de partidas
    ~~~

    Usando o evento padrão do socket para verificar se a conexão foi estabelecida num _teste1.html_. Testando o duelo com _teste1.html_ vs _teste2.html_, com os usuários e seus decks já criados no postman.
    Criando os eventos de socket tanto front e back, usando a seguinte ideia:
      - socket.emit(...) no frontend → envia dados para o servidor
      - this.server.to(...).emit(...) no backend → envia dados para o cliente
      - socket.on(...) no frontend → escuta eventos vindos do servidor
      - @SubscribeMessage(...) no backend → escuta eventos vindos do cliente
  
   ### dificuldades encontradas
      * usuário access-token é notificado que saiu da fila mesmo sem estar na fila.
      * usuário access-token entra na fila mais de uma vez, o que gera um duelo entre ele, o resultado sendo sempre null, pois as cartas escolhidas valem para os dois, gerando empate no final.
      * se o usuário está num duelo e atualiza a página, o duelo não poderá ser terminado, pois um único jogador não conseguirá terminar o duelo e caso tente entrar novamente na fila não conseguirá, pois o seu playerId está vinculado ainda a sala que não encerrou.
      * conflitos de notificações no status, devido alguns emits em contextos inesperados, como alterar o status de entrar/sair da fila, sendo que o usuário já está numduelo.
   ### solucionando
      * após validar o token com jwt, no momento da conexão, é vinculado um socket válido para o userId, que juntos são utilizados na room (partida criada para os 2 jogadores válidos que estavam na fila). 
      * assim, um bom e velho if verifica se há duplicatas, conflitos e disconects na sala. Em caso de disconect, o usuário remanecente é notificado. Essa desconexão (proposital ou não) é tratada no handleDisconnect, e o resultado é mostrado para ele (vitória/empate, dependendo do score atual da sala).
      * no caso do status, um simples checkin com inMatch e inQueue (no front mesmo), para alterar apenas no contexto correto.

      A logística do pareamento: 

    ~~~js
        export class DuelsService {
           private queue: Player[] = [];
           private rooms: Map<string, DuelRoom> = new Map();
        
           async addToQueue(player: Player): Promise<DuelRoom | null> {
              this.queue.push(player);
              if (this.queue.length >= 2) {
                 const [p1, p2] = this.queue.splice(0, 2);
                 const room: DuelRoom = {
                    roomId: `room-${Date.now()}`,
                    players: [p1, p2],
                    createdAt: Date.now(),
                    scores: {
                      [p1.userId]: 0,
                      [p2.userId]: 0,
                    },
                    round: 1,
                    roundPlays: [],
                 };
                 this.rooms.set(room.roomId, room);
   
                 console.log(`Duel room created: ${room.roomId} with players ${p1.username} and ${p2.username}`);
                 return room;
              }

              return null;
           }
        }
    ~~~
    

## On The Line
O projeto ainda não está upado no Render, somente após a conclusão do frontend. Mas este é o [**repositório**](https://github.com/martinsevandro/high-card-back) do projeto com todos os detalhes da versão atual. 

## O presente e o Futuro
O Futuro do projeto anterior é o Presente neste:
  * [x] utilizando as rotas para montagem das cartas
  * [x] criação de deck das cartas buscadas
  * [x] duelo entre usuários utilizando seus decks

Armazenamento temporário na memória: no caso da fila de pareamento, salas ativas (com suas cartas sorteadas, pontuação, etc.), socketId para o userId, tudo evapora após o reinício do server, mas por enquanto é o q ta tendo, no futuro aplico Redis ou algo similar. No entanto, a persistencia dos dados de usuários e seus decks estão garantidos no mongodb atlas (limitado, mas tá). 

O próximo passo é criar o frontend com Angular, revendo o CORS, e usando como base o projeto unificado anterior, com interface das cartas e agora adicionando o cadastro, login, deck e duelo!