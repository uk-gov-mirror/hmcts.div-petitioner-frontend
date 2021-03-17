const content = require('app/steps/screening-questions/has-respondent-address/content').resources.en.translation.content;
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;
const CONF = require('config');
const idamConfigHelper = require('test/end-to-end/helpers/idamConfigHelper');
const parseBool = require('app/core/utils/parseBool');

function startApplication(
  language = 'en',
  ignoreIdamToggle = false,
  user = { username: idamConfigHelper.getTestEmail(), password: idamConfigHelper.getTestPassword() }//TODO - eventually, I might get rid of the whole idamConfigHelper method (at least for this purpose)
) {
  if (parseBool(CONF.features.idam) && !ignoreIdamToggle) {
    const commonContent = language === 'en' ? commonContentEn : commonContentCy;
    let I = this;

    // const username = user.username || idamConfigHelper.getTestEmail();
    // const password = user.password || idamConfigHelper.getTestPassword();
    I.fillField('username', user.username);//TODO - should these be passed as parameters?
    I.fillField('password', user.password);
    I.seeInCurrentUrl('/login?');
    I.navByClick(commonContent.signIn);//TODO - if I used html element here (or enter), I wouldn't need language
    I.wait(2);//TODO - why?
    //I could wait longer here, but probably not like this...
  }
}

async function startApplicationWith(sessionName) {

  let I = this;

  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveABasicSession(sessionName);
}

function* seeCookieBanner() {
  let I = this;

  yield I.waitForVisible('#global-cookie-message');
  I.see(content.cookie);
  I.see(content.cookieLink);
}

function* seeCookieFooter() {
  let I = this;

  yield I.waitForVisible('#footer');
  I.see('Cookies', '#footer a[href="/cookie"]');
}

function followCookieBannerLink(cookiePageLink) {
  let I = this;
  const cookieTitle = 'body h1';

  I.amOnLoadedPage(cookiePageLink);
  I.see('Cookies', cookieTitle);
}

function dontGetShownCookieBannerAgain() {
  let I = this;

  I.dontSee(content.cookie);
  I.dontSee(content.cookieLink);
}

function signOut() {
  let I = this;

  I.see(commonContentEn.signOut);
  I.navByClick(commonContentEn.signOut);
}

module.exports = {
  startApplication,
  startApplicationWith,
  seeCookieBanner,
  seeCookieFooter,
  followCookieBannerLink,
  dontGetShownCookieBannerAgain,
  signOut
};
