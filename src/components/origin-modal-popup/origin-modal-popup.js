"use strict";

angular.module("openshiftCommonUI").component("originModalPopup", {
  transclude: true,
  bindings: {
    modalTitle: '@',
    shown: '<',
    position: '@', // 'top-left', 'top-right', 'bottom-left', or 'bottom-right' (default is 'bottom-right')
    referenceElement: '<?', // Optional reference element, default is parent element. Used to position popup based on screen position
    onClose: '<'
  },
  templateUrl: 'src/components/origin-modal-popup/origin-modal-popup.html',
  controller: function($scope, HTMLService, $element, $window) {
    var ctrl = this;
    var debounceResize;

    function updatePosition() {
      var positionElement = ctrl.referenceElement || $element[0].parentNode;

      if (positionElement && HTMLService.isWindowAboveBreakpoint(HTMLService.WINDOW_SIZE_SM)) {
        var posAbove = ctrl.position && ctrl.position.indexOf('top') > -1;
        var posLeft = ctrl.position && ctrl.position.indexOf('left') > -1;
        var topPos;
        var leftPos;
        var elementRect = positionElement.getBoundingClientRect();
        var windowHeight = $window.innerHeight;
        var modalElement = $element[0].children[0];
        var modalHeight = _.get(modalElement, 'offsetHeight', 0);
        var modalWidth = _.get(modalElement, 'offsetWidth', 0);

        // auto-adjust vertical position based on showing in the viewport
        if (elementRect.top < modalHeight) {
          posAbove = false;
        } else if (elementRect.bottom + modalHeight > windowHeight) {
          posAbove = true;
        }

        if (posAbove) {
          topPos = (elementRect.top - modalHeight) + 'px';
        } else {
          topPos = elementRect.bottom + 'px';
        }

        if (posLeft) {
          leftPos = elementRect.left + 'px';
        } else {
          leftPos = (elementRect.right - modalWidth) + 'px';
        }

        ctrl.showAbove = posAbove;
        ctrl.showLeft = posLeft;

        ctrl.positionStyle = {
          left: leftPos,
          top: topPos
        };
      } else {
        ctrl.positionStyle = {};
      }
    }

    function showModalBackdrop() {
      var backdropElement = '<div class="origin-modal-popup-backdrop modal-backdrop fade in tile-click-prevent"></div>';
      var parentNode = ctrl.referenceElement ? ctrl.referenceElement.parentNode : $element[0].parentNode;
      $(parentNode).append(backdropElement);
    }

    function hideModalBackdrop() {
      $('.origin-modal-popup-backdrop').remove();
    }

    function onWindowResize() {
      $scope.$evalAsync(updatePosition);
    }

    function onShow() {
      showModalBackdrop();
      debounceResize = _.debounce(onWindowResize, 50, { maxWait: 250 });
      angular.element($window).on('resize', debounceResize);
    }

    function onHide() {
      hideModalBackdrop();
      angular.element($window).off('resize', debounceResize);
    }

    ctrl.$onChanges = function (changeObj) {
      if (changeObj.shown) {
        if (ctrl.shown) {
          onShow();
        } else {
          onHide();
        }
      }

      if (changeObj.shown || changeObj.referenceElement) {
        if (ctrl.shown) {
          updatePosition();
        }
      }
    };

    ctrl.$onDestroy = function() {
      if (ctrl.shown) {
        onHide();
      }
    }
  }
});
