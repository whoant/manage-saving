const express = require('express');
const adminController = require('../controllers/admin');
const route = express.Router();

route.get('/home', adminController.getListUser);

module.exports = route;
