const express = require('express');
const staffController = require('../controllers/staff.controller');
const userController = require('../controllers/user.controller');
const accountController = require('../controllers/account.controller');
const saveAccountController = require('../controllers/savingAccount.controller');

const route = express.Router();

route.get('/', staffController.get);

route.route('/info').get(staffController.getDetailPassword).post(staffController.updatePassword);

route.get('/users', userController.get);

route.route('/users/create').get(userController.index).post(userController.createUser);

route.get('/users/:id_user/edit', userController.show);

route.put('/users/:id_user', userController.put);

route.put('/users/:id_user/password', userController.updatePassword);

route.get('/accounts/:id_user', accountController.show);

route
    .route('/accounts/:id_user/create')
    .get(accountController.indexAccount)
    .post(accountController.createAccount);

route.get('/accounts/:id_user/detail/:id_account/download', accountController.downloadSavingBook);

route
    .route('/accounts/:id_user/detail/:id_account')
    .get(accountController.getDetailAccount)
    .put(accountController.putDetailAccount);

route.route('/saving-account').get(saveAccountController.index).post(saveAccountController.create);

module.exports = route;
