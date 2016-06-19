(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  define(['backbone.marionette', './templates/widget'], function(Marionette, template) {
    var Widget;
    return Widget = (function(superClass) {
      extend(Widget, superClass);

      function Widget() {
        return Widget.__super__.constructor.apply(this, arguments);
      }

      Widget.prototype.template = template;

      Widget.prototype.className = 'widget-wrapper';

      Widget.prototype.initialize = function(options) {
        this.editor = options.editor;
        this.listenTo(this, 'gridster:change', this.onGridChange);
        return Widget.__super__.initialize.apply(this, arguments);
      };

      Widget.prototype.attributes = function() {
        return {
          'data-sizex': this.model.get('position').width,
          'data-sizey': this.model.get('position').collapsed ? 1 : this.model.get('position').height,
          'data-col': this.model.get('position').x,
          'data-row': this.model.get('position').y
        };
      };

      Widget.prototype.regions = function() {
        return {
          content: '.content'
        };
      };

      Widget.prototype.ui = function() {
        return {
          minimizeBtn: '.minimize-btn',
          minimizeBtnContainer: '.minimize-btn-container'
        };
      };

      Widget.prototype.events = function() {
        return {
          'click @ui.minimizeBtnContainer': function() {
            return this.toggleWidget();
          },
          'click .close-btn': 'hideWidget'
        };
      };

      Widget.prototype.onGridChange = function(widget) {
        var position;
        position = _.extend({}, this.model.get('position'));
        if (position.collapsed) {
          if (widget.height > 1) {
            this.model.set('position', _.extend(position, widget));
            return this.toggleWidget(false);
          } else {
            widget.height = position.height;
            return this.model.set('position', _.extend(position, widget));
          }
        } else {
          if (widget.height === 1) {
            widget.height = position.height;
            this.model.set('position', _.extend(position, widget));
            return this.toggleWidget(false);
          } else {
            return this.model.set('position', _.extend(position, widget));
          }
        }
      };

      Widget.prototype.onRender = function() {
        return this.$el.data('view', this);
      };

      Widget.prototype.toggleWidget = function(resize) {
        var position;
        if (resize == null) {
          resize = true;
        }
        position = this.model.get('position');
        if (position.collapsed) {
          this.model.set('position', _.extend({}, position, {
            collapsed: false
          }));
          if (resize) {
            this.editor.gridster.resize_widget(this.$el, position.width, position.height);
          }
          this.ui.minimizeBtn.addClass('expanded');
          return this.ui.minimizeBtnContainer.attr('title', 'Collapse');
        } else {
          this.model.set('position', _.extend({}, position, {
            collapsed: true
          }));
          if (resize) {
            this.editor.gridster.resize_widget(this.$el, position.width, 1);
          }
          this.ui.minimizeBtn.removeClass('expanded');
          return this.ui.minimizeBtnContainer.attr('title', 'Expand');
        }
      };

      Widget.prototype.hideWidget = function() {
        this.$el.css('opacity', 0);
        return setTimeout((function(_this) {
          return function() {
            console.log('timeout');
            return _this.model.destroy();
          };
        })(this), 100);
      };

      return Widget;

    })(Marionette.LayoutView);
  });

}).call(this);

//# sourceMappingURL=widget.js.map
