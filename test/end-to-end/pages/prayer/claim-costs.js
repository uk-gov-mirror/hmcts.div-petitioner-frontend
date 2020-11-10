const content = require('app/steps/prayer/claim-costs/content.json').resources.en.translation.content;
const pagePath = '/about-divorce/claim-costs';

function enterClaimCosts() {

  const I = this;

  I.waitInUrl(pagePath);
  I.seeCurrentUrlEquals(pagePath);
  I.checkOption(content.yes);
  I.navByClick('Continue');
}

function enterClaimCostsCorrespondent() {

  const I = this;

  I.waitInUrl(pagePath);
  I.seeCurrentUrlEquals(pagePath);
  I.checkOption(content.yes);
  I.checkOption( '#correspondent');
  I.navByClick('Continue');
}

module.exports = { enterClaimCosts, enterClaimCostsCorrespondent };
