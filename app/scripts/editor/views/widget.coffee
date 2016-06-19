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
      'data-sizex':  @model.get('position').width
      'data-sizey': if @model.get('position').collapsed then 1 else @model.get('position').height
      'data-col': @model.get('position').x
      'data-row': @model.get('position').y
    regions: ->
      content: '.content'
    ui: ->
      minimizeBtn: '.minimize-btn'
      minimizeBtnContainer: '.minimize-btn-container'
    events: ->
      'click @ui.minimizeBtnContainer': -> @toggleWidget()
      'click .close-btn': 'hideWidget'

    onGridChange: (widget) ->
      position = _.extend {}, @model.get('position')
      if position.collapsed
        if widget.height > 1
          @model.set 'position', _.extend(position, widget)
          @toggleWidget(false)
        else
          widget.height = position.height
          @model.set 'position', _.extend(position, widget)
      else
        if widget.height == 1
          widget.height = position.height
          @model.set 'position', _.extend(position, widget)
          @toggleWidget(false)
        else
          @model.set 'position', _.extend(position, widget)

    onRender: ->
      @$el.data('view', this)
      #TODO: @content.show

    toggleWidget: (resize = true) ->
      position = @model.get 'position'
      if position.collapsed
        @model.set 'position', _.extend({}, position, collapsed: false)
        @editor.gridster.resize_widget @$el, position.width, position.height if resize
        @ui.minimizeBtn.addClass 'expanded'
        @ui.minimizeBtnContainer.attr 'title', 'Collapse'
      else
        @model.set 'position', _.extend({}, position, collapsed: true)
        @editor.gridster.resize_widget @$el, position.width, 1 if resize
        @ui.minimizeBtn.removeClass 'expanded'
        @ui.minimizeBtnContainer.attr 'title', 'Expand'

    hideWidget: ->
      @$el.css('opacity', 0)
      setTimeout =>
        console.log 'timeout'
        @model.destroy()
      , 100
