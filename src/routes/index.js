const userRoute = require('./user.route');
const adminRoute = require('./admin.route');

module.exports = app => {
    app.use('/user', userRoute);
    app.use('/admin', adminRoute);
};