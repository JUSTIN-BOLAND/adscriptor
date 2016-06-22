define [
  'backbone.marionette'
  '../widget_factory'
  './templates/widget_item'
], (
  Marionette
  WidgetFactory
  template
) ->
  class WidgetItem extends Marionette.LayoutView
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
      'data-min-sizex': @model.get('minWidth')
      'data-min-sizey': @model.get('minHeight')
    regions: ->
      content: '.content'
    ui: ->
      minimizeBtn: '.minimize-btn'
      minimizeBtnContainer: '.minimize-btn-container'
      content: '.content'
    events: ->
      'click @ui.minimizeBtnContainer': -> @toggleWidget()
      'click .close-btn': 'hideWidget'

    onGridChange: (widget) ->
      if @model.get 'collapsed'
        if widget.height > 1
          @model.save widget
          @toggleWidget false
        else
          widget.height = @model.get 'height'
          @model.save widget
      else
        if widget.height == 1
          widget.height = @model.get 'height'
          @model.save widget
          @toggleWidget false
        else
          @model.save widget

    onRender: ->
      @$el.data('view', this)
      # Add Widget-Specific Classes to allow custom styling for widgets
      @$el.addClass("widget-#{@model.get('type')}")
      @ui.content.addClass("content-#{@model.get('type')}")
      @content.show WidgetFactory.create @model.get('type'), [@model]

    toggleWidget: (resize = true) ->
      if @model.get 'collapsed'
        @model.save collapsed: false
        @ui.content.css 'overflow', 'hidden'
        @ui.content.fadeIn => @ui.content.css 'overflow', ''
        @editor.gridster.resize_widget @$el, @model.get('width'), @model.get('height') if resize
        @ui.minimizeBtn.addClass 'expanded'
        @ui.minimizeBtnContainer.attr 'title', 'Collapse'
      else
        @model.save collapsed: true
        @ui.content.css 'overflow', 'hidden'
        @ui.content.fadeOut => @ui.content.css 'overflow', ''
        @editor.gridster.resize_widget @$el, @model.get('width'), 1 if resize
        @ui.minimizeBtn.removeClass 'expanded'
        @ui.minimizeBtnContainer.attr 'title', 'Expand'

    hideWidget: ->
      @$el.css('opacity', 0)
      setTimeout =>
        console.log 'timeout'
        @model.destroy()
      , 100
