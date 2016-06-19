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

    collectionEvents:
      'change': 'render'

    initialize: ->
      super
      console.log 'construct'
      counter = 1
      inter = setInterval =>
        console.log 'timeout'
        if counter < 5
          counter++
          @collection.add
            name: "added #{Math.random().toFixed(4)}"
          console.log @collection.length
        else
          clearInterval inter
       , 1500

    ui: ->
      grid: '.grid-layout'

    onShow: ->
      @ui.grid.gridster
        widget_selector: '.widget-wrapper'
        widget_base_dimensions: [42, 42]
        widget_margins: [0, 0]
        draggable:
          enabled: true
          handle: '.drag-handle'
          start: => @ui.grid.addClass('active')
          stop: => @ui.grid.removeClass('active')
        resize:
          enabled: true
          start: => @ui.grid.addClass('active')
          stop: => @ui.grid.removeClass('active')
      @gridster = @ui.grid.data('gridster')
      console.log 'show'

    attachHtml: (collectionView, childView, index) ->
      super
      @gridster.add_widget(childView.$el) if @gridster?

    removeChildView: (childView) ->
      @gridster.remove_widget(childView.$el) if @gridster?
      super