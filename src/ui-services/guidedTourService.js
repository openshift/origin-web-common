'use strict';

angular.module('openshiftCommonUI').factory('GuidedTourService', function() {
  var hopscotchConfig = {};
  var innerConfig;
  var bubbleHeight = 175;

  var startTour = function(tourConfig, onTourEndCB) {
    $('body').append('<div id="guided_tour_backdrop" class="modal-backdrop fade guided-tour-backdrop"></div>');

    innerConfig = {
      onTourEndCB: onTourEndCB,
      bubblePadding: 5,
      arrowWidth: 10,
      onStart: handleTourStart,
      onEnd: handleTourEnd,
      onClose: handleTourEnd,
      showPrevButton: true,
      i18n: {
        nextBtn: 'Next >',
        prevBtn: '< Back',
        closeTooltip: 'x'  // this is the button text not a tooltip, hidden but must be 1 character for focus border (cannot but empty or null)
      }
    };
    hopscotchConfig = {};
    angular.merge(hopscotchConfig, innerConfig, tourConfig);

    setupSteps();
    makeStepTargetVisible(0);

    hopscotch.startTour(hopscotchConfig, 0);
  };

  var cancelTour = function() {
    hopscotch.endTour();
  };

  function handleTourStart() {
    $('#guided_tour_backdrop').click(cancelTour);
  }

  function handleTourEnd() {
    $('#guided_tour_backdrop').remove();
    if (angular.isFunction(hopscotchConfig.onTourEndCB)) {
      hopscotchConfig.onTourEndCB();
    }
  }

  function setupSteps() {
    _.forEach(hopscotchConfig.steps, function(step) {
      step.onNextOrig = step.onNext;
      step.onPrevOrig = step.onPrev;
      step.onNext = onStepNext;
      step.onPrev = onStepPrev;
      step.fixedElement = true;

      // Since we use a title area, move up to get arrow out of title area
      if (angular.isUndefined(step.yOffset) && (step.placement === 'right' || step.placement === 'left' )) {
        step.yOffset = -45;
      }

      step.title = _.isFunction(step.title) ? step.title() : step.title;
      step.content = _.isFunction(step.content) ? step.content() : step.content;
      step.target = _.isFunction(step.target) ? step.target() : step.target;
      step.placement = _.isFunction(step.placement) ? step.placement() : step.placement;
    });
  }

  function onStepNext() {
    var stepNum = hopscotch.getCurrStepNum() - 1;
    var stepConfig = hopscotchConfig.steps[stepNum];

    if (stepConfig) {
      if (stepConfig.onNextOrig) {
        stepConfig.onNextOrig();
      }

      makeStepTargetVisible(stepNum + 1);
    }
  }

  function onStepPrev() {
    var stepNum = hopscotch.getCurrStepNum() + 1;
    var stepConfig = hopscotchConfig.steps[stepNum];

    if (stepConfig) {
      if (stepConfig.onPrevOrig) {
        stepConfig.onPrevOrig();
      }

      makeStepTargetVisible(stepNum - 1);
    }
  }

  function makeStepTargetVisible(stepNum) {
    var stepConfig = hopscotchConfig.steps[stepNum];

    if (!stepConfig) {
      return;
    }

    if (stepConfig.preShow) {
      stepConfig.preShow();
    }

    if (stepConfig.targetScrollElement) {
      var scrollElement = $('body').find(stepConfig.targetScrollElement)[0];
      var targetElement = $('body').find(stepConfig.target)[0];

      if (scrollElement && scrollElement) {

        var offsetTop = getOffsetTopFromScrollElement(targetElement, scrollElement);
        if (stepConfig.placement === 'top') {
          offsetTop -= bubbleHeight;
        } else {
          offsetTop += bubbleHeight;
        }

        if (offsetTop > scrollElement.clientHeight) {
          scrollElement.scrollTop = offsetTop;
        } else {
          scrollElement.scrollTop = 0;
        }
      }
    }
  }

  function getOffsetTopFromScrollElement(targetElement, scrollElement) {
    if (!targetElement || targetElement === scrollElement) {
      return 0;
    } else {
      return targetElement.offsetTop + getOffsetTopFromScrollElement(targetElement.offsetParent, scrollElement);
    }
  }

  return {
    startTour: startTour,
    cancelTour: cancelTour
  };
});
