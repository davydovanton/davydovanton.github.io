---
layout: post
title: "Adding domain for your github project"
description: "Simple tip for adding domain for your github project"
tags:
  - github
  - domain
  - tips
---

I have a problem. Each time I want add domain to my custom github project
I forgot what I should do exactly. That's why I want to post this SO answer in my blog.
I hope it would helpful not only for me.

To Setup a custom domain for your `gh-pages` project repo that handles
`www.yourdomain.com` and `yourdomain.com` (assumes you already have a `gh-pages`
branch on your repo) you need this:

1. From your project repo, `gh-pages` branch. Create a `CNAME` file with the contents `yourdomain.com`.
2. In your DNS manager, setup two `CNAME` records. One for the root apex (`@`) and one for `www`. Both point to `YOURusername.github.io`. If your DNS provider does **NOT** support `ALIAS` records on the root apex (`@`), simply create `A` records that point to `192.30.252.153` and `192.30.252.154`.


After that wait til your name servers update:

```
dig yourdomain.com +nostats +nocomments +nocmd
```

<br/>

Original link: [stackoverflow.com/a/9123911](http://stackoverflow.com/a/9123911)
