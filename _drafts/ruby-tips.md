For a long time, I have been collecting some ruby tips.
And now I think it's time for share them.
In this series of posts, I'll show you some interesting solutions, tips, and sugars for ruby language.

And today we'll talk about:
* Kernel
* Class
* Object
* Proc (lambda)
* Method

CAUTION: Not all tips are equally useful.
Many of them are just interesting solutions which you'll not find anywhere else.
Use them at your own risk.

## Kernel
### Char
If you want to get string with only one char you can use `?*` syntax.
Also you can use this hack in different methods like 'join'
```ruby
?a == 'a' # => true

[1, 2, 3].join(?:) # => "1:2:3"
[1, 2, 3] * ?: # => "1:2:3"
```

### callcc
You can find `callcc` method in any language.
Ruby is no exception
http://blog.ontoillogical.com/blog/2014/07/12/delimited-continuations-in-ruby/

### caller
https://ruby-doc.org/core-2.3.1/Kernel.html#method-i-caller
If you want to return the current execution stack you could use `Kernel#caller` method.
```ruby
def a(skip)
  caller(skip)
end

def b(skip)
  a(skip)
end

def c(skip)
  b(skip)
end

c(0)   #=> ["prog:2:in `a'", "prog:5:in `b'", "prog:8:in `c'", "prog:10:in `<main>'"]
c(1)   #=> ["prog:5:in `b'", "prog:8:in `c'", "prog:11:in `<main>'"]
c(2)   #=> ["prog:8:in `c'", "prog:12:in `<main>'"]
c(3)   #=> ["prog:13:in `<main>'"]
c(4)   #=> []
c(5)   #=> nil
```

### itself
Ruby went out and got itself an identity method.
For those not familiar, an identity method returns the object it’s called on:
``` ruby
1.itself # => 1
```

### `j` and `jj`
When you require `json` library you get two interesting methods.
First is `Kernel#j`.
This method outputs object to `STDOUT` as JSON strings in the shortest form, that is in one line.

```ruby
require 'json'

h = { a:1, b:2 }
j(h)
```

And second is `Kernel#jj`
This method outputs object to `STDOUT` as JSON strings in a pretty format, with indentation, and over many lines.

```ruby
require 'json'

h = { a:1, b:2 }
jj(h)
```

## Class
### allocate
https://ruby-doc.org/core-1.9.3/Class.html#method-i-allocate
Allocates space for a new object of class’s class and does not call initialize on the new instance.
The returned object must be an instance of a class.
``` ruby
class Test
  def initialize
    @var = "new"
  end
end

Test.new      # => #<Test:0x007ff2a34965b8 @var="new">
Test.allocate # => #<Test:0x007ff2a34965b8>
```

### Refinements
http://ruby-doc.org/core-2.1.1/doc/syntax/refinements_rdoc.html
http://timelessrepo.com/refinements-in-ruby

Refinements are designed to reduce the impact of monkey patching on other users of the monkey-patched class.
Refinements provide a way to extend a class locally.
``` ruby
module TimeExtensions
  refine Fixnum do
    def minutes; self * 60; end
  end
end

class MyApp
  using TimeExtensions

  def initialize
    p 2.minutes
  end
end

MyApp.new    # => 120
p 2.minutes  # => NoMethodError
```

## Object
### #tap
http://www.ruby-doc.org/core-2.1.5/Object.html#method-i-tap
Yields x to the block, and then returns x.
``` ruby
(1..10)               .tap{ |x| puts "original: #{x.inspect}" }
  .to_a               .tap{ |x| puts "array:    #{x.inspect}" }
  .select{|x| x%2==0} .tap{ |x| puts "evens:    #{x.inspect}" }
  .map{ |x| x*x }     .tap{ |x| puts "squares:  #{x.inspect}" }
```

## Proc (lambda)
### curry
https://ruby-doc.org/core-2.1.1/Proc.html#method-i-curry
Ruby defines `curry` for `Method` and `Proc`, allowing procs to return partially applied procs when they get called with fewer than the required number of arguments.
For example:

```ruby
multiply = -> x,y { x * y }.curry
#=> #<Proc:0x007fed33851510 (lambda)>
multiply[2,3]
#=> 6
double = multiply[2]
#=> #<Proc:0x007fed35892888 (lambda)>
double[3]
#=> 6
```

**Note:** While `Proc#curry` has been around since Ruby 1.9, `Method#curry` was only added in Ruby 2.2.0.
For versions before 2.2.0, you will first need to convert your method object to a proc via `Method#to_proc`.

### #to_proc and #method
https://ruby-doc.org/core-2.1.1/Proc.html#method-i-to_proc
If you need call method with args in `to_proc` you can use `method` method:

``` ruby
[:asd, :bsd].map{ |i| puts i }
# it's like as
[:asd, :bsd].map(&method(:puts))
```

### All ways to call proc (lambda)
You can use 7 different ways to call lambda:
``` ruby
p = -> { "hello" }

p.call()
p::()
p.()
p[]
p.yield
p.===
p.send(:call)
```

## Method
### method
You can call some methods with `method` method.
This method [returns](http://ruby-doc.org/core-2.1.4/Method.html) `Method` class.
This more complite than lambda:

``` ruby
# 'method' method
sin_method = Math.method(:sin)
(1..10).map(&sin_method)

# lambda style
sin_method = -> (x) { Math.sin(x) }
(1..10).map(&sin_method)
```

## Block
### Empty block
```ruby
>> [1, 2, 3].map
# => #<Enumerator: [1, 2, 3]:map>

# or
>> [1, 2, 3].map(&nil)
# => #<Enumerator: [1, 2, 3]:map>
```

You can send `&nil` as an empty block.

---------------------------------

That's all. I hope it'll useful for you. In next part we'll talk about:

* Special values in ruby world
* Symbol
* Array
* Hash
* Range

happy hacking
