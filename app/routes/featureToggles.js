'use strict';

const router = require('express')
  .Router();

const featureToggle = new (require('app/core/utils/featureToggle'))();
const completeEqualityTask = require('app/middleware/completeEqualityTask');

router.all('/awaiting-amend', (req, res, next) => {
  return featureToggle.callCheckToggle(req, res, next, res.locals.launchDarkly, 'ft_awaiting_amend', featureToggle.toggleFeature, '/');
});

router.get('*', (req, res, next) => {
  return featureToggle.callCheckToggle(req, res, next, res.locals.launchDarkly, 'ft_welsh', featureToggle.toggleFeature);
});

router.get('/equality-and-diversity', (req, res, next) => {
  return featureToggle.callCheckToggle(req, res, next, res.locals.launchDarkly, 'ft_pcq', completeEqualityTask);
});

module.exports = router;
