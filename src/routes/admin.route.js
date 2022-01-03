const express = require("express");
const adminController = require("../controllers/admin");
const route = express.Router();

route.get("/", adminController.home.get);

route.get("/user", adminController.user.getAll);

route.get("/user/:id/edit", adminController.user.getDetail);

route.put("/user/:id", adminController.user.updateUser);

route.route("/user/create").get(adminController.createUser.get).post(adminController.createUser.post);

route.get("/office", adminController.office.get);

route.get("/office/create", adminController.createOffice.get);

route.route("/office/create").get(adminController.createOffice.get).post(adminController.createOffice.post);


module.exports = route;
