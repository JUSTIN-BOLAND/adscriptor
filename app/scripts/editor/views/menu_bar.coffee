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
      width: 14
      minWidth: 1
      minHeight: 1
    template: template
    className: 'wrapper'