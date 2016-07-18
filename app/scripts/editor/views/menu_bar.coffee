define [
  'backbone.marionette'
  'logger'
  './templates/menu_bar'
], (
  Marionette
  Logger
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
    className: 'wrapper'

    initialize: (options) ->
      super
      @editor = options.editor

    events: ->
      'click .menu-action': 'onMenuAction'
      'focus .btn.dropdown-toggle': 'onFocus'

    onMenuAction: (e) ->
      e.preventDefault()
      category = $(e.target).data('menuCategory')
      value = $(e.target).data('menuValue')
      switch category
        when 'layout' then @_changeLayout value
        when 'theme' then @_changeTheme value
        when 'addwindow' then @_addWindow value
        else Logger.raiseError "Unknown Menu Action \"#{category}\" with parameter \"#{value}\"."

    onFocus: (e) ->
      widget = @$el.closest('.widget-menubar')
      widget.siblings('.widget-menubar').css('z-index', '')
      widget.css('z-index', 8)

    _changeLayout: (newLayout) ->
      @editor.layoutManager.applyLayout newLayout

    _changeTheme: (newTheme) ->
      requireJS ['app'], (App) ->
        App.layout.setTheme newTheme

    _addWindow: (windowType) ->
      requireJS ['editor/widget_factory'], (WidgetFactory) =>
        attrs = WidgetFactory.getAttributesFor windowType
        attrs.y = 10000 # Forces the new Window to the bottom
        @editor.collection.create attrs
