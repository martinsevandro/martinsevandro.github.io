---
layout: post.njk
pageType: post
title: "Criando o portfólio e o primeiro post"
date: 2025-05-26
tags: [HTML, CSS, JS, Eleventy, Nunjucks, CI/CD]
---
 

## **Aoba, bão!?**

Como este é o primeiro post do portfólio, o seu assunto não poderia ser sobre outra coisa, senão ele mesmo.

Seguindo algumas referências para a criação da página, pensei em elementos básicos para compor o necessário de maneira direta e simples.
Usando de inspirações de outros projetos de portfólios, como escolha de cores, posições de elementos, montei o esquema no figma e, então, comecei a sua criação. No entanto, à medida que ia pesquisando, novas ideias surgiam e o projeto se modificava (acredito que para melhor).

### O propósito? 
Citar alguns detalhes de projetos que eu já tenho feito, não necessariamente em ordem cronologica por projeto, pois como não serão sobre todos os projetos, pode ser que sejam citados projetos antigos antes dos mais recentes, dependendo da tecnologia que tiver sido usada e eu invista um tempo para falar sobre o projeto. 
Mas basicamente, cada post falará sobre alguma tecnologia nova que implementei, que ainda não tenha sido citada em outro post, não precisa ser um artigo técnico completo, mas sim contendo o porquê, como usá-la e destacando alguns trechos. 
Gosto da ideia de **progressão de conhecimento**, e postar pequenos artigos é um bom método de medir essa linha com o passar do tempo. 

Atualmente (_na data deste post_), a ideia deste projeto é mostrar inicialmente os meus links de contato, os posts sobre tecnologias que já usei e investi um tempo para falar sobre, além de ter a página de currículo, que também será alimentada conforme atualizações importantes, e eu verificar a minha progressão ao passar dos anos. 


Beleza, agora falarei sobre a criação disso daqui.

### A escolha do Eleventy:
O principal motivo dessa escolha é a fácil manutenção do conteúdo. Como se trata de uma página estilo blog, onde terão postagens, a estrutura de conteúdo baseada em arquivos markdown, atrelado ao fácil deploy para o GitHub Pages, foram os motivos. Existem outras tecnologias que usam templates de outras linguagens para facilitar, como o Plainwhite-jekyl com Ruby, mas resolvi usar o Eleventy feito em Js, que permite uma rapida usabilidade para os textos com html e markdown, criando o template com Nunjucks (por isso os arquivos .njk), e ainda permitindo a praticidade da estilização personalizada com CSS.

Abaixo irei mostrar uns trechos sobre a configuração do Eleventy, que são utilizadas neste projeto. 

A configuração feita no arquivo .eleventy.js, define o comportamento da estrutura do projeto. É nele onde ficam os arquivos de entrada, saída e templates, além de configurar filtros e coleções. Com essa configuração, o processo de criação de novos posts fica simplificado: basta adicionar um arquivo .md com as informações no cabeçalho e o conteúdo, e ao executar o build do Eleventy, o projeto gera automaticamente a pasta do post e o respectivo index.html (configurei dessa forma para organizar melhor), pronto para ser publicado no GitHub Pages.

Mostro abaixo, que a estrutura é baseada nos arquivos que são criados no _includes, e o resultado é gerado no _site. Os arquivos .md e .html interpretam Nunjucks por padrão, mas nos posts.md desativei isso para evitar que trechos de código sejam processados e garantir que o conteúdo seja exibido literalmente, como os seguintes que exemplificarei a estrutura do layout.njk e post.njk, de modo que o código não seja executado.

~~~js 
// .eleventy.js
module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");

  eleventyConfig.addCollection("post", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md");
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site"
    },
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};
~~~

De maneira simples, o layout.njk possui a estrutura semelhante ao HTML, onde através da div "container" é possível exibir os conteúdos de cada página. Mesmo sem usar componentes de frameworks ou libs como React, a estrutura da página foi planejada para simular visualmente a separação de áreas, com o perfil fixo à esquerda e o conteúdo variando à direita. Porém, por ser um site estático gerado pelo Eleventy e hospedado no GitHub Pages, cada navegação carrega uma nova página completa, e não ocorre atualização parcial como em aplicações SPA. Escolhi essa estratégia pra manter o projeto simples e leve.

```njk
<!-- trecho de layout.njk -->
<main class="{% if pageType == "home" %}main-home{% elif pageType == "post" %}main-post{% elif pageType == "curriculum" %}main-curriculum{% else %}main-home{% endif %}">
    <div class="container">
        {% include "partials/perfil.njk" %}
        {% block content %}
            {{ content | safe }}
        {% endblock %}
    </div>
</main>
```

Agora com o layout definido (esquerda para perfil; direita para conteúdo), para atualizar o conteúdo dos posts é necessário apenas a criação dele próprio, sendo um arquivo markdown. A sua estrutura é simples, precisando apenas do cabeçalho contendo os requisitos e classificações do que irá tratar o próprio post.

Um exemplo é este próprio post citado abaixo (metalinguagem). 

~~~markdown
<!-- trecho de first-post.md -->
---
layout: post.njk
pageType: post
title: "Criando o portfólio e o primeiro post"
date: 2025-05-26
tags: [HTML, CSS, JS, Eleventy, CI]
---
 
## **Aoba, bão!?**

Como este é o primeiro post do portfolio, o seu assunto não poderia ser sobre outra coisa, senão ele mesmo.
[...]
~~~

Criado o post, a página principal também será atualizada, pois nela são exibidos os posts em ordem descrescente de publicação. Além de ser possível pesquisar por um post, a busca refere-se ao texto usado no título e tags de cada post, por isso é importante atenção na definição destes durante a criação do post. Este recurso é focado no futuro, quando tiver dezenas de posts e surja a necessidade de buscar um post sobre determinado assunto.
 
### Actions e Pages
Usando o GitHub Pages e o Eleventy no fluxo de CI/CD. Sempre que faço um push para a main, o GitHub Actions é acionado automaticamente, que gera os arquivos do site (build) e se tudo der certo ja atualiza direto no GitHub Pages.

~~~yml
<!-- deploy.yml -->
name: Build and Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install

      - name: Build site with Eleventy
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./_site
~~~

Colocarei ao final de cada post o [**repositório**](https://github.com/martinsevandro/martinsevandro.github.io) e/ou o link para o projeto, caso estejam disponíveis.