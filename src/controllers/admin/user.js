const { Staff, Office } = require('../../models');
const { Op } = require('sequelize');
const { formatDate } = require('../../utils');

module.exports.getAll = async (req, res, next) => {
    let { search } = req.query;
    if (!search) search = '';
    try {
        const listStaffs = await Staff.findAll({
            where: {
                username: {
                    [Op.like]: `%${search}%`,
                },
            },
            order: [['createdAt', 'DESC']],
            include: Office,
        });
        const messages = await req.consumeFlash('info');
        res.render('admin/user', { listStaffs, search, messages });
    } catch (e) {
        next(e);
    }
};

module.exports.getDetail = async (req, res, next) => {
    let { id } = req.params;

    try {
        const staff = await Staff.findByPk(id, { raw: true });
        if (!staff) return res.redirect('/admin/user');
        const listOffices = await Office.findAll({ raw: true });
        const birthday = formatDate(staff.birthday);
        const [messages, errors] = await Promise.all([
            req.consumeFlash('info'),
            req.consumeFlash('error'),
        ]);
        res.render(`admin/detail-user`, {
            staff: {
                ...staff,
                birthday,
            },
            listOffices,
            messages,
            errors,
        });
    } catch (e) {
        next(e);
    }
};

module.exports.updateUser = async (req, res, next) => {
    try {
        let { id } = req.params;
        const { name, email, phone, sex, birthday, officeId, address } = req.body;
        if (!name || !email || !phone || !sex || !birthday || !officeId || !address) {
            throw new Error('Vui lòng nhập đủ thông tin của nhân viên !');
        }

        let body = {
            name,
            email,
            phone,
            sex,
            birthday,
            officeId,
            address,
        };
        await Staff.update(body, {
            where: {
                id,
            },
        });
        await req.flash('info', 'Cập nhập thông tin thành công !');
    } catch (e) {
        await req.flash('error', e.message);
    }
    res.redirect('back');
};
