import axios from 'axios';
import { select } from 'xpath';
import { DOMParser } from 'xmldom';

import { getUserAgent } from './userAgent';
import { getAbsoluteUrl } from './web';

export const URLS = [
  // long way
  'https://www.anibis.ch/de/c/haushalt-wohnen',
  'https://www.anibis.ch/de/c/handwerk-garten',
  'https://www.anibis.ch/de/c/sport-freizeit',
  'https://www.anibis.ch/de/c/kind-baby',
  'https://www.anibis.ch/de/c/kleidung-accessoires',
  // short way
  // 'https://www.anibis.ch/de/c/haushalt-wohnen-badezimmer',
];

const XPATH_EXP = '//ul[@class="sc-1ovhdji-0 sc-177mb2p-0 jbsqEC kzlJDO"]//a/@href';

async function getResponse(url: string): Promise<string> {
  // liveliness probe
  console.log(url);

  const headers = {
    'User-Agent': getUserAgent(),
  };

  const resp = await axios.get(url, { headers });
  return resp.data as string;
}

interface Node {
  value: string;
}

function parse(html: string): Node[] {
  const doc = new DOMParser({
    errorHandler: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      warning() {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      error() {},
      fatalError(e: Error) {
        console.error(e);
      },
    },
  }).parseFromString(html);
  const nodes = select(XPATH_EXP, doc) as Node[];
  return nodes;
}

async function walk(url: string): Promise<{ [x: string]: Record<string, unknown> }> {
  const result = { [url]: {} };

  const html = await getResponse(url);
  const hrefs = parse(html);
  if (hrefs.length === 1) {
    return result;
  }

  const newUrls = hrefs
    .map((href) => getAbsoluteUrl(href.value).toLowerCase())
    .filter((hrefAbsolute) => url !== hrefAbsolute);

  const subResults = await Promise.all(
    newUrls.map((newUrl) => walk(newUrl)),
  );
  subResults.forEach((subResult) => {
    Object.assign(result[url], subResult);
  });

  return result;
}

async function main() {
  const results = await Promise.all(
    URLS.map((url) => walk(url)),
  );
  const tree = {};
  results.forEach((result) => {
    Object.assign(tree, result);
  });
  console.log(JSON.stringify(tree, null, 4));
}

await(async function () {
  await main();
})();
