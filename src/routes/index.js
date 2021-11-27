const staffRoute = require('./staff.route');
const adminRoute = require('./admin.route');
const authRoute = require('./auth.route');

const authMiddleware = require('../middlewares/auth.middleware');

module.exports = app => {
    app.use('/staff', authMiddleware.requireAuth, authMiddleware.requirePermissions('nhan_vien'), staffRoute);
    app.use('/admin', adminRoute);
    app.use('/auth', authRoute);
};