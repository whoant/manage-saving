const { Office, Staff } = require("../models");
const slug = require("slug");

class OfficeController {
    async index(req, res, next) {
        try {
            const listOffices = await Office.findAll({
                attributes: ["id", "name"],
                include: Staff
            });
            const messages = await req.consumeFlash("info");
            res.render("admin/office", { listOffices, messages });
        } catch (e) {
            next(e);
        }
    }


    async getFormCreate(req, res, next) {
        const [messages, errors] = await Promise.all([
            req.consumeFlash('info'),
            req.consumeFlash('error'),
        ]);

        res.render('admin/create-office', { messages, errors });
    }

    async postFormCreate(req, res, next) {
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
            await req.flash('error', "Chức vụ đã tồn tại");
            res.redirect('/admin/office/create');
            next(e);
        }
    }

}

module.exports = new OfficeController();