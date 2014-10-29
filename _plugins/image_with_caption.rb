module Jekyll
  module Tags
    # Simple jekyll plugin for create a html figure construction.
    # About figure:
    #   https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figure
    #
    # The figure tag should take this form:
    #
    #   {% image_with_caption you_image_url %}
    #     This is caption block. This should be parsed as *markdown* [man](http://example.com/). Or not :)
    #   {% endimage_with_caption %}
    #
    # After that you will get html like as:
    #
    #   <figure class="figure">
    #     <a class="figure__image-link" href="url">
    #       <img class="figure__image" src="url" alt="This is caption block. This should be parsed as markdown man. Or not :)">
    #     </a>
    #     <figcaption class="figure__figcaption">    
    #       <p>
    #         This is caption block. This should be parsed as <em>markdown</em> <a href="http://example.com/">man</a>.
    #       </p>
    #     </figcaption>
    #   </figure>
    #
    # Author: Anton Davydov
    # twitter: @anton_davydov
    #
    class ImageWithCaption < Liquid::Block

      CaptionUrl = /(\S[\S\s]*)\s+(https?:\/\/\S+)\s+(.+)/i
      Caption = /(\S[\S\s]*)/

      def initialize(tag_name, image_url, tokens)
        super
        @image_url = image_url
      end

      def render(context)
        site = context.registers[:site]
        converter = site.getConverterImpl(::Jekyll::Converters::Markdown)
        caption = converter.convert(super(context))

        figure_html_construction caption
      end

    private

      def figure_html_construction(caption = nil)
        "<p></p>"                                                                           +
        "<figure class='figure'>"                                                           +
        "  <a class='figure__image-link' href='#{@image_url}'>"                             +
        "    <img class='figure__image' src='#{@image_url}' alt='#{remove_html(caption)}'>" +
        "  </a>"                                                                            +
        "  <figcaption class='figure__figcaption'>"                                         +
        "    #{caption}"                                                                    +
        "  </figcaption>"                                                                   +
        "</figure>"                                                                         +
        "<p></p>"
      end

      def remove_html(string)
        string.gsub(/(<[^>]*>)|\n|\t/s, ' ')
          .gsub(/\s\s/, '')
          .gsub(/(\A\s)|(\s\z)/, '')
          .gsub(/\s\./, '.')
      end
    end
  end
end

Liquid::Template.register_tag('image_with_caption', Jekyll::Tags::ImageWithCaption)
