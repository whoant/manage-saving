const express = require("express");
const customerController = require("../controllers/customer.controller");
const { isCustomer } = require("../middlewares/auth.middleware");

const route = express.Router();

route.route("/auth").get(customerController.indexLogin).post(customerController.postLogin);
route.get("/", isCustomer, customerController.home);

module.exports = route;
