"use strict";

// Load the modules.
beforeEach(module('openshiftCommonServices', 'openshiftCommonUI'));

beforeEach(module(function() {
  // Make sure a base location exists in the generated test html.
  if (!$('head base').length) {
    $('head').append($('<base href="/">'));
  }

  angular.module('openshiftCommonServices').config(function(AuthServiceProvider) {
     AuthServiceProvider.UserStore('MemoryUserStore');
   })
    .constant("API_CFG", _.get(window.OPENSHIFT_CONFIG, "api", {}))
    .constant("APIS_CFG", _.get(window.OPENSHIFT_CONFIG, "apis", {}))
    .constant("AUTH_CFG", _.get(window.OPENSHIFT_CONFIG, "auth", {}))
    .config(function($httpProvider, AuthServiceProvider) {
      AuthServiceProvider.LoginService('RedirectLoginService');
      AuthServiceProvider.LogoutService('DeleteTokenLogoutService');
      AuthServiceProvider.UserStore('LocalStorageUserStore');
    });
}));
