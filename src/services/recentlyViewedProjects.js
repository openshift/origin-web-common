'use strict';

angular.module("openshiftCommonServices")
  .service("RecentlyViewedProjectsService", function($filter){

    var recentlyViewedProjsKey = "openshift/recently-viewed-project-uids";

    var getProjectUIDs = function() {
      var recentlyViewed = localStorage.getItem(recentlyViewedProjsKey);
      return recentlyViewed ? JSON.parse(recentlyViewed) : [];
    };

    var addProjectUID = function(uid) {
      var recentlyViewed = getProjectUIDs();

      // add to front of list
      recentlyViewed.unshift(uid);

      // no dups
      recentlyViewed = _.uniq(recentlyViewed);

      // limit to 5 items
      recentlyViewed = _.take(recentlyViewed, 5);

      setRecentlyViewedProjects(recentlyViewed);
    };

    var clear = function() {
      localStorage.removeItem(recentlyViewedProjsKey);
    };

    var setRecentlyViewedProjects = function(recentlyViewed) {
      localStorage.setItem(recentlyViewedProjsKey, JSON.stringify(recentlyViewed));
    };

    var orderByMostRecentlyViewed = function(projects) {
      var recentlyViewedProjects = [];
      var recentlyViewedIds = getProjectUIDs();

      // remove mostRecentlyViewed projects
      _.each(recentlyViewedIds, function(uid) {
        var proj = _.remove(projects, function(project) {
          return project.metadata.uid === uid;
        })[0];
        if(proj !== undefined) {
          recentlyViewedProjects.push(proj);
        }
      });

      // second sort by case insensitive displayName
      projects = _.sortBy(projects, function(project) {
        return $filter('displayName')(project).toLowerCase();
      });

      return recentlyViewedProjects.concat(projects);
    };

    var isRecentlyViewed = function(uid) {
      return _.includes(getProjectUIDs(), uid);
    };

    return {
      getProjectUIDs: getProjectUIDs,
      addProjectUID: addProjectUID,
      orderByMostRecentlyViewed: orderByMostRecentlyViewed,
      clear: clear,
      isRecentlyViewed: isRecentlyViewed
    };
  });
