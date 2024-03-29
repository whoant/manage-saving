const { Customer, SavingsBook } = require("../models");
const {
    formatDate,
    hash256,
    covertPlainObject,
    formatMoney,
    randomCharacters
} = require("../utils");
const mailer = require("../services/mailer");

const STATE_ACCOUNT = require("../config/stateAccount");
const { Op } = require("sequelize");
const multer = require("multer");
const fs = require("fs");

const upload = multer({ dest: "./src/public/uploads" }).single("imageNumber");

module.exports.get = async (req, res, next) => {
    const { user } = res.locals;
    let { search } = req.query;
    search = search || "";

    const listCustomer = await Customer.findAll({
        where: {
            identityNumber: {
                [Op.like]: `%${search}%`
            }
        },
        order: [["createdAt", "DESC"]],
        include: SavingsBook
    });

    const plainListCustomer = [];
    covertPlainObject(listCustomer).forEach((customer) => {
        let total = 0;
        let amount = 0;
        customer.SavingsBooks.forEach((book) => {
            if (book.state === STATE_ACCOUNT.PENDING || book.state === STATE_ACCOUNT.PROCESSING) {
                amount += book.deposit;
                total += 1;
            }
        });
        plainListCustomer.push({
            ...customer,
            total,
            amount: formatMoney(amount),
            balance: formatMoney(customer.balance)
        });
    });
    const messages = await req.consumeFlash("info");
    res.render("staff/users", { name: user.name, listCustomer: plainListCustomer, messages });
};

module.exports.index = (req, res, next) => {
    const { user } = res.locals;
    res.render("staff/create-user", { name: user.name });
};

module.exports.createUser = async (req, res, next) => {
    upload(req, res, async (error) => {
        try {
            if (error) throw new Error("Vui lòng thử lại !");
            const { fullName, identityNumber, username, email, phone, sex, address, birthday } =
                req.body;
            const { filename } = req.file;
            if (
                !fullName ||
                !identityNumber ||
                !username ||
                !email ||
                !phone ||
                !sex ||
                !address ||
                !birthday ||
                !filename
            ) {
                throw new Error("Vui lòng nhập đủ thông tin !");
            }


            const password = randomCharacters(8);

            req.body.password = hash256(password);
            const newCustomer = await Customer.create(req.body);
            const newFile = req.file.path.replace(filename, newCustomer.id + ".png");
            fs.renameSync(req.file.path, newFile);

            const subject = "Tạo tài khoản thành công !";
            const html = `Chúc mừng bạn <b>${fullName}</b>, bạn đã tạo tài khoản thành công <br/> Mật khẩu mặc định của bạn: <b>${password}</b>`;
            await mailer(email, subject, html);

            await req.flash("info", "Tạo khách hàng thành công !");
            res.redirect("/staff/users");
        } catch (e) {
            let error = e.message;

            if (e.name === "SequelizeUniqueConstraintError") {
                error = "Số chức minh nhân dân đã đã kí";
            }

            return res.render("staff/create-user", {
                errors: [error],
                ...req.body
            });
        }
    });
};

module.exports.show = async (req, res, next) => {
    const { id_user } = req.params;

    try {
        const infoUser = await Customer.findOne({
            where: {
                id: id_user
            },
            raw: true,
            nest: true
        });

        if (infoUser === null) {
            throw new Error("Invalid id user");
        }

        const birthday = formatDate(infoUser.birthday);
        const messages = await req.consumeFlash("info");
        res.render("staff/edit-user", { ...infoUser, birthday, messages });
    } catch (e) {
        return res.redirect("/staff/users");
    }
};

module.exports.put = async (req, res, next) => {
    upload(req, res, async (error) => {
        if (error) throw new Error("Vui lòng thử lại !");
        const { id_user } = req.params;

        const { fullName, identityNumber, username, email, phone, sex, address, birthday } =
            req.body;

        try {
            if (
                !id_user ||
                !fullName ||
                !identityNumber ||
                !username ||
                !email ||
                !phone ||
                !sex ||
                !address ||
                !birthday
            ) {
                throw new Error("Vui lòng nhập đủ thông tin !");
            }
            const body = { ...req.body };

            await Customer.update(body, {
                where: {
                    id: id_user
                }
            });

            if (req.file) {
                const { filename } = req.file;
                const newFile = req.file.path.replace(filename, id_user + ".png");
                fs.renameSync(req.file.path, newFile);
            }

            await req.flash("info", "Cập nhập thông tin khách hàng thành công !");

            res.redirect(`/staff/users/${id_user}/edit`);
        } catch (e) {
            let error = e.message;

            if (e.name === "SequelizeUniqueConstraintError") {
                error = "Số chức minh nhân dân đã đăng kí";
            }

            return res.render("staff/edit-user", {
                errors: [error],
                ...req.body
            });
        }
    });
};

module.exports.updatePassword = async (req, res, next) => {
    const { id_user } = req.params;

    try {
        const customerCurrent = await Customer.findByPk(id_user);
        if (!customerCurrent) {
            throw new Error("Vui lòng kiểm tra lại người dùng !");
        }
        const { email, fullName } = customerCurrent;
        const password = randomCharacters(8);
        const html = `Tài khoản của bạn <b>${fullName}</b> đã đổi mật khẩu thành công <br/> Mật khẩu của bạn: <b>${password}</b>`;

        await mailer(email, "Khôi phục mật khẩu", html);
        customerCurrent.password = hash256(password);
        await customerCurrent.save();

        await req.flash("info", "Đã gửi email chứa mật khẩu vào khách hàng !");

        res.redirect(`/staff/users/${id_user}/edit`);
    } catch (e) {
        let error = e.message;

        return res.render("staff/edit-user", {
            errors: [error],
            ...req.body
        });
    }
};
