---
layout: layout.njk
pageType: post
title: "Third-post Name"
date: 2025-05-28
tags: [Python, JS, API] 
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
        
        Detalhando as principais etapas do projeto sobre Data Science.  

        Imagem do produto

        
        Trecho de Código Python.   
        
        <pre><code class="language-python">def hello():
            print("0")
            print("teste pyhon")
        </code></pre>
        Neste momento, estou testando o limitado do width da section post. Qual o limite até a primeira quebra de linha do parágrafo?
    </div>

</section> 