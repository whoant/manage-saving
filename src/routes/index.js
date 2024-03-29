const staffRoute = require("./staff.route");
const adminRoute = require("./admin.route");
const authRoute = require("./auth.route");
const manageRoute = require("./manager.route");
const dashboardRoute = require("./dashboard.route");
const customerRoute = require("./customer.route");

const authMiddleware = require("../middlewares/auth.middleware");

module.exports = app => {
    app.use("/staff", authMiddleware.requireAuth, authMiddleware.requirePermissions("nhan_vien"), staffRoute);
    app.use("/manager", authMiddleware.requireAuth, authMiddleware.requirePermissions("giam_doc"), manageRoute);
    app.use("/admin", authMiddleware.requireAuth, authMiddleware.requirePermissions("quan_tri_vien"), adminRoute);
    app.use("/dashboard", authMiddleware.requireAuth, dashboardRoute);
    // app.use("/admin", adminRoute);
    app.use("/customer", customerRoute);
    app.use("/auth", authRoute);
};