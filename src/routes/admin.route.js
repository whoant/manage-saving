const express = require("express");
const adminController = require("../controllers/admin.controller");
const officeController = require("../controllers/office.controller");
const personnelController = require("../controllers/personnel.controller");
const route = express.Router();

route.get("/", adminController.index);

route.route("/info").get(adminController.getFormChangePass).post(adminController.updatePass);

route.get("/personnel", personnelController.getAll);

route.get("/personnel/:id/edit", personnelController.getDetail);

route.put("/personnel/:id", personnelController.updatePersonnel);

route.post("/personnel/:id_user/password", personnelController.requestResetPassword);

route.route("/personnel/create").get(personnelController.getCreatePersonnel).post(personnelController.postCreatePersonnel);

route.get("/office", officeController.index);

route.route("/office/create").get(officeController.getFormCreate).post(officeController.postFormCreate);


module.exports = route;
