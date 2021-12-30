const slug = require('slug');
const { Office, Staff } = require('../../models');

module.exports.get = async (req, res) => {
    const [messages, errors] = await Promise.all([
        req.consumeFlash('info'),
        req.consumeFlash('error'),
    ]);

    res.render('admin/create-office', { messages, errors });
};

module.exports.post = async (req, res, next) => {
    const { name } = req.body;
    try {
        if (name === '') {
            throw new Error('Vui lòng nhập tên chức vụ');
        }

        const short_name = slug(name, '_');
        await Office.create({ name, short_name });

        await req.flash('info', 'Tạo chức vụ thành công !');

        res.redirect('/admin/office');
    } catch (e) {
        await req.flash('error', e.message);
        res.redirect('/admin/office/create');
        next(e);
    }
};
