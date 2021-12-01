const express = require('express');
const managerController = require('../controllers/manager.controller');
const route = express.Router();

route.get('/', managerController.index);

route.get('/interest', managerController.indexInterest);

route.post('/interest', managerController.createInterest);

route.get('/periods', managerController.indexPeriods);

route.post('/periods', managerController.createPeriods);

module.exports = route;
