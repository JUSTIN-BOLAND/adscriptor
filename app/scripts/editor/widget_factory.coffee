define [
  './views/menu_bar'
], (
  MenuBar
) ->
  class WidgetFactory
    @_createInstance: (construct, args) ->
      new (Function::bind.apply(construct, args))()

    @_getClassForType: (type) ->
      switch type
        when undefined, 'menubar' then MenuBar
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
      collapsed: false

    @create: (widgetType, params) ->
      # Instanciates the given Widget Type with the given parameters
      @_createInstance @_getClassForType(widgetType), params

    @getAttributesFor: (widgetType) ->
      # Creates an attribute set for the specified widget type
      _.extend {}, @_defaultAttributes, _.result(@_getClassForType(widgetType), 'defaultAttributes', {}), type: widgetType