const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');
const { URL } = require('url');

async function launchChromeAndRunLighthouse(url) {
  const browser = await puppeteer.launch({
    defaultViewport: null
  });

  // lhr contains all sorts, like screen shots etc...
  const { lhr } = await lighthouse(url, {
    port: new URL(browser.wsEndpoint()).port,
    output: 'json',
    logLevel: null
  });

  const results = Object.values(lhr.categories).reduce(
    (all, c) => Object.assign(all, { [c.id]: Math.round(c.score * 100) }),
    {}
  );

  await browser.close();
  return results;
}

/** Usage */
// launchChromeAndRunLighthouse('https://guide.freecodecamp.org').then((results) => {
//   console.log(results);
// });


module.exports = launchChromeAndRunLighthouse;
