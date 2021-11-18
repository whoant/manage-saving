const {Staff} = require('../../models');

const {hash256} = require('../../utils');

module.exports.get = (req, res, next) => {
    res.render('auth/login');
};

module.exports.post = async (req, res, next) => {
    const {username, password} = req.body;
    try {

        const checkUser = await Staff.findOne({
            where: {
                username
            }
        });

        if (!checkUser || checkUser.password !== hash256(password)) {
            return res.render('auth/login', {
                username,
                password,
                errors: ['Vui lòng kiểm tra lại thông tin tài khoản !']
            });
        }
        
        res.json({
            msg: 'OKE'
        });
    } catch (e) {
        console.error(e);
        res.json({
            msg: 'Loi'
        });
    }
};