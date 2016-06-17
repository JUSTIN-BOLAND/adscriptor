(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  define(['backbone.marionette', './templates/layout'], function(Marionette, template) {
    var AppLayout;
    return AppLayout = (function(superClass) {
      extend(AppLayout, superClass);

      function AppLayout() {
        return AppLayout.__super__.constructor.apply(this, arguments);
      }

      AppLayout.prototype.el = 'body';

      AppLayout.prototype.template = template;

      AppLayout.prototype.regions = function() {
        return {
          layout: '.layout',
          overlay: '.overlay'
        };
      };

      return AppLayout;

    })(Marionette.LayoutView);
  });

}).call(this);

//# sourceMappingURL=layout.js.map
