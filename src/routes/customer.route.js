const express = require("express");
const customerController = require("../controllers/customer.controller");
const { isCustomer } = require("../middlewares/auth.middleware");

const route = express.Router();

route.route("/auth").get(customerController.indexLogin).post(customerController.postLogin).delete(customerController.logout);
route.get("/", isCustomer, customerController.home);

route.get("/history", isCustomer, customerController.historyTransaction);
route.get("/history/:id_account", isCustomer, customerController.detailTransaction);

route.get("/profile", isCustomer, customerController.indexChangePass);

route.post("/profile", isCustomer, customerController.postChangePass);


module.exports = route;
