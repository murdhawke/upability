const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path'); 

(async () => {
  // Check if a URL argument is provided
  const domain = process.argv[2];
  if (!domain) {
    console.error('Please provide a site identifier as a command-line argument.');
    process.exit(1); // Exit with a non-zero code to indicate an error
  }

  const url = `https://notopening.com/site/${domain}`;

  try {
    // Launch headless browser
    const browser = await puppeteer.launch({
      executablePath:'/usr/bin/google-chrome',
      headless: true
     });
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    await page.waitForSelector('table.table', { timeout: 5000 });

  // Scrape data from the uptime history table
  const tableData = await page.evaluate(() => {
    const rows = document.querySelectorAll('table.table tr');
    return Array.from(rows).map(row => {
      const cells = row.querySelectorAll('td, th');
      return Array.from(cells).map(cell => cell.textContent.trim());
    });
  });

  // Convert table data to CSV format
  const csvData = tableData.map(row => row.join(',')).join('\n');

  // Define file path
  const filePath = path.join(__dirname, `${domain}`+'.csv');

  // Write CSV file
  fs.writeFileSync(filePath, csvData);

  console.log(`Scraping completed. Data saved to ${filePath}`);

  // Close the browser
  await browser.close();
} catch (error) {
  console.error('An error occurred:', error);
  process.exit(1); // Exit with a non-zero code to indicate an error
}
})();
