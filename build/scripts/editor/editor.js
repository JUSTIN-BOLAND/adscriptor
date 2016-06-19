(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  define(['backbone', 'backbone.marionette', 'gridster', './views/widget', './views/templates/layout'], function(Backbone, Marionette, Gridster, Widget, template) {
    var EditorGrid;
    return EditorGrid = (function(superClass) {
      extend(EditorGrid, superClass);

      function EditorGrid() {
        return EditorGrid.__super__.constructor.apply(this, arguments);
      }

      EditorGrid.prototype.template = template;

      EditorGrid.prototype.childView = Widget;

      EditorGrid.prototype.childViewContainer = '.grid-layout';

      EditorGrid.prototype.className = 'editor-grid gridster';

      EditorGrid.prototype.collectionEvents = {
        'change': 'render'
      };

      EditorGrid.prototype.initialize = function() {
        var counter, inter;
        EditorGrid.__super__.initialize.apply(this, arguments);
        console.log('construct');
        counter = 1;
        return inter = setInterval((function(_this) {
          return function() {
            console.log('timeout');
            if (counter < 5) {
              counter++;
              _this.collection.add({
                name: "added " + (Math.random().toFixed(4))
              });
              return console.log(_this.collection.length);
            } else {
              return clearInterval(inter);
            }
          };
        })(this), 1500);
      };

      EditorGrid.prototype.ui = function() {
        return {
          grid: '.grid-layout'
        };
      };

      EditorGrid.prototype.onShow = function() {
        this.ui.grid.gridster({
          widget_selector: '.widget-wrapper',
          widget_base_dimensions: [42, 42],
          widget_margins: [0, 0],
          draggable: {
            enabled: true,
            handle: '.drag-handle',
            start: (function(_this) {
              return function() {
                return _this.ui.grid.addClass('active');
              };
            })(this),
            stop: (function(_this) {
              return function() {
                return _this.ui.grid.removeClass('active');
              };
            })(this)
          },
          resize: {
            enabled: true,
            start: (function(_this) {
              return function() {
                return _this.ui.grid.addClass('active');
              };
            })(this),
            stop: (function(_this) {
              return function() {
                return _this.ui.grid.removeClass('active');
              };
            })(this)
          }
        });
        this.gridster = this.ui.grid.data('gridster');
        return console.log('show');
      };

      EditorGrid.prototype.attachHtml = function(collectionView, childView, index) {
        EditorGrid.__super__.attachHtml.apply(this, arguments);
        if (this.gridster != null) {
          return this.gridster.add_widget(childView.$el);
        }
      };

      EditorGrid.prototype.removeChildView = function(childView) {
        if (this.gridster != null) {
          this.gridster.remove_widget(childView.$el);
        }
        return EditorGrid.__super__.removeChildView.apply(this, arguments);
      };

      return EditorGrid;

    })(Marionette.CompositeView);
  });

}).call(this);

//# sourceMappingURL=editor.js.map
