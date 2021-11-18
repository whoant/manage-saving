const userRoute = require('./user.route');
const adminRoute = require('./admin.route');
const authRoute = require('./auth.route');

module.exports = app => {
    app.use('/user', userRoute);
    app.use('/admin', adminRoute);
    app.use('/auth', authRoute);
};