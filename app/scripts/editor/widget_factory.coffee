define [
  './views/menu_bar'
  './views/log_view'
], (
  MenuBar
  LogView
) ->
  class WidgetFactory
    @_getClassForType: (type) ->
      switch type
        when undefined, 'menubar' then MenuBar
        when 'log-view' then LogView
        else throw new Error("Unknown Widget Type: #{widgetType}")

    @_defaultAttributes:
      # Default Attribute Values for all Widgets
      name: 'Widget'
      x: 1
      y: 1
      height: 1
      width: 1
      minWidth: 1
      minHeight: 1
      maxWidth: null
      maxHeight: null
      collapsed: false

    @create: (widgetType, options) ->
      # Instanciates the given Widget Type with the given parameters
      cls = @_getClassForType(widgetType)
      new cls(options)

    @getAttributesFor: (widgetType) ->
      # Creates an attribute set for the specified widget type
      _.extend {}, @_defaultAttributes, _.result(@_getClassForType(widgetType), 'defaultAttributes', {}), type: widgetType