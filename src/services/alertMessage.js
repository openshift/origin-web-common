'use strict';

angular.module("openshiftCommonServices")
  .service("AlertMessageService", function(){
    var alertHiddenKey = function(alertID, namespace) {
      if (!namespace) {
        return 'hide/alert/' + alertID;
      }

      return 'hide/alert/' + namespace + '/' + alertID;
    };
    return {
      isAlertPermanentlyHidden: function(alertID, namespace) {
        var key = alertHiddenKey(alertID, namespace);
        return localStorage.getItem(key) === 'true';
      },
      permanentlyHideAlert: function(alertID, namespace) {
        var key = alertHiddenKey(alertID,namespace);
        localStorage.setItem(key, 'true');
      }
    };
  });
