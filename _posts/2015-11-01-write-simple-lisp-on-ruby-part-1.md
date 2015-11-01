---
layout: post
title: "Write simple scheme interpreter on ruby"
description: "В этой серии постов мы напишем простой интерпретатор схемы с простыми командами и реплом"
---

**TL;DR:** [github repo](https://github.com/davydovanton/rlisp)

Every developer has a moment in his life when he wants to write his own programming language.
So in this article I want to show you how to do this for a simple lisp compiler.

## Why scheme and lisp?
Firstly, lisp is very simple for realization and for understanding.
Lisp (_LISt Processor_) is a family of languages which based on the idea of S-expressions.
S-Expression needed for data representation and may consist of atoms (numbers, symbols, boolean expressions) or an expression of the form `(x . y)` where `x` and `y` are s-expressions.
This expression may be formed as lists (`(1 . ( 2 . 3))` this equals `(1 2 3)`) and trees (`((1 . (2 . 3)) . (4 . 5))`).

Secondly, after creating interpreter you can better to understand language (author fully understood the environment idea).
Also you can understand main idea of compilers and interpreters.

So we begin our journey into the world of compilers and interpreters to write a simple scheme interpreter.

## Main idea
Our language will contain two parts: parser which translate string to AST and `eval` function.
This function will take the AST with envariement value and will returns result of the code.

Schematically, it looks like this:
{% highlight text %}
code(string) => parse function => AST => eval function => result
{% endhighlight %}

## First step. Parser.
To begin, let's define what we want to get.
For example, we have a string `'(+ 1 1 1)'`.
What our parser should return? What kind of data structure? I think, that array will be correctly.

Let write simple test code:
{% highlight ruby %}
program = '(+ 1 1 1)'
lisp = Lisp.new
lisp.parse(program) == [:+, 1, 1, 1]
{% endhighlight %}

As you can see, this is simple code therefore I just display `parse` method code:
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

As you know, in lisp you can write your code with nested operators, for example - `(+ (* 2 2) (- 5 3))`.
And this code will return 6.

If we use our parser for this code, we get is not quite what we need, so let's update our test code:
{% highlight ruby %}
program = '(+ (* (1 2) 3) 4)'
lisp = Lisp.new
lisp.parse(program) == [:+, [:*, [1, 2], 3], 4]
{% endhighlight %}

As you might guess, the most obvious way to fix our code - call `parse` method in recursion and all array elements from `'('` to `')'` we move to nested array.
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

We did it! Let's start make `eval` method.

## Eval method
As I said earlier, our interpreter consist of two parts: parser and `eval` function.

The `eval` function will take two arguments: an expression, `exp`, that we want to evaluate, and an environment, `env`, in which to evaluate it. An environment is a mapping from variable names to their values.
By default, eval will use a instance value that includes the names for a bunch of standard things.

let's implement `@env` variable with `car`, `cdr` and `cons` functions:
{% highlight ruby %}
env = {
  :car  => lambda { |*list| list[0] },
  :cdr  => lambda { |*list| list.drop 1 },
  :cons => lambda { |(e, cell), _| [e] + cell },
}
{% endhighlight %}

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

Now we have a problem: what will be happen when the first element of array will be not symbol (integer for example) and what will be happen when we have nested functiions?
I think we can add check to element type like this:
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

Some (eg arithmetic), we can easily add to `env` variable, and some do not.
Therefore we need to extend checking in `eval` function. We will add check on function name.
For example, code bellow demonstrate `quote` and `if` functions:
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

Next step - initialize `define` and `lambda` functions.
In scheme `define` function syntax is as follows:
{% highlight scheme %}
(define name
  (expression))
{% endhighlight %}

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

Last function, 'lambda' in scheme have this syntax:
{% highlight scheme %}
(lambda (arg1, arg2, ...)
  (block of code))
{% endhighlight %}

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

As you can see we did basic functionality of the our interpreter.
Implementating of arithmetic methods, and implementing methods such as `true`,` false`, `list`, etc I leave on the conscience of the reader.

## REPL
In main REPL have realy simple idea: repl takes single user inputs, evaluates them, and returns the result to the user.
And all this is happening in an infinite loop:
{% highlight ruby %}
def repl(prompt = 'lisp >> ')
  while true
    print prompt
    program = gets

    p eval(parse(program))
  end
end
{% endhighlight %}

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
At this moment we have a simple scheme interpreter.
It is easy to expand, we wrote a simple repl, and considered the basic idea of the interpreter.
In this article we does not consider such important aspects as macros, multithreading, code optimization, work with the system, and much more.
This will be discussed in future articles.

## Further reading
http://norvig.com/lispy.html
http://www.wikiwand.com/en/S-expression
