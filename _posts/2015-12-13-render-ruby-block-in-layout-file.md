---
layout: post
title: "Rendering ruby block result in layout file"
description: "In this post we'll create own implementation of capture method for rendering ruby block result in layout file"
tags:
  - ruby
  - layout
  - bicycle
---

If you want to render some result of ruby block in your layout file, you may run into some problems.
For example, your result may be repeated on page or you can get something worse.

let's assume we have these methods:
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

Of cource you can use `captire` method from [rails](http://api.rubyonrails.org/classes/ActionView/Helpers/CaptureHelper.html#method-i-capture) and [sinatra-contrib](https://github.com/sinatra/sinatra-contrib#common-extensions) librares.
But what will you do if you can’t use these methods or you need something easier?

I faced a similar problem ([for example, in sidekiq](https://github.com/mperham/sidekiq/pull/2270)) and I used own `capture` method for layout files.

{% highlight ruby %}
def capture(&block)
  block.call
  eval('', block.binding)
end
{% endhighlight %}

And after that we can update our `display_custom_head` method:

{% highlight ruby %}
def display_custom_head
  return unless @head_html
  @head_html.map { |block| capture(&block) }.join
end
{% endhighlight %}

I hope it will be useful to you  as well as for me at one time.

Happy hacking!
