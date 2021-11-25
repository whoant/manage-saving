const {Staff, Office} = require('../../models');
const {Op} = require('sequelize');
const {formatDate, hash256} = require("../../utils");

module.exports.getAll = async (req, res) => {
    let {search} = req.query;
    if (!search) search = '';
    try {
        const listStaffs = await Staff.findAll({
            where: {
                username: {
                    [Op.like]: `%${search}%`
                }
            },
            include: Office,
        });

        res.render('admin/user', {listStaffs, search});
    } catch (e) {
        console.error(e);
    }
};

module.exports.getDetail = async (req, res) => {
    let {id} = req.params;

    try {
        const staff = await Staff.findByPk(id, {raw: true});
        if (!staff) return res.redirect('/admin/user');
        const listOffices = await Office.findAll({raw: true});
        const birthday = formatDate(staff.birthday);
        res.render(`admin/detail-user`, {
            staff: {
                ...staff,
                birthday
            },
            listOffices
        });
    } catch (e) {
        console.error(e);
    }
};


module.exports.updateUser = async (req, res) => {
    let {id} = req.params;

    const {name, password, email, phone, sex, birthday, officeId, address} = req.body;

    if (!name || !email || !phone || !sex || !birthday || !officeId || !address) {
        return res.render('admin/detail-user', {
            staff: req.body,
            errors: ['Vui lòng nhập đủ thông tin của nhân viên !']
        });
    }

    let body = {
        name,
        email,
        phone,
        sex,
        birthday,
        officeId,
        address
    };
    if (password !== '') {
        body = {...body, password: hash256(password)};
    }

    try {
        await Staff.update(body,
            {
                where: {
                    id
                }
            });
        const staff = await Staff.findByPk(id, {raw: true});
        const listOffices = await Office.findAll({raw: true});
       
        return res.render('admin/detail-user', {
            staff,
            listOffices,
            msg: 'Đã cập nhập thành công'
        });
    } catch (e) {
        console.error(e);
    }
};