---
layout: post
title: "Profiling your SQL querys in hanami (or ROM)"
description: "Profiling your SQL querys in hanami (or ROM)"
tags:
  - ruby
  - hanami
  - sql
---

It just happened I had profile SQL query in [my hanami application][ossboard]. And I want to save this knowledge that's why I created this post.

If you are using [ROM][rom], this post will be helpful for you too, because hanami-module uses ROM. So, in [hanami][hanami], you have a simple ability for profiling your SQL queries.

For that, you need to use some methods for [`Sequel::Dataset`][sequel-dataset] instance.  

Fox example, if you want to get pure sql sting you can use `#sql` method:

{% highlight text %}
>> puts UserRepository.new.users.where(admin: true).dataset.sql
SELECT * FROM "users" WHERE ("admin" IS TRUE) ORDER BY "users"."id"
=> nil
{% endhighlight %}

or if you need to call `ANALYZE` or `EXPLAIN` psql methods you can use similar methods:

{% highlight text %}
>> puts UserRepository.new.users.where(admin: true).dataset.analyze
Sort  (cost=19.38..19.79 rows=165 width=213) (actual time=0.019..0.019 rows=1 loops=1)
  Sort Key: id
  Sort Method: quicksort  Memory: 25kB
  ->  Seq Scan on users  (cost=0.00..13.30 rows=165 width=213) (actual time=0.013..0.014 rows=1 loops=1)
        Filter: (admin IS TRUE)
        Rows Removed by Filter: 1
Planning time: 4.362 ms
Execution time: 0.039 ms
=> nil
{% endhighlight %}

{% highlight text %}
>> puts UserRepository.new.users.where(admin: true).dataset.explain
Sort  (cost=19.38..19.79 rows=165 width=213)
  Sort Key: id
  ->  Seq Scan on users  (cost=0.00..13.30 rows=165 width=213)
        Filter: (admin IS TRUE)
=> nil
{% endhighlight %}

That's all, happy profiling! 🚀

[sequel-dataset]: http://www.rubydoc.info/github/evanfarrar/opensprints/Sequel/Dataset
[rom]: http://rom-rb.org
[hanami]: http://hanamirb.org
[ossboard]: http://www.ossboard.org
[sql-method]: http://www.rubydoc.info/github/evanfarrar/opensprints/Sequel/Dataset#sql-instance_method
