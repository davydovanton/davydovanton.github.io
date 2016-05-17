---
layout: post
title: "Building your API with roda and rails"
description: ""
tags:
  - ruby
  - rails
  - roda
  - api
---

1. Problem
2. what is roda
3. why roda
4. what you need to do
5. conclusion

## introduction
иногда вам нужно добавить API для вашего приложения. вы можете найти реальные примеры в gitlab или rubygems, но чаще разработчики используют grape или rails-api.
Сегодня я бы хотел рассказать о замечательном веб фреймворке. этот фреймворк называется roda.
Он написан джереми и является простым роутинг фреймворком. Почему стоит на него посмотреть?
1. он быстрый
2. он простой
3. у него плагинов много
4. из него можно сделать все что угодно

```
Framework            Requests/sec  % from best
----------------------------------------------
mustermann                9389.60       100.0%
roda                      9252.03       98.53%
rack                      9246.16       98.47%
hanami-router             6240.81       66.47%
sinatra                   2935.63       31.26%
grape                     2512.17       26.75%
```

## интеграция

```ruby
# Gemfile
gem 'roda'
```

```ruby
# config/routes.rb
require './lib/api/base'
mount API::Base => '/api'
```

```ruby
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
```

```ruby
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
```

## Problems / future
1. swagger
2. typecasting params

[gitlab-api]: https://github.com/gitlabhq/gitlabhq/tree/master/lib/api
[rubygems-api]: https://github.com/rubygems/rubygems.org/tree/master/app/controllers/api
[jeremyevans]: https://github.com/jeremyevans
[roda]: http://roda.jeremyevans.net
[grape]: http://www.ruby-grape.org
[benchmarks]: https://github.com/luislavena/bench-micro
[rodauth]: http://rodauth.jeremyevans.net

http://roda.jeremyevans.net/why.html
