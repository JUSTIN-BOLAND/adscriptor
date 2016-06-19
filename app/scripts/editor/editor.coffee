define [
  'backbone'
  'backbone.marionette'
  'gridster'
  './views/widget'
  './views/templates/layout'
], (
  Backbone
  Marionette
  Gridster
  Widget
  template
) ->
  class EditorGrid extends Marionette.CompositeView
    template: template
    childView: Widget
    childViewContainer: '.grid-layout'
    className: 'editor-grid gridster'

    initialize: ->
      @collection = new Backbone.Collection([
          name: 'foo bar the allmighty'
          position:
            x: 1
            y: 1
            width: 3
            height: 2
            collapsed: true
        ,
          name: 'bar foo baz this is fun'
          position:
            x: 4
            y: 1
            width: 3
            height: 5
            collapsed: false
        ])
      super

    collectionEvents:
      'change': 'render'
    ui: ->
      grid: '.grid-layout'

    buildChildView: (item, ItemView) ->
      console.log 'build'
      new ItemView
        model: item
        editor: this

    onShow: ->
      @ui.grid.gridster
        widget_selector: '.widget-wrapper'
        widget_base_dimensions: [42, 42]
        widget_margins: [0, 0]
        draggable:
          enabled: true
          handle: '.drag-handle'
          start: => @ui.grid.addClass('active')
          stop: =>
            @ui.grid.removeClass('active')
            @gridster.serialize()
        resize:
          enabled: true
          start: => @ui.grid.addClass('active')
          stop: =>
            @ui.grid.removeClass('active')
            @gridster.serialize()
        serialize_params: (elem, widget) =>
          elem.data('view')?.trigger 'gridster:change',
            x: widget.col
            y: widget.row
            width: widget.size_x
            height: widget.size_y
      @gridster = @ui.grid.data('gridster')

    attachHtml: (collectionView, childView, index) ->
      super
      @gridster.add_widget(childView.$el) if @gridster?

    removeChildView: (childView) ->
      @gridster.remove_widget(childView.$el) if @gridster?
      super