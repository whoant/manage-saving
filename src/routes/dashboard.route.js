const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");

const route = express.Router();

route.get("/", dashboardController.getDashboard);

route.get("/user", dashboardController.getAnalyzeUser);

route.get("/saving-book", dashboardController.getAnalyzeSavingBooks);


module.exports = route;
