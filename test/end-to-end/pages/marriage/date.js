const { mockSession } = require('test/fixtures');
const pagePath = '/about-your-marriage/date-of-marriage-certificate';

function enterMarriageDate(day = mockSession.marriageDateDay.toString(),
  month = mockSession.marriageDateMonth.toString(),
  year = mockSession.marriageDateYear.toString()) {

  const I = this;
  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.retry(2).fillField('marriageDateDay', day);
  I.fillField('marriageDateMonth', month);
  I.fillField('marriageDateYear', year);
  I.navByClick('Continue');
}

async function enterMarriageDateCy(day = mockSession.marriageDateDay.toString(),
  month = mockSession.marriageDateMonth.toString(),
  year = mockSession.marriageDateYear.toString()) {

  const I = this;
  let pagePath = await I.getCurrentPageUrl();
  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);
  I.retry(2).fillField('marriageDateDay', day);
  I.fillField('marriageDateMonth', month);
  I.fillField('marriageDateYear', year);
  await I.navByClick('Parhau');
}

module.exports = { enterMarriageDate, enterMarriageDateCy };
