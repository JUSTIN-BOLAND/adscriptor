define [
  'backbone.marionette'
  'configuration'
  './templates/layout'
], (
  Marionette
  Configuration
  template
) ->
  class AppLayout extends Marionette.LayoutView
    el: 'body'
    template: template

    themes: [
      'solarized'
      'white'
    ]

    regions: ->
      layout: '.layout'
      overlay: '.overlay'

    onRender: ->
      @setTheme Configuration.get('theme') or @themes[0]

    setTheme: (newTheme) ->
      if newTheme in @themes
        @$el.removeClass(_.map(@themes, (theme) -> "theme-#{theme}").join(' ')).addClass("theme-#{newTheme}")
        Configuration.save theme: newTheme
      else
        throw new Error("Can't set theme: Unknown Theme Name \"#{newTheme}\".")