const cheerio = require('cheerio');
const fs = require('fs');

const distPath = './dist/invoice';
const deployPath = '../dist/invoice.html';
const deployLicenses = '../dist/3rdpartylicenses.txt';

if (fs.existsSync(deployLicenses)) fs.unlinkSync(deployLicenses);
fs.copyFileSync(`${distPath}/3rdpartylicenses.txt`, deployLicenses);

if (fs.existsSync(deployPath)) fs.unlinkSync(deployPath);
const $ = cheerio.load(fs.readFileSync(`${distPath}/index.html`));

const styles = $('head link[rel="stylesheet"]');
$('head').append(`<style>${fs.readFileSync(`${distPath}/${styles.attr('href')}`)}</style>`);
styles.remove();

$('body script').each((x, y) => {
  $(y).html(fs.readFileSync(`${distPath}/${$(y).attr('src')}`));
  $(y).removeAttr('src');
  $(y).removeAttr('type');
});

fs.writeFileSync(deployPath, $.html());
