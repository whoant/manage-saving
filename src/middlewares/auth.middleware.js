const {Staff, Office} = require("../models");

module.exports.requireAuth = async (req, res, next) => {
    const {id} = req.signedCookies;
    if (!id) {
        return res.redirect('/auth');
    }

    try {
        const checkUser = await Staff.findOne({
            where: {
                id
            },
            include: Office,
            raw: true,
            nest: true,
        });

        if (!checkUser) {
            return res.redirect('/auth');
        }

        res.locals.user = checkUser;
        next();

    } catch (e) {

    }
};

module.exports.requirePermissions = (permissions) => {
    return (req, res, next) => {
        const {Office} = res.locals.user;

        if (Office.short_name === permissions) {
            return next();
        }

        return res.redirect('back');
    }
}
