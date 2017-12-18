'use strict';

angular.module('openshiftCommonServices')
  .factory('ProjectsService',
           function($location,
                    $q,
                    $rootScope,
                    APIService,
                    AuthService,
                    AuthorizationService,
                    DataService,
                    Logger,
                    RecentlyViewedProjectsService,
                    annotationNameFilter) {

      // Cache project data when we can so we don't request it on every page load.
      var cachedProjectData;
      var cachedProjectDataIncomplete = false;
      var projectsVersion = APIService.getPreferredVersion('projects');
      var projectRequestsVersion = APIService.getPreferredVersion('projectrequests');

      var clearCachedProjectData = function() {
        Logger.debug('ProjectsService: clearing project cache');
        cachedProjectData = null;
        cachedProjectDataIncomplete = false;
      };

      AuthService.onUserChanged(clearCachedProjectData);
      AuthService.onLogout(clearCachedProjectData);

      var cleanEditableAnnotations = function(resource) {
        var paths = [
              annotationNameFilter('description'),
              annotationNameFilter('displayName')
            ];
        _.each(paths, function(path) {
          if(!resource.metadata.annotations[path]) {
            delete resource.metadata.annotations[path];
          }
        });
        return resource;
      };

      return {
        get: function(projectName, opts) {
          return  AuthService
                    .withUser()
                    .then(function() {
                      var context = {
                        // TODO: swap $.Deferred() for $q.defer()
                        projectPromise: $.Deferred(),
                        projectName: projectName,
                        project: undefined
                      };
                      return DataService
                              .get(projectsVersion, projectName, context, {errorNotification: false})
                              .then(function(project) {
                                return AuthorizationService
                                        .getProjectRules(projectName)
                                        .then(function() {
                                          context.project = project;
                                          context.projectPromise.resolve(project);
                                          RecentlyViewedProjectsService.addProjectUID(project.metadata.uid);
                                          if (cachedProjectData) {
                                            cachedProjectData.update(project, 'MODIFIED');
                                          }

                                          // TODO: fix need to return context & projectPromise
                                          return [project, context];
                                        });
                              }, function(e) {
                                context.projectPromise.reject(e);
                                if ((e.status === 403 || e.status === 404) && _.get(opts, 'skipErrorNotFound')) {
                                  return $q.reject({notFound: true});
                                }
                                var description = 'The project could not be loaded.';
                                var type = 'error';
                                if(e.status === 403) {
                                  description = 'The project ' + context.projectName + ' does not exist or you are not authorized to view it.';
                                  type = 'access_denied';
                                } else if (e.status === 404) {
                                  description = 'The project ' + context.projectName + ' does not exist.';
                                  type = 'not_found';
                                }
                                $location
                                  .url(
                                    URI('error')
                                      .query({
                                        "error" : type,
                                        "error_description": description
                                      })
                                      .toString());
                                return $q.reject();
                              });
                    });
          },

          // List the projects the user has access to. This method returns
          // cached data if the projects had previously been fetched to avoid
          // requesting them again and again, which is a problem for admins who
          // might have hundreds or more.
          list: function(forceRefresh) {
            if (cachedProjectData && !forceRefresh) {
              Logger.debug('ProjectsService: returning cached project data');
              return $q.when(cachedProjectData);
            }

            Logger.debug('ProjectsService: listing projects, force refresh', forceRefresh);
            return DataService.list(projectsVersion, {}).then(function(projectData) {
              cachedProjectData = projectData;
              return projectData;
            }, function(error) {
              // If the request fails, don't try to list projects again without `forceRefresh`.
              cachedProjectData = DataService.createData([]);
              cachedProjectDataIncomplete = true;
              return $q.reject();
            });
          },

          isProjectListIncomplete: function() {
            return cachedProjectDataIncomplete;
          },

          watch: function(context, callback) {
            // Wrap `DataService.watch` so we can update the cached projects
            // list on changes. TODO: We might want to disable watches entirely
            // if we know the project list is large.
            return DataService.watch(projectsVersion, context, function(projectData) {
              cachedProjectData = projectData;
              callback(projectData);
            });
          },

          update: function(projectName, data) {
            return DataService.update(projectsVersion, projectName, cleanEditableAnnotations(data), {
              projectName: projectName
            }, {
              errorNotification: false
            }).then(function(updatedProject) {
              if (cachedProjectData) {
                cachedProjectData.update(updatedProject, 'MODIFIED');
              }

              return updatedProject;
            });
          },

          create: function(name, displayName, description) {
            var projectRequest = {
              apiVersion: "v1",
              kind: "ProjectRequest",
              metadata: {
                name: name
              },
              displayName: displayName,
              description: description
            };
            return DataService
              .create(projectRequestsVersion, null, projectRequest, {})
              .then(function(project) {
                RecentlyViewedProjectsService.addProjectUID(project.metadata.uid);
                if (cachedProjectData) {
                  cachedProjectData.update(project, 'ADDED');
                }
                return project;
              });
          },

          canCreate: function() {
            return DataService.get(projectRequestsVersion, null, {}, { errorNotification: false});
          },

          delete: function(project) {
            return DataService.delete(projectsVersion, project.metadata.name, {}).then(function(deletedProject) {
              if (cachedProjectData) {
                cachedProjectData.update(project, 'DELETED');
              }

              return deletedProject;
            });
          }
        };
    });
