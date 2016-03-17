---
layout: post
title: "Simplest way to authenticate user in hanami app"
description: "In this post we'll add simplest authentication to your hanami application"
tags:
  - ruby
  - hanami
  - tips
---

If you need the simplest and easiest way to adding authentication logic in your [hanami][hanami] app (to admin app for example) you always can use [`Rack::Auth::Basic`][auth] class.

For this you need to add following lines of code to your `controller.prepare` configuration block:

{% highlight ruby %}
# apps/admin/application.rb

controller.prepare do
  # ...
  # some code

  use Rack::Auth::Basic, 'Message' do |username, password|
    username == 'admin' && password == 'password'
  end
end
{% endhighlight %}

Happy authenticating!

**P.S.:** also if you need something more complicated you can reed [this][forum] thread on hanami forum.

[hanami]: http://hanamirb.org
[auth]: https://github.com/rack/rack/blob/master/lib/rack/auth/basic.rb
[forum]: https://discuss.hanamirb.org/t/authentication-for-lotus-app/178
