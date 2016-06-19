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

      Widget.prototype.attributes = function() {
        var ref, ref1, ref2, ref3;
        return {
          'data-sizex': ((ref = this.model.get('position-data')) != null ? ref.width : void 0) || 1,
          'data-sizey': ((ref1 = this.model.get('position-data')) != null ? ref1.height : void 0) || 1,
          'data-row': ((ref2 = this.model.get('position-data')) != null ? ref2.x : void 0) || 1,
          'data-col': ((ref3 = this.model.get('position-data')) != null ? ref3.y : void 0) || 1
        };
      };

      Widget.prototype.initialize = function() {
        return console.log('widget init');
      };

      Widget.prototype.remove = function() {
        console.log('widget destruct');
        return Widget.__super__.remove.apply(this, arguments);
      };

      return Widget;

    })(Marionette.LayoutView);
  });

}).call(this);

//# sourceMappingURL=widget.js.map
