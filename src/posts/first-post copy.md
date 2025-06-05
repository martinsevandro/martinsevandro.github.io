---
layout: layout.njk
pageType: post
title: "First-post Name"
date: 2025-05-26
tags: [HTML, CSS, JS, VAIQUEBRAR_?2, VAIQUEBRAR_?, API]
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
        Neste momento, estou testando o limitado do width da section post. Qual o limite até a primeira quebra de linha do parágrafo.
        Neste momento, estou testando o limitado do width da section post. Qual o limite até a primeira quebra de linha do parágrafo
        Neste momento, estou testando o limitado do width da section post. Qual o limite até a primeira quebra de linha do parágrafo
        <pre><code class="language-javascript">fetch('/api/match')
            .then(res => res.json())
            .then(console.log);
        </code></pre>
        Neste momento, estou testando o limitado do width da section post. Qual o limite até a primeira quebra de linha do parágrafo?
    </div>

</section> 