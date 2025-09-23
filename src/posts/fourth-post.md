---
layout: post.njk
pageType: post
title: "Frontend do Carta Alta!"
date: 2025-07-30
tags: [TypeScript, Angular, WebSocket] 
---

## High Card LoL

O projeto começou como buscador de dados da API da Riot, que combinava as estatísticas do jogador de uma partida e elementos visuais em uma carta, para eternizar aquele momento do jogador. Isso era o **LoL Card Match**. Evoluí isso para o **High Card LoL**, que além de ter essa opção, agora contém sistema de registro de contas de usuário, que quando logado, pode armazenar suas cartas no seu baralho e usá-las em duelos contra outros jogadores.

O modo de jogo é o carta alta, famoso jogo de baralho, onde ambos jogadores mostram 1 carta por rodada, e a carta de maior valor vence. Aqui, adaptei para ser utilizado o KDA, em um duelo de melhor de 3 rodadas. 

Foram adicionadas as funcionalidades de register e login, que habilitam a criação de deck (com até 10 cartas atualmente), e com o deck completo a função de duelo. Essas etapas ja foram citadas no post sobre backend. No frontend, o navbar dinâmico é quem sofreu essas mudanças de fato, pois aparecem opções extras como "Vincular Carta", "Desvincular Carta", quando o usuário está logado e em determinadas páginas. Além, é claro da página de Duelos, com a exibição das cartas e dos resultados.

Abaixo tem a imagem da página de Deck no desktop:

![Deck](/assets/imgs/Deck.png) 


### Angular
No projeto anterior, as cartas eram feitas via innerHTML e manipulação do DOM. Já neste, resolvi usar o Angular, para estudar essa tecnologia, juntamente do typescript.

Agora, utilizando da criação de páginas e componentes, que foram simples de entender sua estrutura e organização de arquivos, e dos services correspondentes, tanto dos novos componentes e páginas, quanto dos adaptados do projeto anterior, além de melhorar etapas de segurança e comunicação entre front, back e db.

~~~text
    src/app/
        ├── components/
                ├── card/
                ├── card-container/
                ├── footer/
                ├── health/
                └── navbar/
        ├── pages/
                ├── deck/
                ├── duel/
                ├── home/
                ├── login/
                └── register/
        ├── services/
                ├── auth/
                ├── card/
                ├── duel/
                ├── health/
                └── riot/
        ├── guards/
        ├── models/
        ├── app-rounting.module.ts
        ├── app.component.ts
        └── app.module.ts
~~~
 

### Deploys: Vercel e Render
No projeto do LoL Card Match, tinha sido deployado todo o projeto no Render, ou seja, ele é um repositório completo, contendo backend e frontend, e o Render permitia isso. Já neste aqui, como resolvi separar em dois repositórios, o Vercel foi usado apenas para o deploy do frontend, e o backend foi no Render. O banco de dados foi no MongoDB Atlas. Todos com planos gratuitos, pois o projeto é para aprendizado.

Como citado no post de backend sobre CORS, aqui foi necessário adaptar o modo production para os links corretos do backend + frontend, quando deployados, nos respectivos Render e Vercel, e também como localhost, quando estivesse no modo desenvolvimento.
 

### WebSocket
Definido no backend, os eventos de socket podem ser visualizadas pelo console de rede do navegador, onde na imagem abaixo, coloquei as etapas de um jogador que logou, entrou na fila de duelo, esperou por um outro usuário fazer o mesmo, jogou duas rodadas, ganhou o duelo e entrou novamente na fila para jogar novamente.

Durante o duelo, o WS exige autenticação, usando JWT, seguindo a regra citada no backend, a respeito dos refresh, disconnect, etc.

![WS_Respostas](/assets/imgs/RedeWebSocketRespostas.png) 


### Health
Aqui é a parte da ignição do projeto, por parte do frontend, pois no post do backend foi citado que o Render, nessa versão 0800, hiberna o servidor quando não é usado. Então, para melhorar a experiência de usuário, adicionei uma tela de loading quando o usuário acessa o site, onde é feito um pingpong entre a Vercel e o Render. Uma requisição é enviada para o Render, e a resposta que o servidor foi ligado é enviada de volta, quando isso acontece, o usuário pode acessar e usufruir normalmente. Abaixo tem um trecho de código dessa parte, agora na visão do Angular.
 

 ~~~js
    export class HealthService {
    public backendReadySubject = new BehaviorSubject<boolean>(false);
    public backendReady$ = this.backendReadySubject.asObservable();

    private healthCheckUrl = `${environment.apiUrl}/api/health`;
    private isPollingActive = false;
    private pollingSubscription: any;

    constructor(private http: HttpClient) {}

    startPolling(intervalMs: number = 3000): void {
        if (this.isPollingActive || this.backendReadySubject.value) return;

        this.isPollingActive = true; 

        this.pollingSubscription = interval(intervalMs)
        .pipe(
            switchMap(() => this.checkHealth())
        )
        .subscribe(isHealthy => {
            if (isHealthy && !this.backendReadySubject.value) { 
            this.backendReadySubject.next(true);
            this.stopPolling();
            }
        });
    }

    private checkHealth(): Observable<boolean> {
        return this.http.get<{ status: string }>(this.healthCheckUrl).pipe(
        map(res => res.status === 'ok'),
        catchError(error => {
            console.log('Backend não respondeu:', error.message);
    
            this.backendReadySubject.next(false);

            return of(false);
        })
        );
    }

    stopPolling(): void {
        this.isPollingActive = false;
        if (this.pollingSubscription) {
        this.pollingSubscription.unsubscribe();
        } 
    }
    }
 ~~~


## Conclusão
Bem amigos, nesta evolução do projeto vi alguns novos conceitos e realizei práticas:
    

* Separação do frontend (Vercel) e backend (Render) 
* Angular e TypeScript, substituindo manipulação manual por componentes e services 
* Configuração de CORS para ambientes de desenvolvimento e produção 
* WebSocket com autenticação JWT
* Tela de health check para suavizar o problema de hibernação do Render 0800


## On The Line
Está disponível na Vercel, aqui está o link: [**High Card LoL**](https://high-card-lol.vercel.app/).
E aqui o [**repositório**](https://github.com/martinsevandro/high-card-front) do projeto.


## Futuro
* Atualizações nas cartas
* Filas ranqueadas
* AWS

