---
layout: post
title: "Preview hanami emails in browser"
description: "In this post we'll add preview logic to your emails"
tags:
  - ruby
  - hanami
  - mail
---

Sometimes you need to preview your emails in development enviroment. 
For this you can use use [letter_opener][letter_opener-gem] gem.
Because hanami uses [mail][mail-gem] gem, `letter_opener` integration will be easy.
Firstly you need add gem to your Gemfile:

{% highlight ruby %}
gem "letter_opener", group: :development
{% endhighlight %}

Secondly you need add new delivery method to your `lib/repository_name.rb` file:

{% highlight ruby %}
require "letter_opener"
Hanami::Mailer.configure do
  delivery do
    development LetterOpener::DeliveryMethod, location: Hanami.root.join('tmp/letter_opener')
  end
end.load!
{% endhighlight %}

After that when you deliver your email, `letter_opener` will generate html files that users will see in `tmp/letter_opener` directory.

[mail-gem]: https://github.com/mikel/mail
[letter_opener-gem]: https://github.com/ryanb/letter_opener
