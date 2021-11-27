module.exports.get = (req, res, next) => {
    const {user} = res.locals;
    res.render('staff/index', {
        name: user.name,
    });
};

module.exports.post = (req, res, next) => {

};

module.exports.put = (req, res, next) => {
    
}