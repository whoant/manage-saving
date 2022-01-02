const express = require("express");
const customerController = require("../controllers/customer.controller");

const route = express.Router();

route.route("/auth").get(customerController.indexLogin).post(customerController.postLogin);
route.get("/", customerController.home);

module.exports = route;
