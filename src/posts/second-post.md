---
layout: post.njk
pageType: post
title: "Usando a API da Riot Games"
date: 2025-05-27
tags: [Node.js, Express, Axios, API, Render] 
---

## **API da Riot Games, a.k.a. Rito Gomes**

### Por que?
Estudando sobre análise de dados, resolvi utilizar a API da Riot para fazer algumas brincadeiras. A princípio, eu gostaria de tratar sobre as informações disponíveis de campeonatos de Valorant, mas a Key básica que a Riot disponibiliza não é capaz de tratar sobre Valorant, apenas sobre algumas rotas de League of Legends. Também não é possível obter dados de campeonatos de LoL, apenas sobre dados das ranqueadas, então foi o jeito começar com isso.

Pelo que entendi, a Riot disponibiliza uma API Key para 3 casos, sendo eles: Teste Básico, que dura 24h, ou seja, é necessário reload diário; Projeto Pessoal, que dura "eternamente", mas tem limite diários/qtd_acessos; Produto, ou projetos prontos, que já passaram pela confirmação da Riot (este concede mais regalias, mas o processo de avaliação é demorado). (Mais detalhes sobre os [**tipos de chaves**](https://developer.riotgames.com/docs/portal))

Pois bem, comecei utilizando a key de testes para entender como funciona a API deles, quais tipos de informações estão disponíveis e o que posso fazer com eles. Foi então que tive a ideia de criar um projeto sobre cartas com estatísticas das partidas de determinado jogador. Algo único, como obter uma caixa de skin especial de determinado mapa, que tenha sido jogado num Major de Counter-Strike (não necessariamente nesse nível), mas gerar uma carta que represente uma partida memorável para determinado jogador, possível item colecionável (sticker 2.0?).

### Dados disponíveis
Os dados das partidas, a grosso modo, os essenciais, de forma até que simples de se obterem pela API. Alguns precisam de certas combinações para se obter o valor esperado, mas que também é fácil. 

Como tenho acesso apenas a dados de ranqueadas, comecei a fazer os testes com a minha própria conta, verificando status de modos de jogos diferentes (como aram, samuel drifts, arena), pois há rotas diferentes para cada ação, onde inicialmente é necessário informar um nickname e um tagname, e com isso, é possível obter o puuid dessa conta, com este puuid é que as demais informações são trabalhadas.

Alguns dos dados que achei interessante foram: KDA, Tempo de Partida, Data da Partida, Farm de Minions, %Participação de Abates, Dano Causado, Ouro Recebido. E, juntando os ids de campeão jogado, itens e runas obtidos na API, foi possível mostrar as imagens deles, criando um Card bem interessante, semelhante aos de Pokemon tcg (sem tantos detalhes também...), mas que devido a combinação dos elementos visuais, assinatura do nick e a cor da carta de acordo com eventuais conquistas, já ficou melhor do que eu esperava. 


### **Yu-Gi-LoL?**
Na Figura abaixo há alguns exemplos dos Cards gerados. Determinados status modificam a escolha tanto da skin, quanto a cor da borda, sendo elas dependentes dos dados do KDA, por exemplo, e dependendo da função do jogador, estatísticas diferentes são mostradas na carta (Como Suporte e Atirador). Coloquei um efeito de "flip" e "tilt" (inclinação quando passar o cursor sobre a carta).
 
![Cards_Examples](/assets/imgs/kuri_Sup.png) 
![Cards_Examples](/assets/imgs/route_Adc.png) 

Atrelado a combinação de fatores como KDA, se houve uma partida perfeita (com 0 mortes), se obteve todos os dragões e barões da partida, etc. existem os achievements, que são ícones especiais que aparecem apenas quando são conquistados. E a skin do campeão na carta também é influenciado pela estatística, ou seja, skins mais bonitas (geralmente as mais recentes lançada$) tem uma %chance de aparecer apenas quando o jogador obter bons resultados. 

### Tecnologias principais
1. Uso do Axios, para realizar requisições HTTP na API da Riot ([**documentação com APIs e seus endpoints**](https://developer.riotgames.com/apis)), lembrando do detalhe que nem todas estão disponíveis para a Chave de Testes.

2. Express com as rotas para os três casos (até o momento), sendo o primeiro para descobrir o puuid da conta, e as outras duas para buscar dados das partidas, seja uma antiga mais específica ou a mais recente, em alguns modos de mapa que a Riot permite.
   
3. CORS configurado no backend, mas no momento o projeto está unificado. Em movimentações futuras, no caso de separar front do back, ele já está apto para ser adaptado. 
   
Alguns trechos das rotas que foram usadas:

1. etapa de buscar o puuid do jogador através do name e tag dele
~~~js
router.get('/api/player/:name/:tag/:server', async (req, res) => {

    const { name, tag, server } = req.params; 
    const regionalRoute = getRegionalRoute(server);  

    const axiosConfig = {
        headers: { 'X-Riot-Token': process.env.RIOT_API_KEY },
        timeout: 5000,
        validateStatus: (status) => status < 500 
    };
    const response = await axios.get(
        `https://${regionalRoute}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${name}/${tag}`, 
        axiosConfig
        
    );
    res.json(response.data); 
});
~~~

2. etapa: caso não seja informado, o matchId usado será o da última partida do jogador. 
~~~js
router.get('/api/matches/lol/last/:puuid/:server/:matchId', async (req, res) => {

    const { puuid, server, matchId } = req.params;
    const regionalRoute = getRegionalRoute(server); 

    const axiosConfig = {
        headers: { 'X-Riot-Token': process.env.RIOT_API_KEY },
        timeout: 5000,
        validateStatus: (status) => status < 500  
    };
 
    const matchDetailsResponse = await axios.get(
        `https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
        axiosConfig
    );
    const matchData = matchDetailsResponse.data;
 
    const playerStats = matchData.info.participants.find(p => p.puuid === puuid);
    const duoStats = matchData.info.participants.find(p => p.puuid !== puuid && p.subteamPlacement === playerStats.subteamPlacement);

    const championJsonUrl = `http://ddragon.leagueoflegends.com/cdn/15.8.1/data/en_US/champion/${playerStats.championName}.json`;
    splashArtUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${playerStats.championName}_${selectedSkinNum}.jpg`;
    iconChampionUrl = `https://ddragon.leagueoflegends.com/cdn/15.8.1/img/champion/${duoStats.championName}.png`;

    const filteredData = createFilteredData(matchData, playerStats, splashArtUrl, iconChampionUrl);
    res.json(filteredData); 
});
~~~

(Coloquei alguns trechos para não ficar tão longo, tirei as partes das validações, erros, etc. Caso queira visualizar na íntegra, o projeto no github estará disponível.)

## Deploy
Utilizei a plataforma Render.com, que possui plano gratuito que serviu muito bem para este tipo de side project. Vinculando o repositorio do projeto no github, ao realizar push na branch main, basta ir nas config do Render.com e atualizar para a nova versão do projeto.

Agora com a Personal Key, que não tem mais o problema de duração, no próprio Render.com é possível adicioná-la e, caso seja necessário alterar, é bem prático, pois basta acessar em Environment a RIOT_API_KEY. 

Um ponto importante no plano gratuito é que o site fica classificado como "suspenso", ou seja, quando não há acessos por um tempo, o servidor é temporariamente desligado. Quando alguém acessa novamente, o Render ativa o servidor após alguns segundos. Totalmente compreensível para side projects, já que reduz custos.

## On The Line
O projeto está upado no seguinte link [**Lol Card Match**](https://lolcardmatch.onrender.com/)! É possível buscar contas em diversos servidores da Riot, como Américas, Europa e Coreia. Basta preencher os campos e fazer a busca. Caso queira uma skin diferente, basta efetuar uma nova busca. Também tem a opção de salvar carta.

O [**repositório**](https://github.com/martinsevandro/lolapi/) do projeto com todos os detalhes da versão atual. 

## Futuro
O meu roadmap com este projeto contém utilizar a base das rotas pra montagem das cartas e assim criar decks, onde será possível armazenar as cartas que o usuário quiser. Outra ideia é gamificar o sistema, permitindo que usuários disputem utilizando as cartas selecionadas em seus decks.


 