---
layout: post
title: "Get requiest with custom locale in your tests"
description: "Send specifiy locale in rspec or minitest get request"
---

Sometimes in tests you have to set special locale for `get` request.
For example you want to [test selecting locale language](https://github.com/mperham/sidekiq/blob/master/test/test_web.rb#L33-L50).
For this you have to set locale in `'HTTP_ACCEPT_LANGUAGE'` variable in params hash.

{% highlight ruby %}
it 'your test description' do
  rackenv = {'HTTP_ACCEPT_LANGUAGE' => 'ru,en'}
  get '/', {}, rackenv

  ...
end
{% endhighlight %}
