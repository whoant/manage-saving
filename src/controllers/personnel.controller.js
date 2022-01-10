const { Staff, Office } = require("../models");
const { Op } = require("sequelize");
const { formatDate, hash256, randomCharacters } = require("../utils");
const mailer = require("../services/mailer");

class PersonnelController {
    async getAll(req, res, next) {
        let { search } = req.query;
        if (!search) search = "";
        try {
            const listStaffs = await Staff.findAll({
                where: {
                    username: {
                        [Op.like]: `%${search}%`
                    }
                },
                order: [["createdAt", "DESC"]],
                include: Office
            });
            const messages = await req.consumeFlash("info");
            res.render("admin/personnel", { listStaffs, search, messages });
        } catch (e) {
            next(e);
        }
    }

    async getDetail(req, res, next) {
        let { id } = req.params;

        try {
            const staff = await Staff.findByPk(id, { raw: true });
            if (!staff) return res.redirect("/admin/personnel");
            const listOffices = await Office.findAll({ raw: true });
            const birthday = formatDate(staff.birthday);
            const [messages, errors] = await Promise.all([
                req.consumeFlash("info"),
                req.consumeFlash("error")
            ]);
            res.render(`admin/detail-personnel`, {
                staff: {
                    ...staff,
                    birthday
                },
                listOffices,
                messages,
                errors
            });
        } catch (e) {
            next(e);
        }
    }

    async getCreatePersonnel(req, res, next) {
        try {
            const listOffices = await Office.findAll({
                attributes: ["id", "name"],
                raw: true
            });

            if (listOffices.length === 0) return res.redirect("back");
            const errors = await req.consumeFlash("error");

            res.render("admin/create-personnel", { listOffices, officeId: 0, errors });
        } catch (e) {
            console.error(e);
        }
    }

    async postCreatePersonnel(req, res, next) {
        const { name, username, password, email, phone, sex, birthday, officeId, address } = req.body;
        try {
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
                throw new Error("Vui lòng nhập đầy đủ thông tin !");
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
            await req.flash("info", "Tạo tài khoản này thành công !");
            res.redirect("/admin/personnel");
        } catch (e) {

            await req.flash("error", e.message);
            res.redirect("back");

        }
    }

    async updatePersonnel(req, res, next) {
        try {
            let { id } = req.params;
            const { name, email, phone, sex, birthday, officeId, address } = req.body;
            if (!name || !email || !phone || !sex || !birthday || !officeId || !address) {
                throw new Error("Vui lòng nhập đủ thông tin của nhân viên !");
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
            await Staff.update(body, {
                where: {
                    id
                }
            });
            await req.flash("info", "Cập nhập thông tin thành công !");
        } catch (e) {
            await req.flash("error", e.message);
        }
        res.redirect("back");
    }

    async requestResetPassword(req, res, next) {
        const { id_user } = req.params;

        try {
            const staffCurrent = await Staff.findByPk(id_user);
            if (!staffCurrent) {
                throw new Error("Vui lòng kiểm tra lại người dùng !");
            }
            const { email, name } = staffCurrent;
            const password = randomCharacters(8);
            staffCurrent.password = hash256(password);
            await staffCurrent.save();

            const html = `Tài khoản của nhân viên <b>${name}</b> đã đổi mật khẩu thành công <br/> Mật khẩu của bạn: <b>${password}</b>`;
            await mailer(email, "Khôi phục mật khẩu", html);

            await req.flash("info", `Đã gửi email chứa mật khẩu vào nhân viên ${name} !`);

            res.redirect(`back`);
        } catch (e) {

            await req.flash("error", e.message);
        }
        res.redirect("back");
    }

}

module.exports = new PersonnelController();