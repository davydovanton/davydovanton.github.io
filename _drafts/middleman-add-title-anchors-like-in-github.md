# Adding github anchors to your middleman or jekyll project

## Middleman
First: we need to create a new renderer class. In this class we'll
put `<a>` tag inside `<h>` tag. Also, we'll realize anchor svg in
guthub style:

```ruby
require 'middleman-core/renderers/redcarpet'

class GithubStyleTitles < Middleman::Renderers::MiddlemanRedcarpetHTML
  def header(title, level)
    @headers ||= []
    permalink = title.gsub(/\W+/, '-')

    if @headers.include? permalink
      permalink += '_1'
      permalink = permalink.succ while @headers.include? permalink
    end
    @headers << permalink

    %(
      <h#{level} id=\"#{permalink}\"><a name="#{permalink}" class="anchor" href="##{permalink}"></a>#{title}</h#{level}>
    )
  end

private

  def anchor_svg
     <<-eos
       <svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewBox="0 0 16 16" width="16">
       <path d="M4 9h1v1h-1c-1.5 0-3-1.69-3-3.5s1.55-3.5 3-3.5h4c1.45 0 3 1.69 3 3.5 0 1.41-0.91 2.72-2 3.25v-1.16c0.58-0.45 1-1.27 1-2.09 0-1.28-1.02-2.5-2-2.5H4c-0.98 0-2 1.22-2 2.5s1 2.5 2 2.5z m9-3h-1v1h1c1 0 2 1.22 2 2.5s-1.02 2.5-2 2.5H9c-0.98 0-2-1.22-2-2.5 0-0.83 0.42-1.64 1-2.09v-1.16c-1.09 0.53-2 1.84-2 3.25 0 1.81 1.55 3.5 3 3.5h4c1.45 0 3-1.69 3-3.5s-1.5-3.5-3-3.5z"></path>
       </svg>
     eos
  end
end
```

After that we need to call our renderer in `:markdown` configuration:

``` ruby
set :markdown, fenced_code_blocks: true, smartypants: true, renderer: GithubStyleTitles
```

And the last step: we need to stylize our anchor with css:

```css
.docs-content .anchor {
  padding-right: 2px;
  margin-left: -18px;
  display: none;
}
.docs-content h1:hover .anchor,
.docs-content h2:hover .anchor,
.docs-content h3:hover .anchor,
.docs-content h4:hover .anchor,
.docs-content h5:hover .anchor,
.docs-content h6:hover .anchor {
  display: inline-block;
}
```

After all this steps we'll get something like this:
gif

## Jekyll

I hope it will be useful to you  as well as for me at one time.

Happy hacking!

## References
- https://github.com/circleci/circleci-docs/pull/97
- https://george-hawkins.github.io/basic-gfm-jekyll/redcarpet-extensions.html
- http://blog.honeybadger.io/automatically-generating-subnavigation-from-headings-in-jekyll/
