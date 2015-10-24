---
layout: post
title: "Convert string to color hash"
---

So it happens that sometimes you need to convert string to color hash. I think that
`Digest::MD5` class is easiest way for this. For this you need call hexdigest method
with necessary string.

{% highlight ruby %}
Digest::MD5.hexdigest('My string')[0..5] # => 'a537d0'
{% endhighlight %}

And if you will create rgb color you need convert hex to decimal with `to_i(16)` method.

{% highlight ruby %}
Digest::MD5.hexdigest(worker)[0..5]
  .scan(/../)
  .map{ |color| color.to_i(16) }
{% endhighlight %}
