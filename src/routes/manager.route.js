const express = require("express");
const managerController = require("../controllers/manager.controller");
const reportController = require("../controllers/report.controller");
const route = express.Router();

route.get("/", managerController.index);

route
    .route("/interest")
    .get(managerController.indexInterest)
    .post(managerController.createInterest);

route.route("/periods").get(managerController.indexPeriods).post(managerController.createPeriods);
route
    .route("/info")
    .get(managerController.getDetailPassword)
    .post(managerController.updatePassword);

route.get("/report", reportController.index);

route.get("/report-detail", reportController.getDetail);

module.exports = route;
