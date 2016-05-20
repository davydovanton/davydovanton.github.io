---
layout: post
title: "Building your rails API with roda"
description: "Building your rails API with roda"
tags:
  - ruby
  - rails
  - roda
  - api
---

## Introduction

Sometimes you need to build API serveice in your rails application.
Of course you can use popular solutions as [grape][grape] or [rails-api][rails-api] gems.
And also you can find real examples in [gitlab][gitlab-api] or [rubygems][rubygems-api] projects.

But today I'm going to tell you about other framework. It's [roda][roda].
Roda was created by [Jeremy Evans][jeremyevans] and it's fast and simple ruby routing framework.
So why should you take a look on it?

There’s a list of advantages of this framework:

1. Fast;
2. Simple;
3. Roda provides simple way to working with big count of different plugins;
4. You can use any architecture with it;

So I mentioned that roda is fast. If you want to verify this, just check [this benchmark repository][benchmarks] and you'll see that roda is really fast.
For example, I run benchmarks on locally and get this result:

{% highlight code %}
Framework            Requests/sec  % from best
----------------------------------------------
mustermann                9389.60       100.0%
roda                      9252.03       98.53%
rack                      9246.16       98.47%
hanami-router             6240.81       66.47%
sinatra                   2935.63       31.26%
grape                     2512.17       26.75%
{% endhighlight %}

## Integration

Roda based on rack. That's why this integration with rails will be very simple.
Firstly you need to add roda gem to your gemfile:

{% highlight ruby %}
gem 'roda'
{% endhighlight %}

Secondly you need to create simple roda application.
Note that you need to use `json` and `all_verbs` plugins.
The first one needs to JSON responce and the second one provides all REST methods for your application (like `put`, `patch`, etc).
I puted my roda application in to `lib/api/base.rb` path but you can use whatever you waht.

{% highlight ruby %}
# lib/api/base.rb
require 'roda'
require 'json'

module API
  class Base < Roda
    plugin :json
    plugin :all_verbs

    route do |r|
      r.on "v1" do
        r.get 'hello' do
          { hello: :world }
        end
      end
    end
  end
end
{% endhighlight %}

After that you need to mount your application in `config/routes.rb`.
This is done as well as any other rack application:

{% highlight ruby %}
# config/routes.rb
require './lib/api/base'
mount API::Base => '/api'
{% endhighlight %}

And the last part, we need to split our application to different modules with different logic and routes.
For this we have to create required module. In an example I created `Users` module with all REST routes:

{% highlight ruby %}
# lib/api/users.rb
module API
  class Users < Roda
    plugin :json
    plugin :all_verbs

    route do |r|
      r.is 'users' do
        r.get do
          { users: User.last(10) }
        end

        r.post do
          { user: User.new }
        end
      end

      r.is 'users/:id' do |id|
        user = User.find(id)

        r.get do
          { user: user}
        end

        r.patch do
          { user: 'updated' }
        end

        r.delete do
          { user: 'deleted' }
        end
      end
    end
  end
end
{% endhighlight %}

Finnaly you need to mount our module to roda application. It is very simple too.

{% highlight ruby %}
# lib/api/base.rb
require 'roda'
require 'json'
require 'users'

module API
  class Base < Roda
    plugin :json
    plugin :all_verbs

    route do |r|
      r.on "v1" do
        r.run API::Users
      end
    end
  end
end
{% endhighlight %}

That's all. Now we have a simple roda API application which integrated to our rails app.

## Problems / future

In the last part I want to list problems and ideas what I want to solve in future.

1. Roda doesn't have a swagger integrating from the box. Now I'm thinking about using swagger-block gem for it.
2. Also roda doesn't typecast your params. I know that grape uses virtus gem for this. And this feature you should realize by youself too.

## Conclusion

On this blog post I wanted to show you that you're not limited only to popular API server gems.
As you can see roda have amazing ideas and properties such as modulatiry, simplicity, speed and stability.
Also this framework has a simple way to integration in to your rails application.

Happy hacking! emoji

## Further reading
- [Why roda?](http://roda.jeremyevans.net/why.html)
- [Rodauth](http://rodauth.jeremyevans.net). Authentication framework based on roda.

[grape]: http://www.ruby-grape.org
[rails-api]: https://github.com/rails-api/rails-api
[gitlab-api]: https://github.com/gitlabhq/gitlabhq/tree/master/lib/api
[rubygems-api]: https://github.com/rubygems/rubygems.org/tree/master/app/controllers/api
[jeremyevans]: https://github.com/jeremyevans
[roda]: http://roda.jeremyevans.net
[benchmarks]: https://github.com/luislavena/bench-micro
