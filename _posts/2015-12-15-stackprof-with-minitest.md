---
layout: post
title: "Profiling minitest examples with Stackprof"
description: "In this post we'll profile code from minitest examples with Stackprof profiling gem"
tags:
  - ruby
  - profiling
  - minitest
---

Today I read a nice blog post by Kir Shatrov about [Profiling RSpec examples with Stackprof][kir-post]
and I wondered if I could repeat this trick with minitest? This question is very important for me
because I ofen use minitest for my job and OSS projects. Also a lot of cool projects use minitest
(for example, sidekiq, rails, lotus, etc).

In reality, to do that in minitest as easy as in RSpec, and the only difference is that you need
to install a separate gem.

1. Firstly you have to install [minitest-around][minitest-around] gem;
2. And secondly you have to add this block of code to your `test_helper` file;
{% highlight ruby %}
# test/test_helper.rb
require 'stackprof'
require 'minitest/around/spec'

class Minitest::Test
  def around(&example)
    path = "path/to/repo/tmp/stackprof.dump"
    StackProf.run(mode: :object, out: path.to_s) do
      example.call
    end
  end
end
{% endhighlight %}

Happy profiling!

[kir-post]: http://blog.iempire.ru/2015/10/13/profiling-specs
[minitest-around]: https://github.com/splattael/minitest-around
