---
layout: post
title: "Ignore file lines in git"
description: "In this post we'll use git to ignore special lines in file"
tags:
  - tips
  - git
---

For example, you have this code and you want to ignore in git lines which contain `username` and `password` values:
{% highlight ruby %}
def ssh_connect
  username = "root" # ignore this line
  password = "password" # ignore this line too
  ip = "192.168.1.1"
  # ...
end
{% endhighlight %}

To ignore some special lines in git you need to:

1. Create a `.gitattributes` in your repository (remember that `.gitattributes` will be commited into the repository, if you don’t want that, add it to `.git/info/attributes`)
2. Add `*.rb filter=ignoreline` (run filter named ignoreline on all `*.rb` files)
3. Now, we need to define ignoreline filter in `.gitconfig`
4. `git config --global filter.ignoreline.clean "sed '/#ignoreline$/'d"` (delete theses lines)
5. `git config --global filter.ignoreline.smudge cat` (do nothing when pulling file from the repository)

And then, you can ignore some lines useing `#ignoreline` comment:
{% highlight ruby %}
def ssh_connect
  username = "root" #ignoreline
  password = "password" #ignoreline
  ip = "192.168.1.1"
  # ...
end
{% endhighlight %}

Happy hacking!
