import { HOST } from '../src/consts';
import { getAbsoluteUrl } from '../src/web';

describe('web stuff', () => {
  it('transform relative url to absolute', () => {
    const result = getAbsoluteUrl('/test/url');
    expect(result).toBe(`${HOST}/test/url`);
  });
});
