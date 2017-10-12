describe("Filter: highlightKeywords", function() {
  'use strict';

  var highlightKeywordsFilter, KeywordService;

  beforeEach(inject(function (_highlightKeywordsFilter_, _KeywordService_) {
    highlightKeywordsFilter = _highlightKeywordsFilter_;
    KeywordService = _KeywordService_;
  }));

  it('should return escaped HTML', function() {
    var original = 'test <script>alert("test")</sciprt>';
    var result = highlightKeywordsFilter(original, [], false);
    expect(result).not.toContain('<script>');

    var keywords = KeywordService.generateKeywords('test');
    result = highlightKeywordsFilter(original, keywords, false);
    expect(result).not.toContain('<script>');
  });

  it('should mark keywords', function() {
    var original = 'my test value';
    var keywords = KeywordService.generateKeywords('test');
    var result = highlightKeywordsFilter(original, keywords, false);
    expect(result).toContain('<mark>test</mark>');
  });

  it('should mark multiple keywords', function() {
    var original = 'foo: and bar';
    var keywords = KeywordService.generateKeywords('foo bar baz');
    var result = highlightKeywordsFilter(original, keywords, false);
    expect(result).toContain('<mark>foo</mark>');
    expect(result).toContain('<mark>bar</mark>');
  });

  it('should not add mark tags when no matches', function() {
    var original = 'foo: and bar';
    var keywords = KeywordService.generateKeywords('no matches');
    var result = highlightKeywordsFilter(original, keywords, false);
    expect(result).not.toContain('<mark>');
  });

  it('should handle null, undefined, and empty values', function() {
    var result = highlightKeywordsFilter(null);
    expect(result).toBeNull();
    result = highlightKeywordsFilter();
    expect(result).toBeUndefined();
    result = highlightKeywordsFilter('');
    expect(result).toBe('');
  });
});
