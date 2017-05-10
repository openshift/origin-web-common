'use strict';

angular.module('openshiftCommonUI').provider('NotificationsService', function() {
  this.dismissDelay = 8000;
  this.autoDismissTypes = ['info', 'success'];

  this.$get = function($rootScope) {
    var notifications = [];
    var dismissDelay = this.dismissDelay;
    var autoDismissTypes = this.autoDismissTypes;

    var notificationHiddenKey = function(notificationID, namespace) {
      if (!namespace) {
        return 'hide/notification/' + notificationID;
      }

      return 'hide/notification/' + namespace + '/' + notificationID;
    };

    var addNotification = function (notification) {
      if (isNotificationPermanentlyHidden(notification) || isNotificationVisible(notification)) {
        return;
      }

      notifications.push(notification);
    };

    var getNotifications = function () {
      return notifications;
    };

    var clearNotifications = function () {
      _.take(notifications, 0);
    };

    var isNotificationPermanentlyHidden = function (notification) {
      if (!notification.id) {
        return false;
      }

      var key = notificationHiddenKey(notification.id, notification.namespace);
      return localStorage.getItem(key) === 'true';
    };

    var permanentlyHideNotification = function (notificationID, namespace) {
      var key = notificationHiddenKey(notificationID, namespace);
      localStorage.setItem(key, 'true');
    };

    // Is there a visible toast notification with the same ID right now?
    var isNotificationVisible = function (notification) {
      if (!notification.id) {
        return false;
      }

      return _.some(notifications, function(next) {
        return !next.hidden && notification.id === next.id;
      });
    };

    var isAutoDismiss = function(notification) {
      return _.find(autoDismissTypes, function(type) {
        return type === notification.type;
      });
    };

    // Also handle `addNotification` events on $rootScope, which is used by DataService.
    $rootScope.$on('addNotification', function(event, data) {
      addNotification(data);
    });

    return {
      addNotification: addNotification,
      getNotifications: getNotifications,
      clearNotifications: clearNotifications,
      isNotificationPermanentlyHidden: isNotificationPermanentlyHidden,
      permanentlyHideNotification: permanentlyHideNotification,
      isAutoDismiss: isAutoDismiss,
      dismissDelay: dismissDelay,
      autoDismissTypes: autoDismissTypes
    };
  };

  this.setDismissDelay = function(delayInMs) {
    this.dismissDelay = delayInMs;
  };

  this.setAutoDismissTypes = function(arrayOfTypes) {
    this.autoDismissTypes = arrayOfTypes;
  };

});
