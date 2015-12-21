---
layout: post
title: "Build simple JSON API with lotus framework. Part 1."
description: "В этом посте мы сделаем простой JSON API используя лотус и разберемся с основными идеями фреймворка."
tags:
  - ruby
  - JSON API
  - lotus
---

tl;dr: https://github.com/davydovanton/server-monitoring

В серии статей мы познакомимся с вами с замечательным фреймворком lotus.
In a series of articles, we will get acquainted with a lotus framework.

Для начала, в этой статье мы напишем простое JSON API приложение, которое будет отдавать нам значение расходуемой лотусом памяти.
in the first part we will write simple JSON API application which returns how many memory lotus server is used.

Сразу оговорюсь у нас не будет моделей, только один экшен и тесты.
Just make a reservation we will not have models, only one action and tests.

## Why lotus?
Лотус - минималистичный, модульный веб фреймвор, похожий на рельсу, но со свежим взглядом на некоторые вещи.
Lotus is monomalistic, modulus web framework similar to the rails but with a fresh look at something things.

Да и всегда интересно попробовать что-то новое.
and for me it is always interesting to try something new.

Больше информации - по ссылке: http://lotusrb.org.
More information on this link: http://lotusrb.org.

## Create application
https://github.com/davydovanton/server-monitoring/commit/6d4126127664ba2cec704aa2c36c5ae42d7f540d

Для начала нам нужно инициализировать наше приложение.
Firstly we need to initialize our application.

Для этого выполняем `lotus new server-monitoring --application=api`.
Call `lotus new server-monitoring --application=api` command for this.

Лотус поддерживает несколько приложений (http://lotusrb.org/guides/architectures/application/), поэтому их надо различать.
Lotus provide simular applications in one repository (http://lotusrb.org/guides/architectures/application/), therefore it is necessary to specify a specific name for each application.

Для этого используем опцию `--application`.
For this we use `--application` option.

После чего переходим в папку `server-monitoring` и выполняем комманду `bundle`.
After that we need to move to `server-monitoring` folder and call `bundle` command.

Для того, что бы убедиться, что все работает - запускаем тесты (дефолтная комманда `rake`) и видим пустоту.
So we need to make sure that everything is working. For this run tests (by default - `rake` command ).

_**Примечание:** если вы хотите использовать rspec, то при инициализации приложения, укажите опцию `--test=rspec`._
_**Note:** if you want to use rspec you need to write `--test=rspec` option in application initializer command._

## Create empty action
https://github.com/davydovanton/server-monitoring/commit/843b189af8cea42b04823bc6fc3e67c44ee9cf82

Для начала удалим все ненужные файлы.
Firstly we need to remove all unnecessary files and folders.

Для этого удалим папки `apps/api/views` и `apps/api/templates`.
Remove `apps/api/views` and `apps/api/templates` folders for this.

https://github.com/davydovanton/server-monitoring/commit/066e374496cfe7a10780e7bc4001c1228a36e5e3

Следующий шаг - настроить конфигурационный файл для нашего API приложения.
Next step - configure a config file for our API application.

Для этого ставим основную DB - память, а в настройках приложения ставим опции для json запростов и ответов.
For this we need to set primary DB is memory and json request and responce in application file.
``` ruby
# database file
...

# apps/api/application.rb
...
```

https://github.com/davydovanton/server-monitoring/commit/346f0245ee642b171b6d0dfca54ac94ec87b023a

Пускай наш главный экшен будет такого вида: `Statistic#index`
Let's call main action is `Statistic#index`

Для того, что бы быстро создать экшен, нам нужно набрать следующую комманду в консоли: `lotus generate action api 'statistics#index'` (это создаст нам нужные файлы, добавит тесы и пропишет роуты)

Теперь опять удаляем не нужные файлы.
Now we can delete unnecessary files.

Запускаем тесты и видим, что наш экшен успешно добавился:
Run test and see that all tests passed:
```
server-monitoring(master) » rake
Run options: --seed 12711

# Running:

.

Finished in 0.001416s, 706.1155 runs/s, 706.1155 assertions/s.

1 runs, 1 assertions, 0 failures, 0 errors, 0 skips
```

## Add logic
https://github.com/davydovanton/server-monitoring/commit/67b195092a4df46fa75e6641161942bcee9b872c

Теперь, когда у нас есть простой экшен, добавим логики.
Для этого сделаем простой хеш, с единственным ключом `memory_usage`, который будет содержать количество используемой сервером памяти (в килобайтах).

А так как мы живем в мире ТДД и БДД - добавляем тесты для нашего будущего экшена.
``` ruby
# server-monitoring/spec/api/controllers/statistics/index_spec.rb

describe Api::Controllers::Statistics::Index do
  let(:action) { Api::Controllers::Statistics::Index.new }
  let(:params) { Hash[] }

  # ...

  it 'returns hash with memory usage value' do
    json = JSON.parse(action.call(params).last[0])
    wont_be_nil json['memory_usage']
  end
end
```

Тест красный:
```
server-monitoring(master) » rake
(in /Users/anton/work/projects/server-monitoring)
Run options: --seed 59162

# Running:

E.

Finished in 0.001637s, 1221.6680 runs/s, 610.8340 assertions/s.

  1) Error:
Api::Controllers::Statistics::Index#test_0002_returns hash with memory usage value:
TypeError: no implicit conversion of nil into String
    /Users/anton/.rvm/rubies/ruby-2.2.2/lib/ruby/2.2.0/json/common.rb:155:in `initialize'
    /Users/anton/.rvm/rubies/ruby-2.2.2/lib/ruby/2.2.0/json/common.rb:155:in `new'
    /Users/anton/.rvm/rubies/ruby-2.2.2/lib/ruby/2.2.0/json/common.rb:155:in `parse'
    server-monitoring/spec/api/controllers/statistics/index_spec.rb:14:in `block (2 levels) in <top (required)>'

2 runs, 1 assertions, 0 failures, 1 errors, 0 skips
rake aborted!
Command failed with status (1): [ruby -I"lib:spec"  "/Users/anton/.rvm/rubies/ruby-2.2.2/lib/ruby/2.2.0/rake/rake_test_loader.rb" "spec/**/*_spec.rb" ]
/Users/anton/.rvm/gems/ruby-2.2.2/bin/ruby_executable_hooks:15:in `eval'
/Users/anton/.rvm/gems/ruby-2.2.2/bin/ruby_executable_hooks:15:in `<main>'
Tasks: TOP => default => test
(See full trace by running task with --trace)
```

Напишем немного кода:
``` ruby
# apps/api/config/controllers/statistics/index.rb

module Api::Controllers::Statistics
  class Index
    include Api::Action
    accept :json

    def call(params)
      self.body = JSON.dump({ memory_usage: true })
    end
  end
end
```

После такого кода наши тесты зеленые:
```
server-monitoring(master*) » rake
Run options: --seed 14540

# Running:

..

Finished in 0.001689s, 1184.3577 runs/s, 1184.3577 assertions/s.

2 runs, 2 assertions, 0 failures, 0 errors, 0 skips
```

https://github.com/davydovanton/server-monitoring/commit/dad6fc3a2838dae5f6e098d42317ad4a922b69b6

Усложним требования и начнем возвращать реальные данные. Обновляем наш тест:
``` ruby
# spec/api/controllers/statistics/index_spec.rb

describe Api::Controllers::Statistics::Index do
  let(:action) { Api::Controllers::Statistics::Index.new }
  let(:params) { Hash[] }

  # ...

  it 'returns hash with memory usage value' do
    json = JSON.parse(action.call(params).last[0])
    wont_be_nil json['memory_usage']
    assert_kind_of Numeric, json['memory_usage']
  end
end
```

Тест красный. Опять обновляем код экшена (код для определения используемой памяти я нагло взял [тут](http://stackoverflow.com/a/7863068)):
``` ruby
# apps/api/config/controllers/statistics/index.rb

module Api::Controllers::Statistics
  class Index
    # ...

    def call(params)
      self.body = JSON.dump(memory_usage: memory_usage)
    end

    def memory_usage
      `ps ax -o pid,rss | grep -E "^[[:space:]]*#{$$}"`.strip.split.last.to_i
    end
  end
end
```

Тесты зеленые:
```
server-monitoring(master*) » rake
Run options: --seed 31982

# Running:

..

Finished in 0.033644s, 59.4459 runs/s, 89.1689 assertions/s.

2 runs, 3 assertions, 0 failures, 0 errors, 0 skips
```

https://github.com/davydovanton/server-monitoring/commit/bf50ca8e4ce7a2c144e5cbb77165cbbdd0d25d52

Как вы могли заметить - экшен в лотусе это своеобразный сервис объект, функциональность которого мы проверяли.
Давайте теперь добавим более "живых" тестов и сделаем request test:
``` ruby
# spec/api/request/statistic_index_spec.rb
require 'spec_helper'

describe 'API files' do
  include Rack::Test::Methods

  # app is required by Rack::Test
  def app
    Lotus::Container.new
  end

  describe 'POST convert_to_images' do
    it "is successful" do
      get '/statistics', "CONTENT_TYPE" => 'application/json'
      last_response.must_be :ok?
    end
  end
end
```

Зеленый цвет тестов позволяет нам двигаться дальше.

## Working with server

Запустим наш сервер и убедимся, что все работает как надо.
Серевер запускаем с помощью команды `lotus server`.
Используемый лотусом порт - `2300`.
Делаем простой curl запрос на `http://localhost:2300/statistics`:
```
server-monitoring(master) » curl -k -H "Content-Type: application/json" -X GET http://localhost:2300/statistics
{"memory_usage":65072}%
```

Поздравляю, мы сделали наш первый JSON API на лотусе!

_крутой гифон с крутой работой_

## Display in megabits
https://github.com/davydovanton/server-monitoring/commit/53b28688b64565948226adfcaa0741361a4e1203

Как мне кажется, значение в килобитах не очень информотивно, поэтому давайте добавим опцию `units_of_measurement` в которую мы будем передавать значение в мегабайтах или килобайтах.

Как всегда, тесты первые:
``` ruby
# spec/api/controllers/statistics/index_spec.rb

describe Api::Controllers::Statistics::Index do
  # ...

  describe 'when units_of_measurement is mbit' do
    it 'returns memory usage value in megabits' do
      memory_usage = JSON.parse(action.call(params).last[0])['memory_usage']
      params.merge!(units_of_measurement: 'mbit')
      new_memory_usage = JSON.parse(action.call(params).last[0])['memory_usage']

      assert_equal memory_usage / 1024.0, new_memory_usage
    end
  end
end
```

Запускаем тесты, они красные.

А теперь добавляем реализацию для нашего нового функционала.
Для начала, нам надо добавить разрешенный параметр, делается это в блоке `params`.
После этого добавляем метод для конвертации данных в нужную единицу измерения
``` ruby
module Api::Controllers::Statistics
  class Index
    include Api::Action
    accept :json

    params do
      param :units_of_measurement, type: String
    end

    def call(params)
      memory_usage_value = convert_to_measurement(memory_usage, params[:units_of_measurement])
      self.body = JSON.dump(memory_usage: memory_usage_value)
    end

    def convert_to_measurement(value, measurement)
      if measurement == 'mbit'
        value / 1024.0
      else
        value
      end
    end
  end
end
```

Запускаем тесты. Ура, все проходит!

## Conclusion
Сегодня мы познакомились с первой частью лотуса - с контроллерами.

На данный момент мы имеем простейший JSON API с одним экшеном, который отдает нам всего один параметр.
Как вы могли заметить, использование сервес объектов в экшенах - очень интересный ход, который позволяет держать всю логику в одном месте.
К тому же, нам не пришлось переносить всю логику в модель, как это популярно в rails.

В следующих частях мы поговорим про авторизацию пользователей, а так же сделаем простую админку для управления пользователями.
А после - зальем наше приложение на хероку.
