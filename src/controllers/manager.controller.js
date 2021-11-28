module.exports.index = async (req, res, next) => {
    const {user} = res.locals;
    res.render('manager/index', user);
};