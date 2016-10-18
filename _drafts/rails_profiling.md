action:
можно возвращать граф вызовов в ответе, а можно писать в файл
удобно вызывать из теста
как читать:
https://github.com/ruby-prof/ruby-prof/blob/master/examples/graph.txt
```ruby
around_filter :profile if Rails.env == 'development'

def profile
  if params[:profile] && result = RubyProf.profile { yield }

    out = StringIO.new
    RubyProf::GraphHtmlPrinter.new(result).print out, :min_percent => 0
    self.response_body = out.string

    # or

    printer = RubyProf::GraphHtmlPrinter.new(result)
    File.open("#{Rails.root}/before.txt", 'w') { |file| printer.print(file) }

  else
    yield
  end
end
```

SQL: рэк мини профайлер

как профилить json и post запросы


Общее:
затупы во всех методах - читать пост

