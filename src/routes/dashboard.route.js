const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");

const route = express.Router();

route.get("/", dashboardController.getDashboard);


module.exports = route;
