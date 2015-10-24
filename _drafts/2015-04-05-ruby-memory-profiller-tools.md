---
layout: post
title: "Memory profiler tools for ruby"
---

Так получилось, что мне нужно было узнать сколько объектов создает каждый вызов руби метода [mperham/sidekiq#2288](https://github.com/mperham/sidekiq/pull/2288). Поэтому я решил составить список инструментов которые помогут узнать всю необходимую информацию.

<!--more-->

## 1. Стандартный GC
Sam Saffron написал отличный [пост](http://samsaffron.com/archive/2013/11/22/demystifying-the-ruby-gc), в котором рассказывается о GC и замечательном методе `GC.stat` который возвращает хеш со значениями:

```
2.2.0 :001 > GC.stat
=> {:count=>21, :heap_allocated_pages=>236, :heap_sorted_length=>237, :heap_allocatable_pages=>0, :heap_available_slots=>96193, :heap_live_slots=>95354, ... }
```

Так же, автор упоминает о замечательном модуле [`ObjectSpace`](http://ruby-doc.org/core-2.2.0/ObjectSpace.html) который позволяет узнать информацию о object/memory management. Например, вы можете лекго узнать общее число созданных объектов, для этого достаточно вызвать следующий метод:

```
2.2.0 :002 > ObjectSpace.count_objects[:TOTAL]
=> 96193
```

## 2. Ruby Memory Profiler
Так же Sam написал отличную тулзу, [ruby-memory-profiler](https://github.com/SamSaffron/memory_profiler), которая позволяет легко выводить практически всю необходимую информацию для любого блока кода. Например, что бы узнать количество аллокаций при вызове sidekiq метода `perform_async` я писал следующее
``` ruby
MemoryProfiler.report{ 100.times{ HardWorker.perform_async } }.pretty_print
```

## 3. ruby-prof
Основные фишки в поддержке различных [способов](https://github.com/ruby-prof/ruby-prof#reports) вывода отчета, достаточно быстр, легко профилирует rails. Запускается тоже достаточно просто:

```
require 'ruby-prof'
# Profile the code
RubyProf.start
[code to profile]
RubyProf.pause
[other code]
RubyProf.resume
[code to profile]
result = RubyProf.stop
```

**Выводы**: Профилировать руби не так сложно, как кажется на первый взгляд. Есть множество великолепных библиотек. Единственное, чего не хватает мне - профилирование кода из файла, но я уверен, что это скоро добавят (возможно это добавлю я сам :) ).
