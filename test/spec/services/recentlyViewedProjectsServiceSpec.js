"use strict";

describe("RecentlyViewedProjectsService", function(){
  var RecentlyViewedProjectsService;

  beforeEach(function(){
    inject(function(_RecentlyViewedProjectsService_){
      RecentlyViewedProjectsService = _RecentlyViewedProjectsService_;
    });
  });

  afterEach(function(){
    RecentlyViewedProjectsService.clear();
  });

  it('should retrieve projects as Last-In-First-Out', function() {
    RecentlyViewedProjectsService.addProjectUID("001");
    RecentlyViewedProjectsService.addProjectUID("002");
    RecentlyViewedProjectsService.addProjectUID("003");

    var recentlyViewed = RecentlyViewedProjectsService.getProjectUIDs();

    expect(recentlyViewed.length).toEqual(3);
    expect(recentlyViewed[0]).toEqual('003');
    expect(recentlyViewed[1]).toEqual('002');
    expect(recentlyViewed[2]).toEqual('001');
  });

  it('should limit recently viewed projects to 5', function() {
    RecentlyViewedProjectsService.addProjectUID("001");
    RecentlyViewedProjectsService.addProjectUID("002");
    RecentlyViewedProjectsService.addProjectUID("003");
    RecentlyViewedProjectsService.addProjectUID("004");
    RecentlyViewedProjectsService.addProjectUID("005");
    RecentlyViewedProjectsService.addProjectUID("006");
    RecentlyViewedProjectsService.addProjectUID("007");

    var recentlyViewed = RecentlyViewedProjectsService.getProjectUIDs();
    expect(recentlyViewed.length).toEqual(5);
  });

  it('should move an already recently viewed project to first in list', function() {
    RecentlyViewedProjectsService.addProjectUID("001");
    RecentlyViewedProjectsService.addProjectUID("002");
    RecentlyViewedProjectsService.addProjectUID("003");  // '003' in list
    RecentlyViewedProjectsService.addProjectUID("004");
    RecentlyViewedProjectsService.addProjectUID("003");  // '003' should be first and not added twice

    // LIFO should be 003, 004, 002, 001
    var recentlyViewed = RecentlyViewedProjectsService.getProjectUIDs();
    expect(recentlyViewed.length).toEqual(4);
    expect(recentlyViewed[0]).toEqual('003');
    expect(recentlyViewed[3]).toEqual('001');
  });

  it('should orderByMostRecentlyViewed', function() {
    // simulates a project list sorted by creationTimestamp, where projects created
    // in order 1-5, 5 being the most recently created.
    var projects = [
      {"metadata": {"uid": "005", "creationTimestamp": "2017-05-21T20:52:10Z"}},
      {"metadata": {"uid": "004", "creationTimestamp": "2017-04-21T20:52:10Z"}},
      {"metadata": {"uid": "003", "creationTimestamp": "2017-03-21T20:52:10Z"}},
      {"metadata": {"uid": "002", "creationTimestamp": "2017-02-21T20:52:10Z"}},
      {"metadata": {"uid": "001", "creationTimestamp": "2017-01-21T20:52:10Z"}}
    ];

    // simulates projects 1,3,4 being most recently viewed
    RecentlyViewedProjectsService.addProjectUID("007"); // simulate a recently viewed which is not in project list (diff user)
    RecentlyViewedProjectsService.addProjectUID("001");
    RecentlyViewedProjectsService.addProjectUID("003");
    RecentlyViewedProjectsService.addProjectUID("004");

    var recentlyViewed = RecentlyViewedProjectsService.getProjectUIDs();
    expect(recentlyViewed.length).toEqual(4);
    expect(recentlyViewed[0]).toEqual('004');
    expect(recentlyViewed[1]).toEqual('003');
    expect(recentlyViewed[2]).toEqual('001');
    expect(recentlyViewed[3]).toEqual('007');

    var sortedProjects = RecentlyViewedProjectsService.orderByMostRecentlyViewed(projects);

    var expectedSort = [
      {"metadata": {"uid": "004", "creationTimestamp": "2017-04-21T20:52:10Z"}},
      {"metadata": {"uid": "003", "creationTimestamp": "2017-03-21T20:52:10Z"}},
      {"metadata": {"uid": "001", "creationTimestamp": "2017-01-21T20:52:10Z"}},
      {"metadata": {"uid": "005", "creationTimestamp": "2017-05-21T20:52:10Z"}},
      {"metadata": {"uid": "002", "creationTimestamp": "2017-02-21T20:52:10Z"}}
    ];

    expect(sortedProjects).toEqual(expectedSort);
  });
});
