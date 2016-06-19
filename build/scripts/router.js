(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  define(['marionette', './editor/editor'], function(Marionette, EditorGrid) {
    var AppRouter;
    return AppRouter = (function(superClass) {
      extend(AppRouter, superClass);

      function AppRouter() {
        return AppRouter.__super__.constructor.apply(this, arguments);
      }

      AppRouter.prototype.routes = {
        '': 'index',
        '/': 'index',
        'configuration': 'configuration',
        'editor': 'editor'
      };

      AppRouter.prototype.initialize = function(options) {
        this.app = options.app;
        return AppRouter.__super__.initialize.apply(this, arguments);
      };

      AppRouter.prototype.index = function() {
        var Configuration;
        Configuration = {
          isConfigured: function() {
            return true;
          }
        };
        if (!Configuration.isConfigured()) {
          return this.navigate('configuration', {
            trigger: true
          });
        } else {
          return this.navigate('editor', {
            trigger: true
          });
        }
      };

      AppRouter.prototype.configuration = function() {};

      AppRouter.prototype.editor = function() {
        console.log('routing');
        return this.app.layout.layout.show(new EditorGrid());
      };

      return AppRouter;

    })(Marionette.AppRouter);
  });

}).call(this);

//# sourceMappingURL=router.js.map
