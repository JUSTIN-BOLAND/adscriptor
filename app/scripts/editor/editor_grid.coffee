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
      @isClearing = false
      super

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
          editor: this
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


    destroyAllWidgets: ->
      # This is needed for the layout manager since destroying widgets
      # too fast throws exceptions (gridster, i'm looking at you...)
      # Simply removes all widgets before detaching them, what should go wrong?
      @gridster?.remove_all_widgets()
      @isClearing = true
      _.invoke @collection.toArray(), 'destroy'
      @isClearing = false

    attachHtml: (collectionView, childView, index) ->
      super
      m = childView.model
      @gridster.add_widget(childView.$el, m.get('width'), (if m.get('collapsed') then 1 else m.get('height')), m.get('x'), m.get('y'), [m.get('maxWidth'), m.get('maxHeight')], [m.get('minWidth'), m.get('minHeight')]) if @gridster?

    removeChildView: (childView) ->
      # check if its the menu-bar.
      # there must always be a menu-bar.
      if not @isClearing and childView.model.get('type') == 'menubar' and @collection.where(type: 'menubar').length <= 0
        attrs = WidgetFactory.getAttributesFor 'menubar'
        attrs = childView.model.pick(_.keys(attrs)...)
        @collection.create attrs
      # continue removing
      @gridster.remove_widget(childView.$el) if @gridster?
      super