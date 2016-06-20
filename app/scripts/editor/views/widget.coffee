define [
  'backbone.marionette'
  './templates/widget'
], (
  Marionette
  template
) ->
  class Widget extends Marionette.LayoutView
    template: template
    className: 'widget-wrapper'

    initialize: (options) ->
      @editor = options.editor
      @listenTo this, 'gridster:change', @onGridChange
      super

    attributes: ->
      'data-sizex':  @model.get('width')
      'data-sizey': if @model.get('collapsed') then 1 else @model.get('height')
      'data-col': @model.get('x')
      'data-row': @model.get('y')
    regions: ->
      content: '.content'
    ui: ->
      minimizeBtn: '.minimize-btn'
      minimizeBtnContainer: '.minimize-btn-container'
    events: ->
      'click @ui.minimizeBtnContainer': -> @toggleWidget()
      'click .close-btn': 'hideWidget'

    onGridChange: (widget) ->
      if @model.get 'collapsed'
        if widget.height > 1
          @model.set widget
          @toggleWidget false
        else
          widget.height = @model.get 'height'
          @model.set widget
      else
        if widget.height == 1
          widget.height = @model.get 'height'
          @model.set widget
          @toggleWidget false
        else
          @model.set widget

    onRender: ->
      @$el.data('view', this)
      #TODO: @content.show

    toggleWidget: (resize = true) ->
      if @model.get 'collapsed'
        @model.set collapsed: false
        @editor.gridster.resize_widget @$el, @model.get('width'), @model.get('height') if resize
        @ui.minimizeBtn.addClass 'expanded'
        @ui.minimizeBtnContainer.attr 'title', 'Collapse'
      else
        @model.set collapsed: true
        @editor.gridster.resize_widget @$el, @model.get('width'), 1 if resize
        @ui.minimizeBtn.removeClass 'expanded'
        @ui.minimizeBtnContainer.attr 'title', 'Expand'

    hideWidget: ->
      @$el.css('opacity', 0)
      setTimeout =>
        console.log 'timeout'
        @model.destroy()
      , 100
