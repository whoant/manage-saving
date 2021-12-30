const { Office, Staff } = require('../../models');
const { hash256 } = require('../../utils');

module.exports.get = async (req, res, next) => {
    try {
        const listOffices = await Office.findAll({
            attributes: ['id', 'name'],
            raw: true,
        });

        if (listOffices.length === 0) return res.redirect('back');

        res.render('admin/create-user', { listOffices, officeId: 0 });
    } catch (e) {
        console.error(e);
    }
};

module.exports.post = async (req, res, next) => {
    const { name, username, password, email, phone, sex, birthday, officeId, address } = req.body;
    if (
        !name ||
        !username ||
        !password ||
        !email ||
        !phone ||
        !sex ||
        !birthday ||
        !officeId ||
        !address
    ) {
        throw new Error('Vui lòng nhập đầy đủ thông tin !');
    }
    try {
        await Staff.create({
            name,
            username,
            password: hash256(password),
            email,
            phone,
            sex,
            birthday,
            officeId,
            address,
        });
        await req.flash('info', 'Tạo tài khoản này thành công !');
        res.redirect('/admin/user');
    } catch (e) {
        let error = e.message;
        const listOffices = await Office.findAll({
            attributes: ['id', 'name'],
            raw: true,
        });

        if (e.name === 'SequelizeUniqueConstraintError') {
            error = 'Tên tài khoản đã tồn tại !';
        }

        res.render('admin/create-user', {
            ...req.body,
            listOffices,
            errors: error,
            officeId,
        });
        next(e);
    }
};
