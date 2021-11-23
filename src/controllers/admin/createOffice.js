const slug = require('slug');
const {Office} = require("../../models");


module.exports.get = (req, res, next) => {
    res.render('admin/create-office');
};

module.exports.post = async (req, res, next) => {
    const {name} = req.body;
    try {
        if (name === '') {
            return res.render('admin/create-office', {
                errors: ['Vui lòng nhập tên']
            });
        }

        const short_name = slug(name, '_');
        await Office.create({name, short_name});
        res.redirect('/admin/office');

    } catch (e) {
        res.render('admin/create-office', {
            errors: ['Vui lòng kiểm tra lại tên']
        });
    }
};