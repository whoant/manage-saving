const { Customer, SavingsBook } = require("../models");
const STATE_ACCOUNT = require('../config/stateAccount');
const { Op } = require("sequelize");

module.exports.getDashboard = async (req, res, next) => {
    try {

        const countCustomer = await Customer.count();
        const countSavingBook = await SavingsBook.count();
        const countValidSavingBook = await SavingsBook.count({
            where: {
                state: {
                    [Op.or]: [STATE_ACCOUNT.FINISHED, STATE_ACCOUNT.ON_TIME]
                }
            }
        });

        const countInvalidSavingBook = countSavingBook - countValidSavingBook;

        res.render("dashboard/home.pug", {
            countCustomer,
            countSavingBook,
            countValidSavingBook,
            countInvalidSavingBook,
        })
    } catch (e) {

    }
}