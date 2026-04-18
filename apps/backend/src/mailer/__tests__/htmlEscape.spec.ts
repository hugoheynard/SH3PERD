import { htmlEscape } from '../templates/htmlEscape.js';

describe('htmlEscape', () => {
  it('escapes & first to avoid double-escaping downstream entities', () => {
    expect(htmlEscape('a & b')).toBe('a &amp; b');
    expect(htmlEscape('&lt;')).toBe('&amp;lt;');
  });

  it('escapes the five characters that matter for text+attributes', () => {
    expect(htmlEscape('<script>"\'&</script>')).toBe(
      '&lt;script&gt;&quot;&#39;&amp;&lt;/script&gt;',
    );
  });

  it('leaves safe characters untouched', () => {
    expect(htmlEscape('Hello, world 123')).toBe('Hello, world 123');
  });

  it('is idempotent on already-safe text', () => {
    const safe = 'plain text';
    expect(htmlEscape(htmlEscape(safe))).toBe(safe);
  });

  it('returns empty string unchanged', () => {
    expect(htmlEscape('')).toBe('');
  });
});
