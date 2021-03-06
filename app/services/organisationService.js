const OrganisationClient = require('@hmcts/prd-client').OrganisationClient;
const mockedClient = require('app/services/mocks/organisationServiceClient');

let client = {};

const hasMandatoryTokens = (authToken, serviceToken) => {
  return (authToken && serviceToken);
};

const service = {
  /**
   * Requests all organisations that match param organisationName
   * @param {String} status status of organisations i.e active
   * @param {String} organisationName name of the organisation to filter results on
   * @returns {Promise}
   */
  getOrganisationByName: (status, organisationName) => {
    return client.getOrganisationByName(status, organisationName);
  }
};

module.exports = {
  setup: (auth, serviceAuth) => {
    // Use the mock client if the microservice key is not set.
    client = hasMandatoryTokens(auth, serviceAuth) ? new OrganisationClient(auth, serviceAuth) : mockedClient;

    return service;
  }
};