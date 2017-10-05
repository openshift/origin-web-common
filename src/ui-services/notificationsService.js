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
      // notifications may already have an id that is not necessarily unique,
      // this is an explicitly unique id just for `track by` in templates
      notification.trackByID = _.uniqueId('notification-') + Date.now();
      notification.skipToast = notification.skipToast || false;
      notification.showInDrawer = notification.showInDrawer || false;
      notification.timestamp = new Date().toISOString();
      if (isNotificationPermanentlyHidden(notification) || isNotificationVisible(notification)) {
        return;
      }

      notifications.push(notification);
      $rootScope.$emit('NotificationsService.onNotificationAdded', notification);
    };

    var hideNotification = function (notificationID) {
      if (!notificationID) {
        return;
      }

      _.each(notifications, function(notification) {
        if (notification.id === notificationID) {
          notification.hidden = true;
        }
      });
    };

    var getNotifications = function () {
      return notifications;
    };

    var clearNotifications = function () {
      _.take(notifications, 0);
    };

    // Was the notification set to be hidden?
    // This is different than !isNotificationVisible
    var isNotificationHidden = function (notification) {
      if (!notification.id) {
        return false;
      }

      return _.some(notifications, function(next) {
          return next.hidden === true && notification.id === next.id;
      });
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
      hideNotification(notificationID);
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
      return _.includes(autoDismissTypes, notification.type);
    };

    // Also handle `addNotification` events on $rootScope, which is used by DataService.
    $rootScope.$on('NotificationsService.addNotification', function(event, data) {
      addNotification(data);
    });

    return {
      addNotification: addNotification,
      hideNotification: hideNotification,
      getNotifications: getNotifications,
      clearNotifications: clearNotifications,
      isNotificationHidden: isNotificationHidden,
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
