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
});
