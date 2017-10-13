describe('NotificationsService', function() {
  'use strict';

  var NotificationsService, $rootScope;
  beforeEach(function() {
    inject(function(_NotificationsService_, _$rootScope_) {
      NotificationsService = _NotificationsService_;
      $rootScope = _$rootScope_;
    });
  });

  var mockNotification = {
    id: "deprovision-service-error",
    type: "error",
    message: "An error occurred while deleting provisioned service mongodb.",
    details: "Deprovision call failed: could not connect to broker."
  };

  describe('#addNotification', function() {
    it('should add a notification', function() {
      var notification = angular.copy(mockNotification);
      NotificationsService.addNotification(notification);
      var notifications = NotificationsService.getNotifications();
      expect(notifications.length).toBe(1);
      expect(notifications[0].id).toBe(mockNotification.id);
    });
  });

  describe('#hideNotification', function() {
    it('should hide a notification', function() {
      var notification = angular.copy(mockNotification);
      NotificationsService.addNotification(notification);
      NotificationsService.hideNotification(notification.id);
      var notifications = NotificationsService.getNotifications();
      expect(notifications.length).toBe(1);
      expect(notifications[0].hidden).toBe(true);
    });
  });

  describe('#clearNotifications', function() {
    it('should clear notifications', function() {
      var notification1 = angular.copy(mockNotification);
      NotificationsService.addNotification(notification1);

      var notification2 = angular.copy(mockNotification);
      notification2.id = 'another';
      NotificationsService.addNotification(notification2);

      var notifications = NotificationsService.getNotifications();
      expect(notifications.length).toBe(2);
      NotificationsService.clearNotifications();

      notifications = NotificationsService.getNotifications();
      expect(notifications.length).toBe(0);
    });
  });

  describe('$rootScope events', function() {
    it('should listen for NotificationsService.addNotification events', function() {
      var notification = angular.copy(mockNotification);
      $rootScope.$emit('NotificationsService.addNotification', notification);
      var notifications = NotificationsService.getNotifications();
      expect(notifications.length).toBe(1);
      expect(notifications[0].id).toBe(mockNotification.id);
    });
  });
});
