---
layout: post
title: "Кастомная локаль в запросе minitest #get метода"
---

Иногда необходимо, в minitest тестах, сделать запрос, например `get` с определенным списком локалей. Это легко сделать следующим способом:

``` ruby
it 'yout test description' do
  rackenv = {'HTTP_ACCEPT_LANGUAGE' => 'ru,en'}
  get '/', {}, rackenv

  ...
end
```
