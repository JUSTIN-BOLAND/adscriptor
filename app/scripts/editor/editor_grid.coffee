define [
  'backbone'
  'backbone.marionette'
  'gridster'
  './widget_factory'
  './collections/widgets'
  './views/widget_item'
  './layout_manager'
  './layout'
], (
  Backbone
  Marionette
  Gridster
  WidgetFactory
  Widgets
  WidgetItem
  LayoutManager
  template
) ->
  class EditorGrid extends Marionette.CompositeView
    template: template
    childView: WidgetItem
    childViewContainer: '.grid-layout'
    className: 'editor-grid gridster'

    initialize: ->
      @collection = new Widgets()
      @gridSize = @_calcGridsterSize()
      super

    collectionEvents:
      'change': 'render'

    ui:
      grid: '.grid-layout'

    buildChildView: (item, ItemView) ->
      new ItemView
        model: item
        editor: this

    render: ->
      @collection.fetch().done =>
        @layoutManager = new LayoutManager
          collection: @collection
          gridSize: @gridSize
        # Apply default layout in case we don't have any widgets
        @layoutManager.applyLayout() if @collection.length == 0
        super

    _calcGridsterSize: ->
      height = $(window).height() - 36
      width = $(window).width() - 36
      {
        cols: Math.floor width / 42
        rows: Math.floor height / 42
      }

    _initializeGridster: ->
      @ui.grid.css 'min-height': (@gridSize.rows * 42), 'min-width': (@gridSize.cols * 42)

      @ui.grid.gridster
        widget_selector: '.widget-wrapper'
        widget_base_dimensions: [42, 42]
        widget_margins: [0, 0]
        min_cols: @gridSize.cols
        min_rows: @gridSize.rows
        draggable:
          enabled: true
          handle: '.drag-handle'
          start: => @ui.grid.addClass('active')
          stop: _.compose =>
            @ui.grid.removeClass('active')
            @gridster.serialize()
          , ->
            # reset the player-revert after transition, so our menu isn't hidden behind the old player...
            player = @$player
            player.one 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', -> player.removeClass('player-revert')
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
      console.log @gridster

    onShow: ->
      @_initializeGridster()

    attachHtml: (collectionView, childView, index) ->
      super
      @gridster.add_widget(childView.$el) if @gridster?

    removeChildView: (childView) ->
      @gridster.remove_widget(childView.$el) if @gridster?
      super