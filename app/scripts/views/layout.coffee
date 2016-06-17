define [
  'backbone.marionette'
  './templates/layout'
], (
  Marionette
  template
) ->
  class AppLayout extends Marionette.LayoutView
    el: 'body'
    template: template

    regions: ->
      content: '.content'
      overlay: '.overlay'