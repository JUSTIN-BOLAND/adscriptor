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

    initialize: (options) ->
      super
      @editor = options.editor

    events: ->
      'click .menu-action': 'onMenuAction'

    onMenuAction: (e) ->
      e.preventDefault()
      category = $(e.target).data('menuCategory')
      value = $(e.target).data('menuValue')
      switch category
        when 'layout' then @_changeLayout value
        when 'addwindow' then @_addWindow value

    _changeLayout: (newLayout) ->
      @editor.layoutManager.applyLayout(newLayout)

    _addWindow: (windowType) ->
      requireJS ['editor/widget_factory'], (WidgetFactory) =>
        attrs = WidgetFactory.getAttributesFor windowType
        attrs.y = 10000 # Forces the new Window to the bottom
        @editor.collection.create attrs
