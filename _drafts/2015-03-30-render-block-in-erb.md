---
layout: post
title: "Рендеринг блока в erb"
---

Если вы создали методы которые возвращатю содержимое блока и вызываете их в erb (slim, haml, etc) у вас могут возникнуть проблемы. Например - репитинг контента или еще что хуже. 
Пускай наши методы выглядят так:

``` ruby
def add_to_head(&block)
  @head_html ||= []
  @head_html << block if block_given?
end

def display_custom_head
  return unless @head_html
  @head_html.map(&:call).join
end
```

Вы можете использовать метод `captire` который включен в [rails](http://api.rubyonrails.org/classes/ActionView/Helpers/CaptureHelper.html#method-i-capture) и [sinatra-contrib](https://github.com/sinatra/sinatra-contrib#common-extensions) библиотеки. Но что делать, если у вас нет возможности использовать эти методы или они имеют слишком большой оверхед для конкретной задачи?
Как раз такой случай возник у меня в pull request-е в sidekiq, где я написал простой вариант метода `capture` для erb файлов:

``` ruby
def capture(&block)
  block.call
  eval('', block.binding)
end
```

Надеюсь это будет вам полезно.
Happy hacking!
