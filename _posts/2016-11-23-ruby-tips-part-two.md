---
layout: post
title: "Ruby tips #2"
description: "Second part of series post about ruby tips and tricks"
tags:
  - ruby
  - tips
---

It's a second part of my post series about ruby tips. Today you’ll learn more about:

* Special values
* Symbol
* Array
* Hash
* Range

__CAUTION:__ These tips are not equally feat to production. Lots of them are just interesting solutions which you'll not find anywhere else. Use them at your own risk.

## Special values

### Safe Levels

[Full description](https://ruby-hacking-guide.github.io/security.html)

In ruby you can find security levels for your code.
The Ruby security level is represented by the `$SAFE` global variable.
The value ranges from minimum value 0 to maximum value 4.


| $SAFE |	Constraints |
|-------|-------------|
|   0   |	No checking of the use of externally supplied (tainted) data is performed. This is Ruby's default mode. |
| >= 1  | Ruby disallows the use of tainted data by potentially dangerous operations. |
| >= 2  | Ruby prohibits the loading of program files from globally writable locations. |
| >= 3  | All newly created objects are considered tainted. |
| >= 4  | Ruby effectively partitions the running program in two. Nontainted objects may not be modified. Typically, this will be used to create a sandbox: the program sets up an environment using a lower$SAFE level, then resets $SAFE to 4 to prevent subsequent changes to that environment. |

### Email Regexp

In ruby you can find regexp for emails. If you want to use it, you have to require `uri`
library and call `URI::MailTo::EMAIL_REGEXP` constant.

### DATA object

The global `DATA` variable in ruby allows us to access the text at the end of our file
listed after the `__END__` block. This can be surprisingly useful, for instance if we
need to extract information from a rather large data blob.

{% highlight ruby %}
# in one file
require "json"

puts JSON.load(DATA) # this DATA required text bellow __END__

__END__
{
  "records": [
    {
      "artist":"Iggy Pop",
      "title":"Lust for Life"
    },
    {
      "artist":"Television",
      "title":"Marquee Moon"
    },
    {
      "artist":"Talking Heads",
      "title":"Talking Heads: 77"
    }
  ]
}
{% endhighlight %}

## Symbol

### #all_symbols

[Documentation](https://ruby-doc.org/core-2.2.0/Symbol.html#method-c-all_symbols)

Return array with all symbols in env.

{% highlight ruby %}
Symbol.all_symbols.size # => 5675
{% endhighlight %}

### id2name

[Documentation](https://ruby-doc.org/core-2.2.0/Symbol.html#method-i-id2name)

Alias for `#to_s` (I don't know why you need to use this but it's a funny method I think).

{% highlight ruby %}
:test.id2name   #=> "test"
{% endhighlight %}

### slice

[Documentation](https://ruby-doc.org/core-2.2.0/Symbol.html#method-i-slice)

Alias for `sym.to_s[]`.

{% highlight ruby %}
:hello_world.slice(0..4) #=> "hello"
:hello_world.[0..4]      #=> "hello"
{% endhighlight %}

## Array

### #bsearch

[Documentation](http://www.ruby-doc.org/core-2.1.5/Array.html#method-i-bsearch)

{% highlight ruby %}
ary = [0, 4, 7, 10, 12]
ary.bsearch {|x| x >=   4 } #=> 4
ary.bsearch {|x| x >=   6 } #=> 7
ary.bsearch {|x| x >=  -1 } #=> 0
ary.bsearch {|x| x >= 100 } #=> nil
{% endhighlight %}

### Range to array

You can use `*` operator for converting range to array.

{% highlight ruby %}
range = (1..10)

range.to_a == [*range] # => true
{% endhighlight %}

## Hash

### `**` method

You probably know already how to use `*` in method definition argument list. But `**` is less known.

{% highlight ruby %}
def method_name(value, *attr, **options)
  p attr
  p options
end

method_name('hello', 'cruel', 'world', collor: :red)
# => ['cruel', 'world']
# => { collor: :red }
{% endhighlight %}

Also you can call this method like `[*attr]`

{% highlight ruby %}
hash = { a: :b, c: :d }

{ **hash, e: :f } # => {:a=>:b, :c=>:d, :e=>:f}
{% endhighlight %}

### #gsub with hash args

{% highlight ruby %}
str = "Help! All parentheses have been flipped )and I am sad(!"
str.gsub(/[\(\)]/, {"("=>")", ")"=>"("})
# => "Help! All parentheses have been flipped (and I am sad)!"
{% endhighlight %}

### Non string and symbol keys

{% highlight ruby %}
hash = { false => 'No', :to_s.to_proc => 'proc' }

hash[10 < 5]        # => "No"
hash[:to_s.to_proc] # => "proc"
{% endhighlight %}

### Hash#assoc

This method returns a two element array `[key, hash[key]]`

{% highlight ruby %}
{a: 1, b: 2}.assoc(:b) # => [:b, 2]
{% endhighlight %}

## Range

### #cover? and time

{% highlight ruby %}
((Time.now - 1.hour)..(Time.now + 1.hour)).cover? (Time.now - 1.day) # => false
((Time.now - 1.hour)..(Time.now + 1.hour)).cover? Time.now           # => true
{% endhighlight %}

### Ranges in case statements

{% highlight ruby %}
age = 28

case age
when 01..17 then "Young"
when 18..50 then "Adult"
when 50..99 then "Old"
end
{% endhighlight %}

# Conclusions

That's all. I hope it'll be useful for you. In next part we’re gonna talking about:

* Tracing Ruby Code
* memory usage
* Enumerable
* Compiler
* Rspec
* Rails

Happy hacking! 🚀
