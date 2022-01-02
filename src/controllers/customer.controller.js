const { Customer } = require("../models");
const { hash256 } = require("../utils");

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

    async home(req, res, next) {
        
        res.render("customer/index");
    }

    async indexChangePass(req, res, next) {

    }

    async postChangePass(req, res, next) {

    }

    async historyTransaction(req, res, next) {

    }

}

module.exports = new CustomerController();