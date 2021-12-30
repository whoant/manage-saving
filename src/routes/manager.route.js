const express = require('express');
const managerController = require('../controllers/manager.controller');
const route = express.Router();

route.get('/', managerController.index);

route
    .route('/interest')
    .get(managerController.indexInterest)
    .post(managerController.createInterest);

route.route('/periods').get(managerController.indexPeriods).post(managerController.createPeriods);

module.exports = route;
