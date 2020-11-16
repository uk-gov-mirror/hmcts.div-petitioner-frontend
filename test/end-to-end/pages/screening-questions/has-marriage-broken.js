const contentEn = require('app/steps/screening-questions/has-marriage-broken/content.json').resources.en.translation.content;
const contentCy = require('app/steps/screening-questions/has-marriage-broken/content.json').resources.cy.translation.content;
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function haveBrokenMarriage(language = 'en') {

  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const marriageBrokenContent = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.seeInCurrentUrl('/screening-questions/has-marriage-broken');
  I.retry(2).click(marriageBrokenContent.yes);
  I.navByClick(commonContent.continue);
}

module.exports = { haveBrokenMarriage };
