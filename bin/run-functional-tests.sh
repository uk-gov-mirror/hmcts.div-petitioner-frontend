#!/bin/bash
set -ex

# Setup required environment variables. TEST_URL should be set by CNP
export E2E_FRONTEND_URL=${TEST_URL}
export E2E_FRONTEND_NODE_ENV=${E2E_FRONTEND_NODE_ENV:-"production"}
export IDAM_API_URL=${IDAM_API_URL:-"https://idam-api.aat.platform.hmcts.net"}
export COURT_PHONENUMBER_EN=${COURT_PHONENUMBER_EN:-"0300 303 0642"}
export COURT_OPENINGHOURS_EN=${COURT_OPENINGHOURS_EN:-"Monday to Friday, 8am to 8pm, Saturday 8am to 2pm"}
export COURT_EMAIL=${COURT_EMAIL:-"contactdivorce@justice.gov.uk"}
export E2E_WAIT_FOR_TIMEOUT_VALUE=${E2E_WAIT_FOR_TIMEOUT_VALUE:-40000}
export E2E_WAIT_FOR_ACTION_VALUE=${E2E_WAIT_FOR_ACTION_VALUE:-250}
export CODECEPT_PARAMS=${CODECEPT_PARAMS:-""}

yarn test-e2e ${CODECEPT_PARAMS}
