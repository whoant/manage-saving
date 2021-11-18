const express = require('express');
const authController = require('../controllers/auth');
const route = express.Router();

route.get('/login', authController.login.get);
route.post('/login', authController.login.post);

module.exports = route;
