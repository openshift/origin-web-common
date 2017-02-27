"use strict";

//load the module
beforeEach(module('openshiftCommon'));

beforeEach(module(function ($provide) {
  $provide.provider("HawtioNavBuilder", function() {
    function Mocked() {}
    this.create = function() {return this;};
    this.id = function() {return this;};
    this.title = function() {return this;};
    this.template = function() {return this;};
    this.isSelected = function() {return this;};
    this.href = function() {return this;};
    this.page = function() {return this;};
    this.subPath = function() {return this;};
    this.build = function() {return this;};
    this.join = function() {return "";};
    this.$get = function() {return new Mocked();};
  });

  $provide.factory("HawtioNav", function(){
    return {add: function() {}};
  });

  $provide.factory("HawtioExtension", function() {
    return {
      add: function() {}
    };
  });

  // Make sure a base location exists in the generated test html
  if (!$('head base').length) {
    $('head').append($('<base href="/">'));
  }

  angular.module('openshiftCommon').config(function(AuthServiceProvider) {
     AuthServiceProvider.UserStore('MemoryUserStore');
   })
    .constant("API_CFG", _.get(window.OPENSHIFT_CONFIG, "api", {}))
    .constant("APIS_CFG", _.get(window.OPENSHIFT_CONFIG, "apis", {}))
    .constant("AUTH_CFG", _.get(window.OPENSHIFT_CONFIG, "auth", {}))
    .config(function($httpProvider, AuthServiceProvider, AUTH_CFG, API_CFG) {
      AuthServiceProvider.LoginService('RedirectLoginService');
      AuthServiceProvider.LogoutService('DeleteTokenLogoutService');
      AuthServiceProvider.UserStore('LocalStorageUserStore');
    });
  hawtioPluginLoader.addModule('openshiftCommon');

}));
