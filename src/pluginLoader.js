/*
 * This is a pared down version of hawtio-core in order to remove the outdated
 * dependency as part the migration from bower to yarn.
 *
 * TODO Figure out a better strategy for API discovery so that this can be
 * removed altogether.
 *
 */

// log initialization
/* globals Logger window console document localStorage $ angular jQuery navigator Jolokia */
(function() {
  'use strict';

  Logger.setLevel(Logger.INFO);
  window['LogBuffer'] = 100;

  if ('localStorage' in window) {
    if (!('logLevel' in window.localStorage)) {
      window.localStorage['logLevel'] = JSON.stringify(Logger.INFO);
    }
    var logLevel = Logger.DEBUG;
    try {
      logLevel = JSON.parse(window.localStorage['logLevel']);
    } catch (e) {
      console.error("Failed to parse log level setting: ", e);
    }
    Logger.setLevel(logLevel);

    if ('logBuffer' in window.localStorage) {
      var logBuffer = window.localStorage['logBuffer'];
      window['LogBuffer'] = parseInt(logBuffer, 10);
    } else {
      window.localStorage['logBuffer'] = window['LogBuffer'];
    }
  }
})();

/*
 * Plugin loader and discovery mechanism
 */
var pluginLoader = (function(self) {
  'use strict';

  var log = Logger;

  var bootstrapEl = document.documentElement;

  self.log = log;

  /**
   * Holds all of the angular modules that need to be bootstrapped
   * @type {Array}
   */
  self.modules = [];

  /**
   * Tasks to be run before bootstrapping, tasks can be async.
   * Supply a function that takes the next task to be
   * executed as an argument and be sure to call the passed
   * in function.
   *
   * @type {Array}
   */
  self.tasks = [];

  self.setBootstrapElement = function(el) {
    log.debug("Setting bootstrap element to: ", el);
    bootstrapEl = el;
  }

  self.getBootstrapElement = function() {
    return bootstrapEl;
  }

  self.registerPreBootstrapTask = function(task, front) {
    if (angular.isFunction(task)) {
      log.debug("Adding legacy task");
      task = {
        task: task
      };
    }

    if (!task.name) {
      task.name = 'unnamed-task-' + (self.tasks.length + 1);
    }

    if (task.depends && !angular.isArray(task.depends) && task.depends !== '*') {
      task.depends = [task.depends];
    }

    if (!front) {
      self.tasks.push(task);
    } else {
      self.tasks.unshift(task);
    }
  };

  self.addModule = function(module) {
    log.debug("Adding module: " + module);
    self.modules.push(module);
  };

  self.getModules = function() {
    return self.modules;
  };

  self.loaderCallback = null;

  self.setLoaderCallback = function(cb) {
    self.loaderCallback = cb;
  };

  function intersection(search, needle) {
    if (!angular.isArray(needle)) {
      needle = [needle];
    }
    var answer = [];
    needle.forEach(function(n) {
      search.forEach(function(s) {
        if (n === s) {
          answer.push(s);
        }
      });
    });
    return answer;
  }


  self.loadPlugins = function(callback) {

    var lcb = self.loaderCallback;

    var plugins = {};

    var bootstrap = function() {
      var executedTasks = [];
      var deferredTasks = [];

      var bootstrapTask = {
        name: 'Bootstrap',
        depends: '*',
        runs: 0,
        task: function(next) {
          function listTasks() {
            deferredTasks.forEach(function(task) {
              self.log.info("  name: " + task.name + " depends: ", task.depends);
            });
          }
          if (deferredTasks.length > 0) {
            self.log.info("tasks yet to run: ");
            listTasks();
            bootstrapTask.runs = bootstrapTask.runs + 1;
            self.log.info("Task list restarted : ", bootstrapTask.runs, " times");
            if (bootstrapTask.runs === 5) {
              self.log.info("Orphaned tasks: ");
              listTasks();
              deferredTasks.length = 0;
            } else {
              deferredTasks.push(bootstrapTask);
            }
          }
          self.log.debug("Executed tasks: ", executedTasks);
          next();
        }
      }

      self.registerPreBootstrapTask(bootstrapTask);

      var executeTask = function() {
        var tObj = null;
        var tmp = [];
        // if we've executed all of the tasks, let's drain any deferred tasks
        // into the regular task queue
        if (self.tasks.length === 0) {
          tObj = deferredTasks.shift();
        }
        // first check and see what tasks have executed and see if we can pull a task
        // from the deferred queue
        while(!tObj && deferredTasks.length > 0) {
          var task = deferredTasks.shift();
          if (task.depends === '*') {
            if (self.tasks.length > 0) {
              tmp.push(task);
            } else {
              tObj = task;
            }
          } else {
            var intersect = intersection(executedTasks, task.depends);
            if (intersect.length === task.depends.length) {
              tObj = task;
            } else {
              tmp.push(task);
            }
          }
        }
        if (tmp.length > 0) {
          tmp.forEach(function(task) {
            deferredTasks.push(task);
          });
        }
        // no deferred tasks to execute, let's get a new task
        if (!tObj) {
          tObj = self.tasks.shift();
        }
        // check if task has dependencies
        if (tObj && tObj.depends && self.tasks.length > 0) {
          self.log.debug("Task '" + tObj.name + "' has dependencies: ", tObj.depends);
          if (tObj.depends === '*') {
            if (self.tasks.length > 0) {
              self.log.debug("Task '" + tObj.name + "' wants to run after all other tasks, deferring");
              deferredTasks.push(tObj);
              executeTask();
              return;
            }
          } else {
            var intersect = intersection(executedTasks, tObj.depends);
            if (intersect.length != tObj.depends.length) {
              self.log.debug("Deferring task: '" + tObj.name + "'");
              deferredTasks.push(tObj);
              executeTask();
              return;
            }
          }
        }
        if (tObj) {
          self.log.debug("Executing task: '" + tObj.name + "'");
          var called = false;
          var next = function() {
            if (next.notFired) {
              next.notFired = false;
              executedTasks.push(tObj.name);
              setTimeout(executeTask, 1);
            }
          }
          next.notFired = true;
          tObj.task(next);
        } else {
          self.log.debug("All tasks executed");
          setTimeout(callback, 1);
        }
      };
      setTimeout(executeTask, 1);
    };

    var loadScripts = (function() {

      // keep track of when scripts are loaded so we can execute the callback
      var loaded = 0;
      $.each(plugins, function(key, data) {
        loaded = loaded + data.Scripts.length;
      });

      var totalScripts = loaded;

      var scriptLoaded = function() {
        $.ajaxSetup({async:true});
        loaded = loaded - 1;
        if (lcb) {
          lcb.scriptLoaderCallback(lcb, totalScripts, loaded + 1);
        }
        if (loaded === 0) {
          bootstrap();
        }
      };

      if (loaded > 0) {
        $.each(plugins, function(key, data) {

          data.Scripts.forEach( function(script) {
            var scriptName = data.Context + "/" + script;
            log.debug("Fetching script: ", scriptName);
            $.ajaxSetup({async:false});
            $.getScript(scriptName)
            .done(function(textStatus) {
              log.debug("Loaded script: ", scriptName);
            })
            .fail(function(jqxhr, settings, exception) {
              log.info("Failed loading script: \"", exception.message, "\" (<a href=\"", scriptName, ":", exception.lineNumber, "\">", scriptName, ":", exception.lineNumber, "</a>)");
            })
            .always(scriptLoaded);
          });
        });
      } else {
        // no scripts to load, so just do the callback
        $.ajaxSetup({async:true});
        bootstrap();
      }
      return this;
    })();
  };

  self.debug = function() {
    log.debug("modules");
    log.debug(self.modules);
  };

  self.setLoaderCallback({
    scriptLoaderCallback: function (self, total, remaining) {
      log.debug("Total scripts: ", total, " Remaining: ", remaining);
    }
  });

  return self;

})(pluginLoader || {}, window, undefined);

// Plugin responsible for bootstrapping the app
var BootstrapPlugin = (function () {
    'use strict';

    function BootstrapPluginClass(){}

    /**
     * The app's injector, set once bootstrap is completed
     */
    Object.defineProperty(BootstrapPluginClass.prototype, "injector", {
      get: function() {
        return BootstrapPlugin._injector;
      },
      enumerable: true,
      configurable: true
    });

    var BootstrapPlugin = new BootstrapPluginClass();

    /**
     * This plugin's name and angular module
     */
    BootstrapPlugin.pluginName = "bootstrap-plugin";
    /**
     * This plugins logger instance
     */
    var log = Logger.get(BootstrapPlugin.pluginName);

    var _module = angular.module(BootstrapPlugin.pluginName, []);
    _module.config(["$locationProvider", function ($locationProvider) {
      $locationProvider.html5Mode(true);
    }]);

    _module.run(['documentBase', function (documentBase) {
      log.debug("loaded");
    }]);

    BootstrapPlugin.documentBase = function() {
      var base = $('head').find('base');
      var answer = '/'
      if (base && base.length > 0) {
        answer = base.attr('href');
      } else {
        log.warn("Document is missing a 'base' tag, defaulting to '/'");
      }
      return answer;
    }

    // Holds the document base so plugins can easily
    // figure out absolute URLs when needed
    _module.factory('documentBase', function() {
      return BootstrapPlugin.documentBase();
    });

    pluginLoader.addModule("ng");
    pluginLoader.addModule("ngSanitize");
    pluginLoader.addModule(BootstrapPlugin.pluginName);

    // bootstrap the app
    $(function () {

      jQuery.uaMatch = function( ua ) {
        ua = ua.toLowerCase();

        var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
          /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
          /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
          /(msie) ([\w.]+)/.exec( ua ) ||
          ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
          [];

        return {
          browser: match[ 1 ] || "",
          version: match[ 2 ] || "0"
        };
      };

      // Don't clobber any existing jQuery.browser in case it's different
      if ( !jQuery.browser ) {
        var matched = jQuery.uaMatch( navigator.userAgent );
        var browser = {};

        if ( matched.browser ) {
          browser[ matched.browser ] = true;
          browser.version = matched.version;
        }

        // Chrome is Webkit, but Webkit is also Safari.
        if ( browser.chrome ) {
          browser.webkit = true;
        } else if ( browser.webkit ) {
          browser.safari = true;
        }

        jQuery.browser = browser;
      }

      pluginLoader.loadPlugins(function() {

        if (BootstrapPlugin.injector) {
          log.debug("Application already bootstrapped");
          return;
        }

        var bootstrapEl = pluginLoader.getBootstrapElement();
        log.debug("Using bootstrap element: ", bootstrapEl);

        BootstrapPlugin._injector = angular.bootstrap(bootstrapEl, pluginLoader.getModules(), {
          strictDi: false
        });
        log.debug("Bootstrapped application");
      });
    });
    return BootstrapPlugin;
})();

// Create an alias for hawtioPluginLoader since it may still be used in other
// downstream repos.
window.hawtioPluginLoader = pluginLoader;
