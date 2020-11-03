const content = require('app/steps/legal/legal-proceedings/content.json').resources.en.translation.content;
const contentCy = require('app/steps/legal/legal-proceedings/content.json').resources.cy.translation.content;
const { mockSession } = require('test/fixtures');
const pagePath = '/about-divorce/legal-proceedings';

function enterLegalProceedings() {

  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);

  I.click('#legalProceedings_' + content.yes);
  I.checkOption(mockSession.legalProceedingsRelated[0]);
  I.fillField('legalProceedingsDetails', mockSession.legalProceedingsDetails);
  I.navByClick('Continue');
}

function enterLegalProceedingsCy() {

  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);

  I.click('#legalProceedings_' + contentCy.yes);
  I.checkOption(mockSession.legalProceedingsRelated[0]);
  I.fillField('legalProceedingsDetails', mockSession.legalProceedingsDetails);
  I.navByClick('Parhau');
}

module.exports = { enterLegalProceedings, enterLegalProceedingsCy };
