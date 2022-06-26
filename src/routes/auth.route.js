const express = require('express');
const authController = require('../controllers/auth.controller');
const managerController = require("../controllers/manager.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const route = express.Router();

route.get('/', authController.get);
route.post('/', authController.post);
route.get('/logout', authController.logout);

route.get('/info', authMiddleware.requireAuth, authController.getDetailPassword);
route.post('/info', authMiddleware.requireAuth, authController.updatePassword);


module.exports = route;
