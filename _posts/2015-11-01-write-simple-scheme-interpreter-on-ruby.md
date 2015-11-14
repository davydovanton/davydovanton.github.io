---
layout: post
title: "Write simple scheme interpreter on ruby"
description: "In this post we'll write simple scheme interpreter with repl and base functionality on ruby language"
tags:
  - lisp
  - ruby
  - interpreters
---

**TL;DR:** [github repo](https://github.com/davydovanton/rlisp)

Every developer has a moment in his life where he wants to write his own programming language.
In this article, I want to show you how to do this for a simple lisp compiler.

## Why scheme and lisp?
Firstly, lisp is very simple for create and for understanding.
Lisp (_LISt Processor_) is a family of languages which is based on the idea of [S-expressions](http://www.wikiwand.com/en/S-expression).
[S-Expression](http://www.wikiwand.com/en/S-expression) are needed for data representation and may consist of atoms (numbers, symbols, boolean expressions) or are the expression of the form `(x . y)` where `x` and `y` are [s-expressions](http://www.wikiwand.com/en/S-expression).
This expression may be formed as lists (`(1 . ( 2 . 3))` this equals `(1 2 3)`) and trees (`((1 . (2 . 3)) . (4 . 5))`).

Secondly, after creating interpreter you can better understand the language (the author fully understood the environment idea).
Also you can understand the main idea of compilers and interpreters.

Now let's begin our journey into the world of compilers and interpreters so that we can write a simple scheme interpreter.

## Main idea
Our language will contain two parts: a parser which translates the string to [AST](http://www.wikiwand.com/en/Abstract_syntax_tree) and `eval` function.
This function will take the [AST](http://www.wikiwand.com/en/Abstract_syntax_tree) with envariement value and will return the result of the code.

Schematically, it looks like this:
{% highlight text %}
code(string) => parse function => AST => eval function => result
{% endhighlight %}

## First step. Parser.
To begin, let's define what we want to get.
For example, we have a string `'(+ 1 1 1)'`.
What should our parser return? What kind of data structure should we receive? I think, that an array would be correct.

Let write simple test code:
{% highlight ruby %}
program = '(+ 1 1 1)'
lisp = Lisp.new
lisp.parse(program) == [:+, 1, 1, 1]
{% endhighlight %}

As you can see, this is a simple code, so I just displayed `parse` method code:
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

When we use our parser for this code, the result is not quite what we need, so let's update our test code:
{% highlight ruby %}
program = '(+ (* (1 2) 3) 4)'
lisp = Lisp.new
lisp.parse(program) == [:+, [:*, [1, 2], 3], 4]
{% endhighlight %}

As you might guess, the most obvious way to fix our code is to call `parse` method in recursion and all array elements from `'('` to `')'`.
We will move to a nested array.
The code will be look loke this:
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

We did it! Let's start to make `eval` method.

## Eval method
As I said earlier, our interpreter consists of two parts: a parser and `eval` function.

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

The next step is to make `eval` function which will look for a match on the first element of the input array
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

Now we have a problem: what will happen when the first element of the array will be not be a symbol (integer for example) and what will be happen when we have nested functions?
I think we can add a check to the element type like this:
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
Therefore, we need to extend the checking in `eval` function. We will add a check for function name.
For example, the code below will demonstrate `quote` and `if` functions:
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

The next step is to initialize `define` and `lambda` functions.
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

The last function, `lambda` in scheme will have this syntax:
{% highlight scheme %}
(lambda (arg1, arg2, ...)
  (block of code))
{% endhighlight %}

The first thing that comes to mind is to return the new `lambda` object with a new value inside `env` that will serve our code:
{% highlight ruby %}
def eval(exp, env)
  # ...
  elsif exp[0] == :lambda
    _, params, e = exp
    lambda { |*args| self.eval(e, env.merge(Hash[params.zip(args)])) }
  # ...
end
{% endhighlight %}

As you can see, we made basic functionality of the our interpreter.
I will leave learning how to do the implement the arithmetic methods and other methods such as `true`, `false`, `list`, etc up to the reader.

## REPL
In main REPL have really simple idea repl takes single user inputs, evaluates them, and returns the result to the user.
And all this is happens in an infinite loop:
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
Right now, we have a simple scheme interpreter.
It is easy to expand since we wrote a simple repl, and considered the basic idea of the interpreter.
In this article, we did not consider such important concepts as macros, multithreading, code optimization, work with the system, and much more.
These concepts will be discussed in future articles.

## Further reading
- Lisp interpreter written on python ([http://norvig.com/lispy.html](http://norvig.com/lispy.html))
- Lisp interpreter written on C lang ([http://www.buildyourownlisp.com](http://www.buildyourownlisp.com))
- [http://www.wikiwand.com/en/Scheme_(programming_language)](http://www.wikiwand.com/en/Scheme_(programming_language))
- [http://www.wikiwand.com/en/S-expression](http://www.wikiwand.com/en/S-expression)
