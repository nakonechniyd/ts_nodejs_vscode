import { getUserAgent } from '../src/userAgent';

describe('user agent', () => {
  it('randomize user agents', () => {
    const set = new Set([
      getUserAgent(),
      getUserAgent(),
      getUserAgent(),
    ]);
    expect(set.size).toBeGreaterThan(1);
  });
});
