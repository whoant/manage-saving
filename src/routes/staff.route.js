const express = require('express');
const staffController = require('../controllers/staff.controller');
const userController = require('../controllers/user.controller');

const route = express.Router();

route.get('/', staffController.get);

route.get('/users', userController.get);

route.get('/users/create', userController.create);

route.post('/users/create', userController.createUser);

route.get('/users/:id_user/edit', userController.show);

route.put('/users/:id_user', userController.put);

module.exports = route;
