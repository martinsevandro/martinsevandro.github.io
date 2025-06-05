---
layout: layout.njk
pageType: post
title: "Second-post Name"
date: 2025-05-27
tags: [IndexedDB, JS, API] 
---

<section class="publication"> 
    <!-- cabeçalho do publication -->
    <div class="publication-title">
        <h1>{{ title }}</h1>    
    </div>
    <div class="publication-details">
        <div class="publication-date">          
            <small>{{ date | date("dd/MM/yyyy") }}</small>
        </div>
        <div class="publication-tags">
            {% for tag in tags %}
            <span class="tag">{{ tag }}</span>
            {% endfor %}
        </div>
    </div> 
    <!-- conteúdo do publication -->
    <div class="content-publication">
        Detalhando as principais melhorias do projeto LoL Card Match, onde é possível armazenar as cartas desejadas no IndexedDB (semelhante ao localStorage do Browser). 

        Imagem do produto

        Trecho de Código JS.

        <pre><code class="language-javascript">fetch('/api/match')
            .then(res => res.json())
            .then(console.log);
        </code></pre>
        Neste momento, estou testando o limitado do width da section post. Qual o limite até a primeira quebra de linha do parágrafo?
    </div>

</section> 