const express = require('express');
const managerController = require('../controllers/manager.controller');
const route = express.Router();

route.get('/', managerController.index);

module.exports = route;
