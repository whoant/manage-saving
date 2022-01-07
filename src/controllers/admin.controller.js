const { Office, Staff } = require("../models");
const { hash256 } = require("../utils");

class AdminController {
    async index(req, res, next) {
        try {
            const countOffice = await Office.count();
            const countStaff = await Staff.count();
            res.render("admin/home", {
                countOffice,
                countStaff
            });
        } catch (e) {
            res.render("admin/home", {
                countOffice: 0,
                countStaff: 0
            });
        }
    }

    async getFormChangePass(req, res, next) {
        const { user } = res.locals;
        const [messages, errors] = await Promise.all([
            req.consumeFlash("info"),
            req.consumeFlash("error")
        ]);
        res.render("admin/info", {
            name: user.name,
            messages,
            errors
        });
    }

    async updatePass(req, res, next) {
        const { oldPassword, newPassword, repeatPassword } = req.body;

        try {
            const { user } = res.locals;
            if (newPassword !== repeatPassword) {
                throw new Error("Hai mật khẩu không khớp nhau");
            }

            if (user.password !== hash256(oldPassword)) {
                throw new Error("Mật khẩu cũ không khớp !");
            }

            user.password = hash256(newPassword);
            await user.save();

            await req.flash("info", "Cập nhập mật khẩu thành công !");
        } catch (e) {
            await req.flash("error", e.message);
            next(e);
        }
        res.redirect("/admin/info");
    }

}

module.exports = new AdminController();