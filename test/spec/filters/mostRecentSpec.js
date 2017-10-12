describe("Filter: mostRecent", function() {
  'use strict';

  var mostRecentFilter;

  beforeEach(inject(function (_mostRecentFilter_) {
    mostRecentFilter = _mostRecentFilter_;
  }));

  var olderDate = new Date('Wed, 14 Jun 2017 00:00:00 PDT').toISOString();
  var newerDate = new Date('Thu, 15 Jun 2017 00:00:00 PDT').toISOString();
  var evenNewerDate = new Date('Fri, 16 Jun 2017 00:00:00 PDT').toISOString();

  var mockObjectWithDate = function(dateString) {
    return {
      metadata: {
        name: _.uniqueId('object-'),
        creationTimestamp: dateString
      }
    };
  };

  var older = mockObjectWithDate(olderDate);
  var newer = mockObjectWithDate(newerDate);
  var evenNewer = mockObjectWithDate(evenNewerDate);

  it('should find the most recent resource', function() {
    var objects = [ newer, older, evenNewer ];
    var mostRecent = mostRecentFilter(objects);
    expect(mostRecent).toEqual(evenNewer);
  });

  it('should find the most recent resource in a map', function() {
    var objects = [ newer, older, evenNewer ];
    var objectsByName = _.keyBy(objects, 'metadata.name');
    var mostRecent = mostRecentFilter(objectsByName);
    expect(mostRecent).toEqual(evenNewer);
  });

  it('should return null for an empty array', function() {
    var mostRecent = mostRecentFilter([]);
    expect(mostRecent).toBeNull();
  });

  it('should return null for undefined input', function() {
    var mostRecent = mostRecentFilter();
    expect(mostRecent).toBeNull();
  });

  it('should skip null items', function() {
    var objects = [ newer, null, older, evenNewer ];
    var mostRecent = mostRecentFilter(objects);
    expect(mostRecent).toEqual(evenNewer);
  });
});
