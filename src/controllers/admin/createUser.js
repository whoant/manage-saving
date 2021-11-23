const {Office, Staff} = require("../../models");
const {hash256} = require("../../utils");

module.exports.get = async (req, res) => {
    try {
        const listOffices = await Office.findAll({
            attributes: ['id', 'name'],
            raw: true
        });

        if (listOffices.length === 0) return res.redirect('back');

        res.render('admin/create-user', {listOffices, officeId: 0});
    } catch (e) {
        console.error(e);
    }
};

module.exports.post = async (req, res) => {
    const {name, username, password, email, phone, sex, birthday, officeId, address} = req.body
    try {
        if (!name || !username || !password || !email || !phone || !sex || !birthday || !officeId || !address) {
            throw new Error('Vui lòng nhập đủ thông tin !');
        }
        await Staff.create({
            name,
            username,
            password: hash256(password),
            email,
            phone,
            sex,
            birthday,
            officeId,
            address
        });

        res.redirect('/admin/user');
    } catch (e) {
        let error = e.message;
        const listOffices = await Office.findAll({
            attributes: ['id', 'name'],
            raw: true
        });


        if (e.name === 'SequelizeUniqueConstraintError') {
            error = 'Tên tài khoản đã tồn tại !'
        }

        return res.render('admin/create-user', {
            ...req.body,
            listOffices,
            error,
            officeId
        });

    }
};