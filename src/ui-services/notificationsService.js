'use strict';

angular.module('openshiftCommonUI').provider('NotificationsService', function() {
  this.dismissDelay = 8000;
  this.autoDismissTypes = ['info', 'success'];

  this.$get = function() {
    var notifications = [];
    var dismissDelay = this.dismissDelay;
    var autoDismissTypes = this.autoDismissTypes;

    var notificationHiddenKey = function(notificationID, namespace) {
      if (!namespace) {
        return 'hide/notification/' + notificationID;
      }

      return 'hide/notification/' + namespace + '/' + notificationID;
    };

    var addNotification = function (notification, notificationID, namespace) {
      if (notificationID && isNotificationPermanentlyHidden(notificationID, namespace)) {
        notification.hidden = true;
      }

      notifications.push(notification);
    };

    var getNotifications = function () {
      return notifications;
    };

    var clearNotifications = function () {
      _.take(notifications, 0);
    };

    var isNotificationPermanentlyHidden = function (notificationID, namespace) {
      var key = notificationHiddenKey(notificationID, namespace);
      return localStorage.getItem(key) === 'true';
    };

    var permanentlyHideNotification = function (notificationID, namespace) {
      var key = notificationHiddenKey(notificationID, namespace);
      localStorage.setItem(key, 'true');
    };

    var isAutoDismiss = function(notification) {
      return _.find(autoDismissTypes, function(type) {
        return type === notification.type;
      });
    };

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
