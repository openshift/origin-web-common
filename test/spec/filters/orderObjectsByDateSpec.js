describe("Filter: orderObjectsByDate", function() {
  'use strict';

  var orderObjectsByDateFilter;

  beforeEach(inject(function (_orderObjectsByDateFilter_) {
    orderObjectsByDateFilter = _orderObjectsByDateFilter_;
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

  it('should order the objects by date', function() {
    var objects = [ newer, older, evenNewer ];
    var orderObjectsByDate = orderObjectsByDateFilter(objects);
    expect(orderObjectsByDate).toEqual([ older, newer, evenNewer ]);
  });

  it('should reverse the ordering', function() {
    var objects = [ newer, older, evenNewer ];
    var orderObjectsByDate = orderObjectsByDateFilter(objects, true);
    expect(orderObjectsByDate).toEqual([ evenNewer, newer, older ]);
  });
});
