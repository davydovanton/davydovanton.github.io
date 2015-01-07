---
layout: post
title: "IRB и все все все"
tags:
  - ruby
  - irb
---

Думаю, каждый, кто так или иначе связан с Ruby и тем более с Rails, хоть раз в жизни использовал irb. Возможности интерактивного ruby шела безграничны, поэтому сегодня я бы хотел поговорить об улучшении или кастомизации, если вам так угодно, вашего irb. 

<!--more-->

Но для начала давайте посмотрим документацию, а именно откроем модуль [IRB](http://www.ruby-doc.org/stdlib-2.0/libdoc/irb/rdoc/IRB.html) в стандартной библиотеке ruby.
"Что интересного тут есть?", спросите вы? Думаю стоит начать с самого начала, с запуска. Если вы просто наберете в консоли `irb`, то запустите шел с вашей текущей версией руби. Но  если у вас RVM(хотя, сказать по правде я не уверен, что это работает только с RVM), то вы можете выбрать среду для запуска из всех тех, что у вас установлены. Например вот так, я, при активном MRI 2.0, могу запустить у себя jruby:

![jruby in irb]({{ site.url }}/images/2014/02/irb-and-all-all-all/jruby-irb.png)

Дальше, думаю, следует обсудить ключи. Их много, они разные. В документации они все [есть](http://www.ruby-doc.org/stdlib-2.0/libdoc/irb/rdoc/IRB.html#module-IRB-label-Command+line+options). Самые интересные, на мой взляд, - `-d` включающий дебаг мод(аналогично `ruby -d`) и ключ `-I path`, загружающий указанную директорию.

Ну а теперь самое интересное: поговорим о конфигурации вашего irb. Для этого необходимо создать `*rc` аналогичный `.bashrc` или `.vimrc`. Существует несколько разновидностей именования этого файла, например: `.irbrc`, `irb.rc`, `_irbrc` или же `$irbrc`. 

Думаю, для начала, следует указать конфигурационные значения, например, увеличить количество сохраняемых команд и записывать их в отдельный файл:

{% highlight ruby %}
IRB.conf[:SAVE_HISTORY] = 1000
IRB.conf[:HISTORY_FILE] = "#{ENV['HOME']}/.irb_history"
{% endhighlight %}

Так же можно указать кучу других настроек, но я бы не стал писать эту статью, если бы хотел рассказать только это. Все веселье начинается тогда, когда приходит понимание того, что данный файл является обычным `*.rb` файлом, который загружается при старте вашего irb. 

Думаю, все догадались, что дальше будет? :)

Предлагаю написать, ради развлечения, метод, который возвращал бы все локальные методы объекта. Выглядеть он будет примерно так:

{% highlight ruby %}
# .irbrc
class Object
  def local_methods
    (methods - Object.instance_methods).sort
  end
end
{% endhighlight %}

Как он будет работать, спросите вы? Да все просто, берете объект и вызываете на нем данный метод:

![Using local_mathods method in irb]({{ site.url }}/images/2014/02/irb-and-all-all-all/irb_local_methods.png)

Думаю, вы заметили цвета, которых не хватает в дефолтном irb? 

Да, все верно, так же можно подключать гемы, и да, есть гемы, которые добавляют ярких цветов в ваш irb, например, [wirble](https://github.com/blackwinter/wirble). Достаточно написать такой код: 

{% highlight ruby %}
require 'rubygems'
require 'wirble'

Wirble.init
Wirble.colorize
{% endhighlight %}

И ваш интерактивный шел заиграет новыми красками :)

А если вам нравится [pry](http://pryrepl.org/), то вам никто не запрещает его добавить, в последующем вызывая его, просто набрав `pry` во время irb сессии:
{% highlight ruby %}
#.irbrc
require 'pry'

# irb
2.0.0p247 :015 > pry
[1] pry(main)> 
{% endhighlight %}

Ну а выглядеть это будет как-то так:
![Using pry in irb]({{ site.url }}/images/2014/02/irb-and-all-all-all/pry.gif)

Но самое полезное, что можно сделать, это забыть построчный ввод кода. "Как?", спросите вы? Начну издалека: мне очень нравится vim :) Поэтому, смотря vimcasts-ы, я узнал то, что перевернуло мой мир, а именно: любой текстовый редактор можно [вызывать](http://vimcasts.org/episodes/running-vim-within-irb/) прямо из irb. 

Делается это очень просто: нужно добавить гем `interactive_editor`. Данный гем позволяет вызывать любой текстовый редактор из вашего irb, например, набрав `vim` - откроется vim, где вы сможете набрать любой код, который выполнится после сохранения файла и закрытия редактора. 

![Using vim in irb]({{ site.url }}/images/2014/02/irb-and-all-all-all/vim-in-irb.gif)

Собственно то же самое будет работать с sublime, textmate, emacs и [дургими](https://github.com/jberkel/interactive_editor/blob/master/lib/interactive_editor.rb#L92) текстовыми редакторами. 

Ну и на последок стоит рассказать про сессии в irb. Если вы используете vim или когда то использовали его, то вам знакомо такое понятие как буфер, которое чем-то похоже на сессии в irb. Ну а если нет, то краткая справка: сессия - некий сеанс интерактивного шела. Для того, что бы посмотреть список всех сессий в irb, достаточно набрать `jobs`:

{% highlight ruby %}
2.0.0p247 :012 > jobs
 => #0->irb on main (#<Thread:0x007fcb810bcda0>: running) 
{% endhighlight %}

Ну а если вам надо создать новую сессию, то просто наберите `irb`:

{% highlight ruby %}
2.0.0p247 :013 > irb
2.0.0p247 :001 > jobs
 => #0->irb on main (#<Thread:0x007fcb810bcda0>: stop)
#1->irb#1 on main (#<Thread:0x007fcb819b7bf8>: running) 
{% endhighlight %}

Как видите, irb создал новую сессию и переключился в нее. Но что делать, когда вы хотите удалить или изменить сессию? Для этого есть методы `kill <number_session>` и `fg <number_session>` соответственно:

{% highlight ruby %}
2.0.0p247 :002 > jobs
 => #0->irb on main (#<Thread:0x007fcb810bcda0>: stop)
#1->irb#1 on main (#<Thread:0x007fcb819b7bf8>: stop)
#2->irb#2 on main (#<Thread:0x007fcb81319238>: running) 
2.0.0p247 :003 > fg 1
 => #<IRB::Irb: @context=#<IRB::Context:0x007fcb819b7a40>, @signal_status=:IN_EVAL, @scanner=#<RubyLex:0x007fcb819b74c8>> 
2.0.0p247 :009 > jobs
 => #0->irb on main (#<Thread:0x007fcb810bcda0>: stop)
#1->irb#1 on main (#<Thread:0x007fcb819b7bf8>: running)
#2->irb#2 on main (#<Thread:0x007fcb81319238>: stop) 
2.0.0p247 :010 > kill 2
 => [2] 
2.0.0p247 :011 > jobs
 => #0->irb on main (#<Thread:0x007fcb810bcda0>: stop)
#1->irb#1 on main (#<Thread:0x007fcb819b7bf8>: running) 
2.0.0p247 :012 > kill 1
 => #<IRB::Irb: @context=#<IRB::Context:0x007fcb8185b2c8>, @signal_status=:IN_EVAL, @scanner=#<RubyLex:0x007fcb8110d5e8>> 
2.0.0p247 :014 > jobs
 => #0->irb on main (#<Thread:0x007fcb810bcda0>: running) 
{% endhighlight %}
