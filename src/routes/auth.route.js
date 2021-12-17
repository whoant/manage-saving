const express = require('express');
const authController = require('../controllers/auth.controller');
const route = express.Router();

route.get('/', authController.get);
route.post('/', authController.post);
route.delete('/', authController.delete);

module.exports = route;
