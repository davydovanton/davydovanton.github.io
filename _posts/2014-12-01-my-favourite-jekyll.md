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


Update to 2.2:
  gem install jekyll

change in config file to
  markdown: kramdown
  highlighter: pygments

sitemap:
https://github.com/kinnetica/jekyll-plugins
only add rb file and that’s all :)

rss:
add https://github.com/agelber/jekyll-rss that’s all

emoji:
https://github.com/yihangho/emoji-for-jekyll
+ add css class for emoji images

add embed gist
twitter https://github.com/kzykbys/JekyllPlugins/blob/master/tweet.rb

assets + scss:
https://github.com/ixti/jekyll-assets

read more:
http://melandri.net/2013/11/24/manage-posts-excerpt-in-jekyll/


futures:
  * update to 2.0 version [DONE]
  * scss [DONE]
  * slim не нужно, с ликвидом плохо
  * embed (twitter, github, video and sound cloud) [DONE]
  * sitemap [DONE]
  * analyse activity in dashboard (graphs) ???
  * tags сделал
  * redirect from fikys.github.io
  * change share buttons
  * новые комментарии
  * плагин для картинок
  * 'Read more' button [DONE]
  * foundation.zurb.com
