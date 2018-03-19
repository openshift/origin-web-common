describe('KeywordService', function() {
  'use strict';

  var KeywordService;
  beforeEach(function() {
    inject(function(_KeywordService_) {
      KeywordService = _KeywordService_;
    });
  });

  describe('#generateKeywords', function() {
    it('should return an empty array if filter text is undefined', function() {
      var result = KeywordService.generateKeywords();
      return expect(result).toEqual([]);
    });

    it('should return an empty array if filter text is null', function() {
      var result = KeywordService.generateKeywords(null);
      return expect(result).toEqual([]);
    });

    it('should return an empty array if filter text is the empty string', function() {
      var result = KeywordService.generateKeywords('');
      return expect(result).toEqual([]);
    });

    it('should return an empty array if filter text has only whitespace', function() {
      var result = KeywordService.generateKeywords(' \n\t');
      return expect(result).toEqual([]);
    });

    it('should tokenize by whitespace', function() {
      var result = KeywordService.generateKeywords('  foo bar\nbaz\tqux');
      return expect(result.length).toEqual(4);
    });

    it('should remove duplicate keywords', function() {
      var result = KeywordService.generateKeywords('foo foo');
      return expect(result.length).toEqual(1);
    });
  });

  describe('#filterForKeywords', function() {
    var mockData = [{
      metadata: {
        name: 'project1',
        annotations: {
          'openshift.io/display-name': 'My Project',
          'openshift.io/requester': 'developer'
        }
      }
    }, {
      metadata: {
        name: 'project2',
        annotations: {
          'openshift.io/display-name': 'Another Project',
          'openshift.io/description': 'Lorem ipsum...'
        }
      }
    }];

    var filterFields = [
      'metadata.name',
      'metadata.annotations["openshift.io/display-name"]',
      'metadata.annotations["openshift.io/description"]',
      'metadata.annotations["openshift.io/requester"]'
    ];

    it('should find matches with a single keyword', function() {
      var keywords = KeywordService.generateKeywords('my');
      var result = KeywordService.filterForKeywords(mockData, filterFields, keywords);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual(mockData[0]);
    });

    it('should find matches with multiple keywords', function() {
      var keywords = KeywordService.generateKeywords('lorem ipsum');
      var result = KeywordService.filterForKeywords(mockData, filterFields, keywords);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual(mockData[1]);
    });

    it('should find matches across different fields', function() {
      var keywords = KeywordService.generateKeywords('another lorem');
      var result = KeywordService.filterForKeywords(mockData, filterFields, keywords);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual(mockData[1]);
    });

    it('should match all keywords', function() {
      var keywords = KeywordService.generateKeywords('my notfound');
      var result = KeywordService.filterForKeywords(mockData, filterFields, keywords);
      expect(result.length).toBe(0);
    });

    it('should handle maps', function() {
      var keywords = KeywordService.generateKeywords('my');
      // Convert items from an array to a map.
      var projectsByName = _.keyBy(mockData, 'metadata.name');
      var result = KeywordService.filterForKeywords(projectsByName, filterFields, keywords);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual(mockData[0]);
    });

    it('should return the original collection if keywords are null', function() {
      var result = KeywordService.filterForKeywords(mockData, filterFields);
      expect(result).toEqual(mockData);
    });
  });

  describe('#weightedSearch', function() {
    var mockData = {
      'sample-app': {
        metadata: {
          name: 'sample-app',
          annotations: {
            'openshift.io/display-name': 'Sample App',
            'openshift.io/description': 'Sample app that uses Maria'
          }
        }
      },
      'maria-db': {
        metadata: {
          name: 'maria-db',
          annotations: {
            'openshift.io/display-name': 'Maria DB'
          }
        }
      },
      'mongo-db': {
        metadata: {
          name: 'mongo-db',
          annotations: {
            'openshift.io/display-name': 'Mongo DB',
            tags: 'db'
          }
        }
      }
    };

    it('should honor field weights', function() {
      var keywords = KeywordService.generateKeywords('maria');
      var result = KeywordService.weightedSearch(mockData, [{
        path: 'metadata.annotations["openshift.io/display-name"]',
        weight: 10
      }, {
        path: 'metadata.annotations["openshift.io/description"]',
        weight: 2
      }], keywords);
      expect(result).toEqual([ mockData['maria-db'], mockData['sample-app'] ]);
    });

    it('should weight multiple matches higher', function() {
      var keywords = KeywordService.generateKeywords('db');
      var result = KeywordService.weightedSearch(mockData, [{
        path: 'metadata.annotations["openshift.io/display-name"]',
        weight: 10
      }, {
        path: 'metadata.annotations.tags',
        weight: 2
      }], keywords);
      expect(result).toEqual([ mockData['mongo-db'], mockData['maria-db'] ]);
    });

    it('should match all keywords', function() {
      var keywords = KeywordService.generateKeywords('maria db');
      var result = KeywordService.weightedSearch(mockData, [{
        path: 'metadata.annotations["openshift.io/display-name"]',
        weight: 10
      }, {
        path: 'metadata.annotations["openshift.io/description"]',
        weight: 2
      }], keywords);
      expect(result).toEqual([ mockData['maria-db'] ]);
    });

    it('should return an empty array when no keywords', function() {
      var result = KeywordService.weightedSearch(mockData, [{
        path: 'metadata.annotations["openshift.io/display-name"]',
        weight: 10
      }, {
        path: 'metadata.annotations["openshift.io/description"]',
        weight: 2
      }], []);
      expect(result.length).toEqual(0);
    });

    it('should return an empty array when no matches', function() {
      var keywords = KeywordService.generateKeywords('MISSING');
      var result = KeywordService.weightedSearch(mockData, [{
        path: 'metadata.annotations["openshift.io/display-name"]',
        weight: 10
      }, {
        path: 'metadata.annotations["openshift.io/description"]',
        weight: 2
      }], keywords);
      expect(result.length).toEqual(0);
    });
  });
});
