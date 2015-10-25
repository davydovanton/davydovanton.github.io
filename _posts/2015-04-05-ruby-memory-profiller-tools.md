---
layout: post
title: "Memory profiler tools for ruby"
description: "How to profile you ruby code"
---

Memory profiler tools for ruby It so happened that I was need know how much ruby objects created
for each call sidekiq `perform_async` method
([mperham/sidekiq#2288](https://github.com/mperham/sidekiq/pull/2288)).
That’s why I decided to create list with tools which helps you to know all required information.

## 1. Ruby GC
Sam Saffron has written great post, in which he talk about ruby garbage collector and wonderful
`GC.start` method which returns data hash:

{% highlight ruby %}
2.2.0:001 > GC.stat
# => {:count=>21, :heap_allocated_pages=>236, :heap_sorted_length=>237, :heap_allocatable_pages=>0, :heap_available_slots=>96193, :heap_live_slots=>95354, … }
{% endhighlight %}

Also author mentions a `ObjectSpace` module that lets you know information about object/memory management.
For example you can easily know general number of created objects. For this you need write this code:

{% highlight ruby %}
2.2.0:002 > ObjectSpace.count_objects[:TOTAL]
# => 96193
{% endhighlight %}

## 2. Ruby Memory Profiler
Also Sam wrote great tool ([ruby-memory-profiler](https://github.com/SamSaffron/memory_profiler)) which provide
easily display all required information for any code in block. For this you will need call something like
this (I called this code in my sidekiq reduce allocation PR):

{% highlight ruby %}
MemoryProfiler.report{ 100.times{ HardWorker.perform_async } }.pretty_print
{% endhighlight %}

## 3. ruby-prof
General features:

* display [different](https://github.com/ruby-prof/ruby-prof#reports) reports;
* fast;
* easily profiles rails apps;

How to use:

{% highlight ruby %}
require 'ruby-prof'

# Profile the code
RubyProf.start
# [code to profile]
RubyProf.pause
# [other code]
RubyProf.resume
# [code to profile]
result = RubyProf.stop
{% endhighlight %}

## Conclusions
Profiling Ruby isn’t as difficult as it seems at first glance. There are a lot of great
libraries. The only thing I was missing — profiling the code from a file, but I’m sure it will soon add
(maybe it will add myself ☺ ).
