---
layout: post
title: "Мой любимый jekyll"
tags:
  - tips
  - jekyll
  - blog
---

Многие знаю о дивном генераторе статических сайтов как [Jekyll](). У него есть множесто плагинов и им невероятно просто пользоваться. Многие им пользуются и я не исключение, а так как я недавно поменял дизайн блога и добавил кучу фич, я хотел бы об этом рассказать

Для начала следует установить последнюю версию, как это сделать - посмотри на сайте. Теперь перейдем к тюнингу.
А если ты апдейтишься со старой версии, не забудь указать новый предпроцессор для markdown *!!Проверить в интернете!!*

  change in config file to
    markdown: kramdown
    highlighter: pygments

Так же, советую создать `Gemfile` для твоего блога, ты же хочешь легко управлять установленными гемами?

Для начала, нам потребуется сайтмап, ты же хочешь, что бы твой блог индексировался во всех поисковиках как надо?
Например я, для этого функционала, использовал замечательный гем, котрый очень легко поставить и настроить

  sitemap:
  https://github.com/kinnetica/jekyll-plugins
  only add rb file and that’s all :)

Любой уважаующий себя блог не может существовать без rss, для jekyll есть куча вариантов, но я остановился на этом
  rss:
  add https://github.com/agelber/jekyll-rss that’s all
*написать плюсы*



assets + scss:
https://github.com/ixti/jekyll-assets

emoji:
https://github.com/yihangho/emoji-for-jekyll
+ add css class for emoji images

add embed gist
twitter https://github.com/kzykbys/JekyllPlugins/blob/master/tweet.rb

read more:
http://melandri.net/2013/11/24/manage-posts-excerpt-in-jekyll/


написать про оптимизацию
добавить это
http://www.thecssninja.com/javascript/pointer-events-60fps

Add post tags
https://github.com/davydovanton/davydovanton.github.io/commit/4ac16c9936e73d3843fe611f0a7b5190fdcd07dc

Create jekyll plugin for create a html figure construction
https://github.com/davydovanton/davydovanton.github.io/commit/6e91d8b18ee3c63d9b65137e45d6f894d5d21990

Add twitter integration
https://github.com/davydovanton/davydovanton.github.io/commit/0dc4746ddea7231472a9f9c52ad930bf9609c6f1

Add "Read more" button functionality
https://github.com/davydovanton/davydovanton.github.io/commit/fbf92c9796c14d10793d9ba44cb27ba67dc16f02
