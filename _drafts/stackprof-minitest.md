---
layout: post
title: "Profiling minitest examples with Stackprof"
description: "In this post we'll create own implementation of capture method for rendering ruby block result in layout file"
tags:
  - ruby
  - profiling
  - bicycle
---
После прочтения статьи о том как можно профилировать erpec examples, я задал себе простой вопрос: как такое же можно сделать в minitest? 
Today I readed nice blog post from Kir Shatrov about [Profiling RSpec examples with Stackprof][kir-post] I asked myself: can I repeat this trick for minitest?

вопрос достаточно важный для меня, так как я довольно часто использую minitest как для рабочих, так и для OSS проектов.
It's very inportant question for me becaus I ofen use minitest in my job projects and in my OSS projects.

К тому же, много крутых проектов используют минитесты (sidekiq, rails, lotus).
Also I know that many cool projects use minitest (sidekiq, rails, lotus, etc).

На самом деле в minitest все делается так же просто как и в rspec, с единственым отличием в том, что вам необходимо установить отдельный гем:
In minitest it is just as easy as in RSpec. And for this you need complite two steps.

First: you need to install [minitest-around][minitest-around] gem.

Для решения этой проблемы вам просто нужно добавить этот блок кода в такой то файл
Second: you need to add this block of code in your `test_helper` file:
``` ruby
# test/test_helper.rb
require 'stackprof'
require 'minitest/around/spec'

class Minitest::Test
  def around(&example)
    path = "/Users/anton/path/to/repo/tmp/stackprof-cpu-test-#{Time.now.to_i}-#{rand(1000)}.dump"
    ::StackProf.run(mode: :object, out: path.to_s) do
      example.call
    end
  end
end
```

Happy profiling!

[kir-post]: http://blog.iempire.ru/2015/10/13/profiling-specs
[minitest-around]: https://github.com/splattael/minitest-around
