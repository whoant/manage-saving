const express = require('express');
const staffController = require('../controllers/staff.controller');
const userController = require('../controllers/user.controller');
const accountController = require('../controllers/account.controller');
const saveAccountController = require('../controllers/savingAccount.controller');

const route = express.Router();

route.get('/', staffController.get);

route.get('/users', userController.get);

route.route('/users/create').get(userController.index).post(userController.createUser);

route.get('/users/:id_user/edit', userController.show);

route.put('/users/:id_user', userController.put);

route.put('/users/:id_user/password', userController.updatePassword);

route.get('/accounts/:id_user', accountController.show);

route.get('/accounts/:id_user/create', accountController.indexAccount);

route.post('/accounts/:id_user/create', accountController.createAccount);

route.get('/accounts/:id_user/detail/:id_account/download', accountController.downloadSavingBook);

route.get('/accounts/:id_user/detail/:id_account', accountController.getDetailAccount);

route.put('/accounts/:id_user/detail/:id_account', accountController.putDetailAccount);

route.get('/saving-account', saveAccountController.index);

route.post('/saving-account', saveAccountController.create);

module.exports = route;
