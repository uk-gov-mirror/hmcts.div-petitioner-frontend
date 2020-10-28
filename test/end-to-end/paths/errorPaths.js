Feature('Invalid Paths Handling @functional').retry(3);

Scenario('Incorrect URLs are served a 404 page', (I) => {

  I.amOnLoadedPage('/index');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/nonExistentURL');
  I.see('Page not found', 'h1');

});

Scenario('Redirects to login page on AAT OR cookie error page for PR build on application start and clear cookies', async (I) => {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.clearCookie();
  //This simulates a situation where the browser has no cookies even after the middleware tried to set one for testing whether the browser accepts cookies
  I.amOnLoadedPage('/authenticated?attemptToSetTestCookie=true');

  let previewUrl = await I.grabCurrentUrl();
  let splitPath = previewUrl.split('-')[5];
  let urlContainsPreview = splitPath.split('.');

  if(urlContainsPreview[0] === 'preview'){
    I.seeCurrentUrlEquals('/cookie-error');
  }
  else{I.seeInCurrentUrl('/cookie-error');}

});

Scenario('check cookie error page exists', (I) => {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.amOnLoadedPage('/cookie-error');
  I.see('You must have cookies enabled in your web browser to use this service.');
});
