---
layout: post
title: "Write simple scheme interpreter on ruby"
description: "В этой серии постов мы напишем простой интерпретатор схемы с простыми командами и реплом"
---


**TL;DR:** [github repo](https://github.com/davydovanton/rlisp)

В жизни каждого разработчика наступает момент, когда он хочет написать свой собственный язык программирования.
Поэтому в данной статье мы рассмотрим на примере простейшего лисп компилятора как это сделать.

## Почему лисп?

Во первых, язык очень простой как для реализации, так и для понимания.

Лисп - семейство языков основной идеей которых являются S-выражения. 
S-выражение - это такая штука, которая нужна для представления данных и которая может состоять из атомов
(числа, строки, булевы выражения), либо из точечных пар, которые имеют вид `(x . y)`.
Основная идея точечных пар в том, что они могут формировать как списки (`(1 . ( 2 . 3))` что эквивалентно `(1 2 3)`), так
и деревья (`((1 . (2 . 3)) . (4 . 5))`).

Во вторых, при самостоятельной реализации интерпретатора, можно лучше понять язык (автор доконца понял идею envariement),
так и понять основную идею компиляторов.

Поэтому мы начнем наше путешествие в мир компиляторов и интерпретаторов с написания простейшего интерпретатора схемы.

## Основная идея.

Наш язык будет состоять из двух частей, парсера, который превратит нашу строку текста (программа) в AST структуру.
Следующая часть нашего языка - eval функция, которая будет принимать наш AST и envariement переменную и возвращать результат выполнения кода.
Начнем с парсера.

## Шаг первый. Пишем парсер.

Для начала, давайте определимся, чего мы хотим получить. У нас есть строка, например `(+ 1 1 1)`.
Что наш парсер должен вернуть? Какую структуру данных? Думаю, что массив будет тем, что нужно. Так как я приверженец TDD/BDD 
то давайте напишем наш первый "тест" (далее мои тесты будут построенны исключительно на операции сравнения):

{% highlight ruby %}
program = '(+ 1 1 1)'
lisp = Lisp.new
lisp.parse(program) == [:+, 1, 1, 1]
{% endhighlight %}

Как видите, все достаточно просто, поэтому я сразу напишу код, который выполнит наш тест:
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

В результате выполнения этого кода мы получим число 6. Если мы используем наш парсер для этого кода,
мы получим не совсем то, что нам нужно, поэтому давайте обновим наш тест:
{% highlight ruby %}
program = '(+ (* (1 2) 3) 4)'
lisp = Lisp.new
lisp.parse(program) == [:+, [:*, [1, 2], 3], 4]
{% endhighlight %}

Как вы могли догадаться - самый очевидный способ исправить наш тест - обойти все элементы массива и если мы встречаем `'('`,
то мы просто помещаем все элементы до `')'` в отдельный массив + делаем это рекурсивно. В итоге наш код принимает следующий вид:
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
Теперь перейдем к самому интересному.

## Eval наше все
Как я говорил ранее, наша программа состоит из 2ух частей, парсера и `eval` функции, которая будет выполнять наш код.
Основная идея, которая лежит в `eval` функции - это то, что она состоит из непосредственно функции `eval`,
которая по первому элементу массива определяет, что за функция передана к нам и переменной `env` которая 
является обычным хешем. В `env` ключ будет являться именем нашей переменной, а значением будет лямбда, которая
будет выполняться для всех элементов после объявления функции.

Звучит сложно, но давайте реализуем оснавные функции `car`, `cdr` и `cons`:
{% highlight ruby %}
env = {
  :car  => lambda { |*list| list[0] },
  :cdr  => lambda { |*list| list.drop 1 },
  :cons => lambda { |(e, cell), _| [e] + cell },
}
{% endhighlight %}

Следующее что нам нужно - написать функцию `eval`, которая будет искать совпадение по первому элементу входящего массива:
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

Давайте обновим нашу функцию, добавив в нее проверку на тип:
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

Как вы могли догадаться - кроме функций `car`, `cdr` и `cons` у нас должны быть другие функции.
Какие-то (например арифмитические) мы можем легко добавить в `env` переменную, а какие-то нет.
Поэтому нам придется расширить проверку в `eval` функции, добавив в нее проверку на имя функции (первого элемента массива)

Например, `quote` и `if` функции будут реализованны так:
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

Синтаксис `define` функции выглядит следующим образом:
{% highlight scheme %}
(define name
  (expression))
{% endhighlight %}

И как вы заметили, наш код должн создавать новую ключ-значение пару в `env` хеше:
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
{% highlight scheme %}
(lambda (arg1, arg2, ...)
  (block of code))
{% endhighlight %}

Первое, что приходит в голову - возвращать новый объект `lambda` с новым значением `env` внутри, который будет выполнять наш код:
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

## REPL
Идея, как и реализация repl невероятно простая: вы, в бесконечном цикле, берете строку от пользователя, обрабатывайте ее, после чего печатаете результат.
Поэтому

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
{% highlight text %}
lisp >> (define pi 3.14)
3.14
lisp >> (define circle-area (lambda (r) (* pi (* r r))))
#<Proc:0x007fa6140c6cc0@lib/rlisp.rb:86 (lambda)>
lisp >> (circle-area 11)
379.94
{% endhighlight %}

## Выводы
К концу статьи мы имеем на руках простейший интерпретатор scheme. Его легко расширять, мы написали простейший repl, а так же рассмотрели основную идею работы интерпретатора.

В рамках данной статьи не рассматривались такие важдые аспекты как многопоточность, оптимизация кода, работа с системой и многое другое.
Об этом мы поговорим в следующих статьях.

http://www.wikiwand.com/ru/S-выражение
