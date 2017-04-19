'use strict';

angular.module('openshiftCommonUI')
  .directive('toastNotifications', function(NotificationsService, $timeout) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'src/components/toast-notifications/toast-notifications.html',
      link: function($scope) {
        $scope.notifications = NotificationsService.getNotifications();

        $scope.close = function(notification) {
          notification.hidden = true;
          if (_.isFunction(notification.onClose)) {
            notification.onClose();
          }
        };
        $scope.onClick = function(notification, link) {
          if (_.isFunction(link.onClick)) {
            // If onClick() returns true, also hide the alert.
            var close = link.onClick();
            if (close) {
              notification.hidden = true;
            }
          }
        };
        $scope.setHover = function(notification, isHover) {
          notification.isHover = isHover;
        };

        $scope.$watch('notifications', function() {
          _.each($scope.notifications, function(notification) {
            if (NotificationsService.isAutoDismiss(notification) && !notification.hidden) {
              if (!notification.timerId) {
                notification.timerId = $timeout(function () {
                  notification.timerId = -1;
                  if (!notification.isHover) {
                    notification.hidden = true;
                  }
                }, NotificationsService.dismissDelay);
              } else if (notification.timerId === -1 && !notification.isHover) {
                notification.hidden = true;
              }
            }
          });
        }, true);
      }
    };
  });
