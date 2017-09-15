'use strict';

angular.module('openshiftCommonUI')
  .directive('toastNotifications', function(NotificationsService, $rootScope, $timeout) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'src/components/toast-notifications/toast-notifications.html',
      link: function($scope) {
        $scope.notifications = [];

        // A notification is removed if it has hidden set and the user isn't
        // currently hovering over it.
        var isRemoved = function(notification) {
          return notification.hidden && !notification.isHover;
        };

        var removeNotification = function(notification) {
          notification.isHover = false;
          notification.hidden = true;
        };

        // Remove items that are now hidden to keep the array from growing
        // indefinitely. We loop over the entire array each digest loop, even
        // if everything is hidden, and any watch update triggers a new digest
        // loop. If the array grows large, it can hurt performance.
        var pruneRemovedNotifications = function() {
          $scope.notifications = _.reject($scope.notifications, isRemoved);
        };

        $scope.close = function(notification) {
          removeNotification(notification);
          if (_.isFunction(notification.onClose)) {
            notification.onClose();
          }
        };

        $scope.onClick = function(notification, link) {
          if (_.isFunction(link.onClick)) {
            // If onClick() returns true, also hide the alert.
            var close = link.onClick();
            if (close) {
              removeNotification(notification);
            }
          }
        };

        $scope.setHover = function(notification, isHover) {
          // Don't change anything if the notification was already removed.
          // Avoids a potential issue where the flag is reset during the slide
          // out animation.
          if (!isRemoved(notification)) {
            notification.isHover = isHover;
          }
        };

        // Listen for updates from NotificationsService to show a notification.
        var deregisterNotificationListener = $rootScope.$on('NotificationsService.onNotificationAdded', function(event, notification) {
          if (notification.skipToast) {
            return;
          }
          $scope.$evalAsync(function() {
            $scope.notifications.push(notification);
            if (NotificationsService.isAutoDismiss(notification)) {
              $timeout(function () {
                notification.hidden = true;
              }, NotificationsService.dismissDelay);
            }

            // Whenever we add a new notification, also remove any hidden toasts
            // so that the array doesn't grow indefinitely.
            pruneRemovedNotifications();
          });
        });

        $scope.$on('$destroy', function() {
          if (deregisterNotificationListener) {
            deregisterNotificationListener();
            deregisterNotificationListener = null;
          }
        });
      }
    };
  });
