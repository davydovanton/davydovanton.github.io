---
layout: post
title: "Write simple scheme interpreter on ruby"
description: "В этой серии постов мы напишем простой интерпретатор схемы с простыми командами и реплом"
---

**TL;DR:** [github repo](https://github.com/davydovanton/rlisp)

В жизни каждого разработчика наступает момент, когда он хочет написать свой собственный язык программирования.
Each developer have moment when he want to write own programming language.

Поэтому в данной статье мы рассмотрим на примере простейшего лисп компилятора как это сделать.
Therefore in this post I'll show you how it's done in a simple scheme interpreter.

## Why scheme and lisp?

Во первых, язык очень простой как для реализации, так и для понимания.
In first, list really simple language for realization and for understanding.

Лисп - семейство языков основной идеей которых являются S-выражения.
Lisp(_LISt Processor_) is a language family which based on idea of S-expressions.

S-выражение - это такая штука, которая нужна для представления данных и которая может состоять из атомов (числа, строки, булевы выражения), либо из точечных пар, которые имеют вид `(x . y)`.
S-expressions are a notation for nested list data which can contain atoms (integers, symbols or boolean values) or expression of the form `(x . y)` where `x` and `y` are s-expressions.

Основная идея точечных пар в том, что они могут формировать как списки (`(1 . ( 2 . 3))` что эквивалентно `(1 2 3)`), так
и деревья (`((1 . (2 . 3)) . (4 . 5))`).
This expression may be formed as lists (`(1 . ( 2 . 3))` this equals `(1 2 3)`) and trees (`((1 . (2 . 3)) . (4 . 5))`).

Во вторых, при самостоятельной реализации интерпретатора, можно лучше понять язык (автор доконца понял идею envariement), так и понять основную идею компиляторов.
And in second, after creating interpreter you could better to understood language (author fully understood the envariement idea). Also you could  understand base idea of compillers and interpreters.

Поэтому мы начнем наше путешествие в мир компиляторов и интерпретаторов с написания простейшего интерпретатора схемы.
Therefore we start our way into the world of compilers and interpreters to write a simple scheme interpreter.

## Base idea

Наш язык будет состоять из двух частей, парсера, который превратит нашу строку текста (программа) в AST структуру.
Our language will contain two parts: parser, which translate string to AST and `eval` function.
Следующая часть нашего языка - eval функция, которая будет принимать наш AST и envariement переменную и возвращать результат выполнения кода.
This fundtion will take AST with envariement and will return result of the code.

Schematically, it looks like this:
{% highlight text %}
code(string) => parse function => AST => eval function => result
{% endhighlight %}

## First step. Parser.
Для начала, давайте определимся, чего мы хотим получить.
To begin, let's define what we want to get.

У нас есть строка, например `(+ 1 1 1)`.
For example, we have a string `'(+ 1 1 1)'`.

Что наш парсер должен вернуть? Какую структуру данных? Думаю, что массив будет тем, что нужно.
What our parser should return? What kind of data structure? I think, that array will be right.

Давайте напишем наш первый "тест":
Let write simple test code:

{% highlight ruby %}
program = '(+ 1 1 1)'
lisp = Lisp.new
lisp.parse(program) == [:+, 1, 1, 1]
{% endhighlight %}

Как видите, все достаточно просто, поэтому я сразу напишу код, который выполнит наш тест:
As you can see, this is simle code therefore I just display `parse` method code:
{% highlight ruby %}
class Lisp
  def parse(program)
    tokenize(program)
  end

  def tokenize(chars)
    chars
      .gsub(/\s\s+/, ' ')
      .gsub('(', ' ( ')
      .gsub(')', ' ) ')
      .split(' ')
      .map{ |token| atom(token) }
      .compact
  end

  def atom(token)
    if token[/\.\d+/]
      token.to_f
    elsif token == '(' || token == ')'
      nil
    elsif token[/\d+/]
      token.to_i
    else
      token.to_sym
    end
  end
end
{% endhighlight %}

Как вы знаете, в лиспе мы можем написать наш код используя "вложенные" операторы, то есть вот так: `(+ (* 2 2) (- 5 3))`.
As you know, in lisp you can write your codewith nested operators, for example - `(+ (* 2 2) (- 5 3))`.

В результате выполнения этого кода мы получим число 6.
This code returns 6.

Если мы используем наш парсер для этого кода, мы получим не совсем то, что нам нужно, поэтому давайте обновим наш тест:
If we use our parser for this code, we get is not quite what we need, so let's update our check:
{% highlight ruby %}
program = '(+ (* (1 2) 3) 4)'
lisp = Lisp.new
lisp.parse(program) == [:+, [:*, [1, 2], 3], 4]
{% endhighlight %}

Как вы могли догадаться - самый очевидный способ исправить наш тест - обойти все элементы массива и если мы встречаем `'('`, то мы просто помещаем все элементы до `')'` в отдельный массив + делаем это рекурсивно.
As you might guess, the most obvious way to fix our check - call `parse` method in recursion and all array elements from `'('` to `')'` we remove to nested array.

В итоге наш код принимает следующий вид:
Code will be look loke this:

{% highlight ruby %}
class Lisp
  def parse(program)
    read_from_tokens(tokenize(program))
  end

  def tokenize(chars)
    chars
      .gsub(/\s\s+/, ' ')
      .gsub('(', ' ( ')
      .gsub(')', ' ) ')
      .split(' ')
  end

  def read_from_tokens(tokens)
    return if tokens.empty?

    token = tokens.shift

    if '(' == token
      list = []

      while tokens.first != ')'
        list << read_from_tokens(tokens)
      end
      tokens.shift

      list
    elsif ')' == token
      raise 'unexpected )'
    else
      atom(token)
    end
  end

  def atom(token)
    if token[/\.\d+/]
      token.to_f
    elsif token[/\d+/]
      token.to_i
    else
      token.to_sym
    end
  end
end
{% endhighlight %}

Ура, мы написали наш парсер!
We did it! Let's start make `eval` method.

## Eval method
Как я говорил ранее, наша программа состоит из 2ух частей, парсера и `eval` функции, которая будет выполнять наш код.
As I said earlier, our interpreter contain two parts: parser and `eval` function.

The `eval` function will take two arguments: an expression, `exp`, that we want to evaluate, and an environment, `env`, in which to evaluate it. An environment is a mapping from variable names to their values.
By default, eval will use a instance value that includes the names for a bunch of standard things.

Let start to implevent base `@env` variable with `car`, `cdr` и `cons` functions:
{% highlight ruby %}
env = {
  :car  => lambda { |*list| list[0] },
  :cdr  => lambda { |*list| list.drop 1 },
  :cons => lambda { |(e, cell), _| [e] + cell },
}
{% endhighlight %}

Следующее что нам нужно - написать функцию `eval`, которая будет искать совпадение по первому элементу входящего массива:
Next step - make `eval` function which will look for a match on the first element of the input array
{% highlight ruby %}
class Lisp
  def initialize(ext = {})
    @env = {
      :car   => lambda { |*list| list[0] },
      :cdr   => lambda { |*list| list.drop 1 },
      :cons  => lambda { |(e, cell), _| [e] + cell },
    }.merge(ext)
  end

  def eval(exp, env = @env)
    env[exp.first].(exp[1..-1])
  end

  # ...
end
{% endhighlight %}

Все достаточно просто, но возникает пробелма, что делать, когда первый элемент не символ (число например) и что делать, когда у нас вложенный код?
Now we have a problem: what will we do when the first element of array will be not symbol (integer for example) and what will we do when we have nested functiions?

Давайте обновим нашу функцию, добавив в нее проверку на тип:
Of cource we can add check to element type:
{% highlight ruby %}
class Lisp
  def initialize(ext = {})
    @env = {
      :car   => lambda { |*list| list[0] },
      :cdr   => lambda { |*list| list.drop 1 },
      :cons  => lambda { |(e, cell), _| [e] + cell },
    }.merge(ext)
  end

  def eval(exp, env = @env)
    if exp.is_a? Numeric
      exp
    elsif exp.is_a? Symbol
      env[exp]
    else
      code = eval(exp[0], env)
      args = exp[1..-1].map{ |arg| eval(arg, env) }
      code.(*args)
    end
  end

  # ...
end
{% endhighlight %}

Какие-то (например арифмитические) мы можем легко добавить в `env` переменную, а какие-то нет.
Some (eg arithmetic), we can easily add to `env` variable, and some do not.

Поэтому нам придется расширить проверку в `eval` функции, добавив в нее проверку на имя функции (первого элемента массива)
Therefore we need to extend checking in `eval` function. We will add check on function name.

Например, `quote` и `if` функции будут реализованны так:
For example, code bellow will realize `quote` and `if` functions:

{% highlight ruby %}
def eval(exp, env)
  # ...
  elsif exp[0] == :quote
    exp[1..-1]
  elsif exp[0] == :if
    _, test, conseq, alt = exp
    exp = eval(test, env) ? conseq : alt
    eval(exp, env)
  # ...
end
{% endhighlight %}

Немного сложнее для понимания будут функции `define` и `lambda`.
Next step - initialize `define` and `lambda` functions.

Синтаксис `define` функции выглядит следующим образом:
In scheme `define` function syntax is as follows:
{% highlight scheme %}
(define name
  (expression))
{% endhighlight %}

наш код должн создавать новую ключ-значение пару в `env` хеше:
And our code must create a new key-value pair in the `env` hash:
{% highlight ruby %}
def eval(exp, env)
  # ...
  elsif exp[0] == :define
    _, var, e = exp
    env[var] = eval(e, env)
  # ...
end
{% endhighlight %}

Осталась последняя функция, функция `lambda`, которая вызывается следующим образом:
Last function, 'lambda' in scheme have this syntax:
{% highlight scheme %}
(lambda (arg1, arg2, ...)
  (block of code))
{% endhighlight %}

Первое, что приходит в голову - возвращать новый объект `lambda` с новым значением `env` внутри, который будет выполнять наш код:
The first thing that comes to mind - to return a new `lambda` object with a new value inside `env` that will serve our code:
{% highlight ruby %}
def eval(exp, env)
  # ...
  elsif exp[0] == :lambda
    _, params, e = exp
    lambda { |*args| self.eval(e, env.merge(Hash[params.zip(args)])) }
  # ...
end
{% endhighlight %}

Как видите, мы реализовали основной функционал, реализацию арифмитических методов, а так же реализацию таких методов как `true`, `false`, `list`, etc я оставляю на совести читателя.
As you can see we realize base functional.
Implementating of arithmetic methods, and implementing methods such as `true`,` false`, `list`, etc I leave on the conscience of the reader.

## REPL
Идея, как и реализация repl невероятно простая: вы, в бесконечном цикле, берете строку от пользователя, обрабатывайте ее, после чего печатаете результат.
In base REPL have realy symple idea: repl takes single user inputs, evaluates them, and returns the result to the user.

{% highlight ruby %}
def repl(prompt = 'lisp >> ')
  while true
    print prompt
    program = gets

    p eval(parse(program))
  end
end
{% endhighlight %}

В итоге вы должны получить что-то вроде такого:
As a result, you should get something like this:
{% highlight text %}
lisp >> (define pi 3.14)
3.14
lisp >> (define circle-area (lambda (r) (* pi (* r r))))
#<Proc:0x007fa6140c6cc0@lib/rlisp.rb:86 (lambda)>
lisp >> (circle-area 11)
379.94
{% endhighlight %}

## Conclusions
К концу статьи мы имеем на руках простейший интерпретатор scheme.
At this moment we have a simple scheme interpreter.

Его легко расширять, мы написали простейший repl, а так же рассмотрели основную идею работы интерпретатора.
It is easy to expand, we wrote a simple repl, and considered the basic idea of the interpreter.

В рамках данной статьи не рассматривались такие важдые аспекты как многопоточность, оптимизация кода, работа с системой и многое другое.
In this article we does not consider such important aspects as macros, multithreading, code optimization, work with the system, and much more.

Об этом мы поговорим в следующих статьях.
This will be discussed in future articles.

http://norvig.com/lispy.html
