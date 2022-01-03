const { Customer, SavingsBook, Interest, Period } = require("../models");
const { hash256, formatMoney, covertPlainObject, formatDate } = require("../utils");
const STATE_ACCOUNT = require("../config/stateAccount");
const { STATE_ACCOUNT_MESSAGE, ONLINE_SAVING_MESSAGE } = require("../config/message");
const { Op } = require("sequelize");
const moment = require("moment");

class CustomerController {
    async indexLogin(req, res, next) {
        const errors = await req.consumeFlash("error");
        res.render("customer/auth", { errors });
    }

    async postLogin(req, res, next) {
        const { username, password } = req.body;

        try {
            const checkCustomer = await Customer.findOne({
                where: {
                    username
                }
            });

            if (!checkCustomer || checkCustomer.password !== hash256(password)) {
                await req.flash("error", "Vui lòng kiểm tra lại tài khoản của quý khách !");
                return res.redirect("/customer/auth");
            }

            res.cookie("id", checkCustomer.id, { signed: true });
            res.redirect("/customer");

        } catch (e) {

        }
    }

    async logout(req, res, next) {
        res.clearCookie("id");
        res.redirect("/customer/auth");
    }

    async home(req, res, next) {
        try {
            const { user } = res.locals;
            let total = 0;
            const balance = formatMoney(user.balance);
            let amount = 0;
            user.SavingsBooks.forEach((book) => {
                if (book.state === STATE_ACCOUNT.PENDING) {
                    amount += book.deposit;
                    total += 1;
                }
            });
            amount = formatMoney(amount);

            const messages = await req.consumeFlash("info");

            res.render("customer/index", {
                total,
                balance,
                amount,
                messages
            });

        } catch (e) {

        }
    }

    async indexChangePass(req, res, next) {
        const errors = await req.consumeFlash("error");
        res.render("customer/profile", { errors });

    }

    async postChangePass(req, res, next) {
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
            res.redirect("/customer");
        } catch (e) {
            await req.flash("error", e.message);

            res.redirect("back");
        }
    }

    async historyTransaction(req, res, next) {
        try {
            const { user } = res.locals;
            const getAccountsOfUser = await SavingsBook.findAll({
                where: {
                    customerId: user.id,
                    state: {
                        [Op.or]: [STATE_ACCOUNT.PENDING, STATE_ACCOUNT.FINISHED]
                    }
                },
                order: [["createdAt", "ASC"]]
            });
            const currentDay = moment();
            const accountsRender = covertPlainObject(getAccountsOfUser).map((account) => {
                const expirationDay = moment(account.expirationDate, "YYYY-MM-DD");
                return {
                    id: account.id,
                    deposit: formatMoney(account.deposit),
                    expirationDate: formatDate(account.expirationDate, "VN"),
                    countDown: expirationDay.diff(currentDay, "days")
                };
            });
            res.render("customer/history", { accountsRender });

        } catch (e) {

        }
    }

    async detailTransaction(req, res, next) {
        try {
            const { user } = res.locals;
            const { id_account } = req.params;

            const detailSavingsBook = await SavingsBook.findOne({
                where: {
                    id: id_account,
                    customerId: user.id
                },
                include: [{ model: Interest, include: [{ model: Period }] }],
                nest: true,
                raw: true
            });
            if (!detailSavingsBook) {
                return res.redirect("back");
            }

            detailSavingsBook.deposit = formatMoney(detailSavingsBook.deposit);
            detailSavingsBook.interest = formatMoney(detailSavingsBook.interest);
            detailSavingsBook.accountType = ONLINE_SAVING_MESSAGE[detailSavingsBook.accountType - 1];
            detailSavingsBook.created = formatDate(detailSavingsBook.createdAt, "VN");
            detailSavingsBook.expirated = formatDate(detailSavingsBook.expirationDate, "VN");
            detailSavingsBook.typeDeposit = `${detailSavingsBook.Interest.factor}% / năm`;
            detailSavingsBook.typeInterest = `${detailSavingsBook.Interest.Period.month} tháng`;
            res.render("customer/detail", { detailSavingsBook });

        } catch (e) {

        }
    }

}

module.exports = new CustomerController();