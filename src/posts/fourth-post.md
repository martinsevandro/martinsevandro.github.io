---
layout: post.njk
pageType: post
title: "Frontend do Carta Alta!"
date: 2025-07-30
tags: [TypeScript, Angular, WebSocket] 
---

## High Card LoL

O projeto começou como buscador de dados da API da Riot, que combinava as estatísticas do jogador de uma partida e elementos visuais em uma carta, para eternizar aquele momento do jogador. Isso é o **LoL Card Match**. Evoluí isso para o **High Card LoL**, que além de ter essa opção, agora contém um sistema simples de registro de contas de usuário, que quando logado, pode armazenar suas cartas no seu deck e usá-las em duelos contra outros jogadores.

O modo de jogo é o "carta alta", famoso jogo de baralho, onde ambos jogadores mostram 1 carta por rodada, e a carta de maior valor vence. Aqui, adaptei para ser utilizado o KDA, em um duelo de melhor de 3 rodadas. 

![Duelo](/assets/imgs/Duelo.png)

No frontend, o navbar é dinâmico devido ao data binding, que quando o usuário está logado, aparecem opções extras como "Vincular Carta", "Desvincular Carta", referentes a adicionar/remover a carta buscada no Deck. Usando Router para navegação entre páginas (/home, /deck, /duel, /login, /register), onde tem duas versões da página inicial: a pública (/), sem a opção de "Vincular Carta", e a autenticada (/home), com a opção. Ja as rotas do Deck e Duelo usam Guards para bloquear usuários não autenticados.

Abaixo tem a imagem da página de Deck numa resolução desktop:

![Deck](/assets/imgs/Deck.png) 


### Angular
No projeto anterior, as cartas eram feitas via innerHTML e manipulação do DOM. Já neste, resolvi usar o Angular, para estudá-lo, juntamente do Typescript.

#### Etapas
Escolhi o Angular 19, usando o modo tradicional (pq já havia assistido um conteúdo antigo que usava esse formato: [**Angular 13, Matheus Battisti**](https://www.youtube.com/watch?v=vJt_K1bFUeA&list=PLnDvRpP8Bnex2GQEN0768_AxZg_RaIGmw&index=1)). A estilização foi com Tailwind 3.4.1. 

~~~text
    npm install -g @angular/cli@19
    ng new high-card-front --directory . --routing --style=css --standalone false
~~~

No Angular, para criar os primeiros componentes da seguinte forma:
~~~text
    ng generate component components/navbar
    ng generate component components/card-container
    ng generate component components/card
~~~

Inicialmente, o foco era fazer funcionar tal qual o projeto base. Então, estruturei o Card model baseado no schema usado no backend. Adaptei o código antigo de montar cartas (_app.js_ e _cardContentBuilder.js_) para o Angular, separando em _card.component.ts_ e _card-html-builder.service.ts_. Não foi tão direto, pois eu usava sanitizedThirdLine como SafeHtml, mas tentar iterar sobre ela com *ngFor, que espera um array, tava dando probleminha.

Também teve outras instalações como o vanilla-tilt, para os efeitos na carta, e o html2canvas, para o botão de salvar, que também estão no projeto base.

No Deck tem um slide, tanto mobile/desktop, onde mostram até 3 cartas por vez (previous, current e next). O "Vincular Carta" na "/home" (referente a curtirCarta()) chama um service para criar a carta, mantendo sua estrutura e seu estado para ser salvo da mesma forma no Deck. 

Os services concentram a comunicação com o backend (ex: autenticação, card, duelo, Riot API), gerenciam estados reativos com BehaviorSubject e Observable (deck e duelo em tempo real) e isolam funcionalidades específicas (ex: montagem visual das cartas, health check). Assim, os componentes ficam focados na interface, enquanto os services na lógica do negócio.

Um exemplo é no duelo: quando o usuário seleciona uma carta, o DuelStateService usa um BehaviorSubject para atualizar o estado selectedCard$. Assim que isso acontece, qualquer componente que esteja inscrito nesse Observable reage automaticamente, exibindo a carta, mudando a fase do duelo e esperando a jogada do oponente, sem precisar recarregar a página ou manipular o DOM.

A estrutura de diretórios dessa parte do app ficou assim (quando finalmente concluída ;x). Além dos assets que foram reutilizados, dos enviroments, e de outros configs. (Para mais detalhes só caçar no [**repositório**](https://github.com/martinsevandro/high-card-front))

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
No projeto do LoL Card Match, tinha sido deployado todo o projeto no Render, ou seja, ele é um repositório completo, contendo backend e frontend, e o Render permitia isso. Já neste aqui, como resolvi separar em dois repositórios. A Vercel (que escolhi pra testá-la) foi usada apenas para o deploy do frontend, e o backend foi no Render. O banco de dados foi no MongoDB Atlas. Todos com planos gratuitos, pois o projeto é para aprendizado.

Como citado no post de backend sobre CORS, aqui foi necessário adaptar o modo production para os links corretos do backend + frontend, quando deployados, nos respectivos Render e Vercel, e também como localhost, quando estivesse no modo desenvolvimento.
 

### WebSocket
Definido no backend, os eventos de socket podem ser visualizadas pelo console de rede do navegador, onde na imagem abaixo, coloquei as etapas de um jogador que logou, entrou na fila de duelo, esperou por um outro usuário fazer o mesmo, jogou duas rodadas, ganhou o duelo e entrou novamente na fila para jogar novamente.

Durante o duelo, o WS exige autenticação, usando JWT, seguindo a regra explicada no post do backend, a respeito dos refresh, disconnect, etc. O WS foi usado pra permitir o duelo em tempo real, caso tivesse um chat na partida, também poderia ser realizado graças a ele. 

![WS_Respostas](/assets/imgs/RedeWebSocketRespostas.png) 


### Health
Aqui é a parte da ignição do site, por parte do frontend, pois no post do backend foi citado que o Render, nessa versão 0800, hiberna o servidor quando não é usado. Então, para melhorar a experiência de usuário, adicionei uma tela de loading quando o usuário acessa o site, onde é feito um pingpong entre a Vercel e o Render. Uma requisição é enviada para o Render, e a resposta que o servidor foi ligado é enviada de volta, quando isso acontece, o usuário pode acessar e usufruir normalmente. Abaixo tem um trecho de código dessa parte, agora na visão do Angular, já que a parte do backend está no post anterior.
 

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
    

* Separação do frontend (Vercel) e backend (Render), com suas integrações e versionamento com Github
* Uso do Angular e TypeScript, substituindo manipulação manual por componentes e services 
* Configuração de CORS para ambientes de desenvolvimento e produção
* WebSocket com autenticação JWT para comunicação em tempo real
* Tela de health check para contornar o problema de hibernação do Render 0800
* Uso de RxJS com BehaviorSubject e Observable para gerenciar estados reativos, principalmente no duelo, garantindo atualização automática dos componentes sem recarregar a página
* Uso de Guards e navegação protegida, restringindo algumas rotas a usuários autenticados e mantendo outras páginas públicas


## On The Line
Está disponível na Vercel, aqui está o link: [**High Card LoL**](https://high-card-lol.vercel.app/).
E aqui o [**repositório**](https://github.com/martinsevandro/high-card-front) do projeto.


## Futuro
* Atualizações nas cartas
* Filas ranqueadas
* AWS
