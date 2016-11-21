It's second part in my series of posts about ruby tips. Today we’re talking about:

* Special values
* Symbol
* Array
* Hash
* Range

__CAUTION:__ These tips are not equally feat to production. Lots of them are just interesting solutions which you'll not find anywhere else. Use them at your own risk.

## Special values
### Safe Levels
In ruby you can find security levels for your code.
The Ruby security level is represented by the `$SAFE` global variable.
The value ranges from minimum value 0 to maximum value 4.

https://ruby-hacking-guide.github.io/security.html

| $SAFE |	Constraints |
|-------|-------------|
|   0   |	No checking of the use of externally supplied (tainted) data is performed. This is Ruby's default mode. |
| >= 1  | Ruby disallows the use of tainted data by potentially dangerous operations. |
| >= 2  | Ruby prohibits the loading of program files from globally writable locations. |
| >= 3  | All newly created objects are considered tainted. |
| >= 4  | Ruby effectively partitions the running program in two. Nontainted objects may not be modified. Typically, this will be used to create a sandbox: the program sets up an environment using a lower$SAFE level, then resets $SAFE to 4 to prevent subsequent changes to that environment. |

### Email Regexp
In ruby you can find regexp for emails. If you want to use it you need to require `uri` library and call `URI::MailTo::EMAIL_REGEXP` constant.

### DATA object
The global `DATA` variable in Ruby allows us to access the text at the end of
our file listed after the `__END__` block. This can be surprisingly useful, for
instance if we need to extract information from a rather large data blob.

```ruby
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
```

## Symbol
### #all_symbols
https://ruby-doc.org/core-2.2.0/Symbol.html#method-c-all_symbols

Return array with all symbols in env.
``` ruby
Symbol.all_symbols.size # => 5675
```

### id2name
https://ruby-doc.org/core-2.2.0/Symbol.html#method-i-id2name

Alias for `#to_s` (I don't know why you need to use it but it's funny method I think).
```ruby
:test.id2name   #=> "test"
```

### slice
https://ruby-doc.org/core-2.2.0/Symbol.html#method-i-slice

Alias for `sym.to_s[]`.
```ruby
:hello_world.slice(0..4) #=> "hello"
:hello_world.[0..4]      #=> "hello"
```

## Array
### #bsearch
http://www.ruby-doc.org/core-2.1.5/Array.html#method-i-bsearch

``` ruby
ary = [0, 4, 7, 10, 12]
ary.bsearch {|x| x >=   4 } #=> 4
ary.bsearch {|x| x >=   6 } #=> 7
ary.bsearch {|x| x >=  -1 } #=> 0
ary.bsearch {|x| x >= 100 } #=> nil
```

### Range to array
You can use `*` operator for converting range to array.

```ruby
range = (1..10)

range.to_a == [*range] # => true
```

## Hash
### `**` method
Everyone know how to use `*` in method defenition argument list. But for some reason fewer people know about `**`.

```ruby
def method_name(value, *attr, **options)
  p attr
  p options
end

method_name('hello', 'cruel', 'world', collor: :red)
# => ['cruel', 'world']
# => { collor: :red }
```

Also you can call this method like `[*attr]`
```ruby
hash = { a: :b, c: :d }

{ **hash, e: :f } # => {:a=>:b, :c=>:d, :e=>:f}
```

### #gsub with hash args
``` ruby
str = "Help! All parentheses have been flipped )and I am sad(!"
str.gsub(/[\(\)]/, {"("=>")", ")"=>"("})
# => "Help! All parentheses have been flipped (and I am sad)!"
```

### Non string and symbol keys
```ruby
array = { false => 'No', :to_s.to_proc => 'proc' }

array[10 < 5]        # => "No"
array[:to_s.to_proc] # => "No"
```

### Hash#assoc
This method returns a two element array `[key, hash[key]]`

```
{a: 1, b: 2}.assoc(:b) # => [:b, 2]
```

## Range
### #cover? and time
``` ruby
((Time.now - 1.hour)..(Time.now + 1.hour)).cover? (Time.now - 1.day) # => false
((Time.now - 1.hour)..(Time.now + 1.hour)).cover? Time.now           # => true
```

### Ranges in case statements
```ruby
age = 28

case age
when 01..17 then "Young"
when 18..50 then "Adult"
when 50..99 then "Old"
end
```
