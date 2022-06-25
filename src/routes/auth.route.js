const express = require('express');
const authController = require('../controllers/auth.controller');
const route = express.Router();

route.get('/', authController.get);
route.post('/', authController.post);
route.get('/logout', authController.logout);

module.exports = route;
