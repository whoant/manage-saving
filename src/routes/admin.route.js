const express = require('express');
const adminController = require('../controllers/admin');
const route = express.Router();

route.get('/', adminController.home.get);

route.get('/user', adminController.user.getAll);

route.get('/user/:id/edit', adminController.user.getDetail);

route.put('/user/:id', adminController.user.updateUser);

route.get('/user/create', adminController.createUser.get);

route.post('/user/create', adminController.createUser.post);


route.get('/office', adminController.office.get);

route.get('/office/create', adminController.createOffice.get);

route.post('/office/create', adminController.createOffice.post);


module.exports = route;
