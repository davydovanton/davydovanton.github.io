## Tips
``` ruby
def `(foo)
  foo.upcase
end

`'foo'` # => 'FOO'
```

------------------

require 'debug'
http://ruby-doc.org/stdlib-2.0.0/libdoc/debug/rdoc/DEBUGGER__.html

------------------

Вместо метопрограммирования - сделать общий метод, который из каждого метода вызывать
``` ruby
# Bad
%[foo bar].each do |name|
  define_method(:"set_#{name}") do |val|
    name = :"#{name}_name"
    self.attributes[name] = val
  end
end

# Good
def set_attibute(attribute, value)
  self.attributes[attribute] = value
end

def set_foo(val)
  set_attibute :foo_name, val
end

def set_bar(val)
  set_attibute :bar_name, val
end
```

## Uppercase Downcase russian chars
https://github.com/petrovich/petrovich-ruby/blob/dev-1.0/lib/petrovich/unicode.rb

## Tracing Ruby Code
http://ruby-doc.org/core-2.2.0/TracePoint.html

``` ruby
def trace(event_type = :call, *matchers)
  points = []

  tracer = TracePoint.new(event_type) do |trace_point|
    if matchers.all? { |match| trace_point.path.match(match) }
      points << { file: trace_point.path, line: trace_point.lineno, }
    end
  end

  result = tracer.enable { yield }

  File.open('/tmp/trace.txt', 'w') do |file|
    points.each do |point|
      file.puts "#{point[:file]}:#{point[:line]}"
    end
  end

  result
end

# :line,                      # line of code
# :call, :return              # ruby method
# :class, :end                # start/end of class/module
# :c_call, :c_return          # MRI itself
# :raise                      # exception
# :b_call, :b_return          # ruby block
# :thread_begin, :thread_end  # thread

trace(:call) do
  FactoryGirl.create(:account) # call we want to trace
end
```

## Rspec
### Order spec groups
```ruby
config.order_groups {|list| list.reject{|e| e.metadata[:seeded]}.shuffle(random: Random.new(config.seed)) \
                          + list.select{|e| e.metadata[:seeded]}.shuffle }
```

## gem memory usage
``` ruby
proc_status_file = "/proc/#{$$}/status"
proc_status = File.open(proc_status_file, "r") {|f| f.read_nonblock(4096).strip }
proc_status =~ /RSS:\s*(\d+) kB/i
rss = $1.to_f
```


## Enumerable
### #slice_before
``` ruby
[1, 'a', 2, 'b', 'c', 3, 'd', 'e', 'f'].slice_before { |e| e.is_a?(Integer) }.to_a
# => [[1, "a"], [2, "b", "c"], [3, "d", "e", "f"]]
```

### #slice_after
```
[1, 'a', 2, 'b', 'c', 3, 'd', 'e', 'f'].slice_after(Integer).to_a
# => [[1], ["a", 2], ["b", "c", 3], ["d", "e", "f"]]
```

## Compiler
### Tail Call Optimization
``` ruby
code = <<-CODE
  class Factorial
    def self.fact_helper(n, res)
      n == 1 ? res : fact_helper(n - 1, n * res)
    end

    def self.fact(n)
      fact_helper(n, 1)
    end
  end
CODE
options = {
  tailcall_optimization: true,
  trace_instruction: false,
}
RubyVM::InstructionSequence.new(code, nil, nil, nil, options).eval
```



### GC::Profiler
http://bit.ly/fhPsiJ
```
GC::Profiler.enable; GC.start; puts GC::Profiler.result
```


### How to see YARV bytecode
```
puts RubyVM::InstructionSequence.compile('a = 1; p 1 + a').disassemble
```

http://rubyquicktips.com/post/2620098585/prevent-stringsplit-from-throwing-away-empty



# Rails

## Methods
### #touth
Simple update(with save) datestamp for model. [Link](http://apidock.com/rails/ActiveRecord/Timestamp/touch).
Have callback `after_touch`. `belongs_to` method have this options too.

### #demodulize
Removes the module part from the expression in the string.
``` ruby
'ActiveRecord::CoreExtensions::String::Inflections'.demodulize # => "Inflections"
'Inflections'.demodulize                                       # => "Inflections"
```

## Tips
### Find a controller and action from a URI string
So given a routes file:

```ruby
# config/routes.rb
# ...
resources :posts
# ...
```

For Find a controller and action from a URI string try out the following:
```ruby
Rails.application.routes.recognize_path('/posts') #=> { controller: 'posts', action: 'index' }
```

### local_assigns variable
Use `local_assigns` to access your local variables.

``` erb
# Template 1
<%= render 'some/partial', magic: variable %>

# Template 2
<%= render 'some/partial' %>

# some/partial
<%= locals[:magic] %>
```

### Cleaning up the Rails backtrace cleaner
http://api.rubyonrails.org/classes/ActiveSupport/BacktraceCleaner.html#method-i-remove_silencers-21

``` ruby
Rails.backtrace_cleaner.remove_silencers!
```
