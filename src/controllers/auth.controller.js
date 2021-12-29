const { hash256 } = require('../utils');
const { Staff, Office } = require('../models');

module.exports.get = (req, res, next) => {
    res.render('auth/login');
};

module.exports.post = async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const checkUser = await Staff.findOne({
            where: {
                username,
            },
            include: Office,
        });

        if (!checkUser || checkUser.password !== hash256(password)) {
            return res.render('auth/login', {
                username,
                password,
                errors: ['Vui lòng kiểm tra lại thông tin tài khoản !'],
            });
        }

        res.cookie('id', checkUser.id, { signed: true });

        if (checkUser.Office.short_name === 'nhan_vien') {
            return res.redirect('/staff');
        }
        if (checkUser.Office.short_name === 'giam_doc') {
            return res.redirect('/manager');
        }
    } catch (e) {
        console.log(e);
    }
};

module.exports.delete = async (req, res) => {
    res.clearCookie('id');
    res.redirect('/auth');
};
