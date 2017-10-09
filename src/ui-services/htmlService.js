'use strict';

angular.module("openshiftCommonUI")
  .factory("HTMLService", function(BREAKPOINTS) {
    var WINDOW_SIZE_XXS = 'xxs';
    var WINDOW_SIZE_XS = 'xs';
    var WINDOW_SIZE_SM = 'sm';
    var WINDOW_SIZE_MD = 'md';
    var WINDOW_SIZE_LG = 'lg';

    return {
      WINDOW_SIZE_XXS: WINDOW_SIZE_XXS,
      WINDOW_SIZE_XS: WINDOW_SIZE_XS,
      WINDOW_SIZE_SM: WINDOW_SIZE_SM,
      WINDOW_SIZE_MD: WINDOW_SIZE_MD,
      WINDOW_SIZE_LG: WINDOW_SIZE_LG,

      // Ge the breakpoint for the current screen width.
      getBreakpoint: function() {
        if (window.innerWidth < BREAKPOINTS.screenXsMin) {
          return WINDOW_SIZE_XXS;
        }

        if (window.innerWidth < BREAKPOINTS.screenSmMin) {
          return WINDOW_SIZE_XS;
        }

        if (window.innerWidth < BREAKPOINTS.screenMdMin) {
          return WINDOW_SIZE_SM;
        }

        if (window.innerWidth < BREAKPOINTS.screenLgMin) {
          return WINDOW_SIZE_MD;
        }

        return WINDOW_SIZE_LG;
      },

      isWindowBelowBreakpoint: function(size) {
        switch(size) {
          case WINDOW_SIZE_XXS:
            return false; // Nothing is below xxs
            break;
          case WINDOW_SIZE_XS:
            return window.innerWidth < BREAKPOINTS.screenXsMin;
            break;
          case WINDOW_SIZE_SM:
            return window.innerWidth < BREAKPOINTS.screenSmMin;
            break;
          case WINDOW_SIZE_MD:
            return window.innerWidth < BREAKPOINTS.screenMdMin;
            break;
          case WINDOW_SIZE_LG:
            return window.innerWidth < BREAKPOINTS.screenLgMin;
            break;
          default:
            return true;
        }
      },

      isWindowAboveBreakpoint: function(size) {
        switch(size) {
          case WINDOW_SIZE_XS:
            return window.innerWidth >= BREAKPOINTS.screenXsMin;
            break;
          case WINDOW_SIZE_SM:
            return window.innerWidth >= BREAKPOINTS.screenSmMin;
            break;
          case WINDOW_SIZE_MD:
            return window.innerWidth >= BREAKPOINTS.screenMdMin;
            break;
          case WINDOW_SIZE_LG:
            return window.innerWidth >= BREAKPOINTS.screenLgMin;
            break;
          default:
            return true;
        }
      },

      // Based on https://github.com/drudru/ansi_up/blob/v1.3.0/ansi_up.js#L93-L97
      // and https://github.com/angular/angular.js/blob/v1.5.8/src/ngSanitize/filter/linky.js#L131-L132
      // The AngularJS `linky` regex will avoid matching special characters like `"` at
      // the end of the URL.
      //
      // text:            The text to linkify. Assumes `text` is NOT HTML-escaped unless
      //                  `alreadyEscaped` is true.
      // target:          The optional link target (for instance, '_blank')
      // alreadyEscaped:  `true` if the text has already been HTML escaped
      //                  (like log content that has been run through ansi_up.ansi_to_html)
      //
      // Returns an HTML escaped string with http:// and https:// URLs changed to clickable links.
      linkify: function(text, target, alreadyEscaped) {
        if (!text) {
          return text;
        }

        // First HTML escape the content.
        if (!alreadyEscaped) {
          text = _.escape(text);
        }

        // Replace any URLs with links.
        return text.replace(/https?:\/\/[A-Za-z0-9._%+-]+\S*[^\s.;,(){}<>"\u201d\u2019]/gm, function(str) {
          if (target) {
            return "<a href=\"" + str + "\" target=\"" + target + "\">" + str + " <i class=\"fa fa-external-link\" aria-hidden=\"true\"></i></a>";
          }

          return "<a href=\"" + str + "\">" + str + "</a>";
        });
      }
    };
  });
