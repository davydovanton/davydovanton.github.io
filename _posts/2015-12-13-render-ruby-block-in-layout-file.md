---
layout: post
title: "Rendering ruby block code in layout file"
description: "In this post we'll create own implementation of capture method for rendering ruby block code in layout file"
tags:
  - ruby
  - layout
  - bicycle
---

Если вы создали методы которые возвращатю содержимое блока и вызываете их в erb (slim, haml, etc) у вас могут возникнуть проблемы.

If you want to render some result of ruby block in your layout file you may have some problems.

Например - репитинг контента или еще что хуже.

for example - your result may be repeated on page or you can get something worse.

On this post I'll show how you can solve this problem.

Пускай наши методы выглядят так:

Let our methods are as follows:

{% highlight ruby %}
def add_to_head(&block)
  @head_html ||= []
  @head_html << block if block_given?
end

def display_custom_head
  return unless @head_html
  @head_html.map(&:call).join
end
{% endhighlight %}

Вы можете использовать метод `captire` который включен в [rails](http://api.rubyonrails.org/classes/ActionView/Helpers/CaptureHelper.html#method-i-capture) и [sinatra-contrib](https://github.com/sinatra/sinatra-contrib#common-extensions) библиотеки.

Of cource you can use `captire` method from [rails](http://api.rubyonrails.org/classes/ActionView/Helpers/CaptureHelper.html#method-i-capture) and [sinatra-contrib](https://github.com/sinatra/sinatra-contrib#common-extensions) librares.

Но что делать, если у вас нет возможности использовать эти методы или они имеют слишком большой оверхед для конкретной задачи?

But what will you do if you can't use this methods or you'll need something easier?

Я сталкивался с подобной проблемой (например в одном из пр в сайдкик), которую я решил собственным методом `capture` для erb файлов

I faced a similar problem (in sidekiq for example) and for solve this problem I use own `capture` method for layout files.

{% highlight ruby %}
def capture(&block)
  block.call
  eval('', block.binding)
end
{% endhighlight %}

Надеюсь это будет вам полезно.

I hope it will be useful to you  as well as for me at one time.

Happy hacking!
