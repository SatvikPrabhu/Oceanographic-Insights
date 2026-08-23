import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    errors.push(err.toString());
  });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 30000 });
  
  if (errors.length > 0) {
    console.log('BROWSER ERRORS FOUND:');
    errors.forEach(e => console.log(e));
    process.exit(1);
  } else {
    console.log('NO BROWSER ERRORS.');
    process.exit(0);
  }
  await browser.close();
})();
