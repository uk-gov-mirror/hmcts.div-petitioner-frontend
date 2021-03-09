const ValidationStep = require('app/core/steps/ValidationStep');
const { get, find, isEqual } = require('lodash');
const logger = require('app/services/logger').logger(__filename);
const {
  UserAction,
  validateSearchRequest,
  validateUserData,
  fetchAndAddOrganisations,
  hasBeenPostedWithoutSubmitButton
} = require('app/core/utils/respondentSolicitorSearchHelper');

module.exports = class RespondentCorrespondenceSolicitorSearch extends ValidationStep {
  get url() {
    return '/petitioner-respondent/correspondence/solicitor-search';
  }

  get nextStep() {
    return this.steps.ReasonForDivorce;
  }

  async handler(req, res) {
    if (hasBeenPostedWithoutSubmitButton(req)) {
      const { body } = req;
      const searchCriteria = get(body, 'respondentSolicitorFirm');
      const [isValid, errors] = validateSearchRequest(searchCriteria, this.content, req.session);

      req.session.respondentSolicitorFirmError = null;
      req.session.respondentSolicitorNameError = null;

      if (!isValid) {
        req.session.respondentSolicitorFirmError = errors;
        return res.redirect(this.url);
      }
      const userAction = get(body, 'userAction');

      if (isEqual(userAction, UserAction.MANUAL)) {
        logger.infoWithReq(null, 'solicitor_search', 'Manual solicitor search, redirecting to solicitor detail page.');
        this.manualSelectionCleanup(req);
        return res.redirect(this.steps.RespondentSolicitorDetails.url);
      }

      if (isEqual(userAction, UserAction.SELECTION)) {
        logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, user has selected an organisation');
        req.session.respondentSolicitorOrganisation = find(req.session.organisations, organisation => {
          return isEqual(organisation.organisationIdentifier, get(body, 'userSelection'));
        });
      }

      if (isEqual(userAction, UserAction.DESELECTION)) {
        logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, user has deselected option');
        this.deselectionCleanup(req);
      }

      if (isEqual(userAction, UserAction.SEARCH)) {
        const requestSucceeded = await fetchAndAddOrganisations(req);
        if (requestSucceeded) {
          logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, request complete');
        }
      }

      if (isEqual(userAction, UserAction.PROVIDED)) {
        const [isValidated, error] = validateUserData(this.content, req, userAction);
        if (!isValidated) {
          req.session.respondentSolicitorNameError = error;
          return res.redirect(this.url);
        }
        return super.handler(req, res);
      }

      logger.infoWithReq(null, 'solicitor_search', 'Solicitor search, staying on same page');
      return res.redirect(this.url);
    }

    return super.handler(req, res);
  }

  deselectionCleanup(req) {
    req.session.respondentSolicitorOrganisation = null;
    req.session.respondentSolicitorFirmError = null;
  }

  manualSelectionCleanup(req) {
    req.session.respondentSolicitorOrganisation = null;
    req.session.respondentSolicitorFirmError = null;
    req.session.organisations = null;
  }
};
