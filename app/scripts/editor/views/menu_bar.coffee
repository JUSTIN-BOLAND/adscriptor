define [
  'backbone.marionette'
  './templates/menu_bar'
], (
  Marionette
  template
) ->
  class MenuBar extends Marionette.ItemView
    @defaultAttributes:
      # Default Widget Attributes for a MenuBar
      name: 'AdScriptor v2.0.1'
      height: 2
      width: 8
      minWidth: 8
      minHeight: 2
    template: template