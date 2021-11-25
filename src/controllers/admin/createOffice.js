const slug = require('slug');
const {Office, Staff} = require("../../models");

module.exports.get = (req, res) => {
    res.render('admin/create-office');
};

module.exports.post = async (req, res) => {
    const {name} = req.body;
    try {
        if (name === '') {
            return res.render('admin/create-office', {
                errors: ['Vui lòng nhập tên']
            });
        }

        const short_name = slug(name, '_');
        await Office.create({name, short_name});

        const listOffices = await Office.findAll({
            attributes: ['id', 'name'],
            include: Staff
        });

        res.render('admin/office', {
            listOffices,
            msg: 'Tạo chức vụ thành công'
        });

    } catch (e) {
        res.render('admin/create-office', {
            errors: ['Vui lòng kiểm tra lại tên']
        });
    }
};