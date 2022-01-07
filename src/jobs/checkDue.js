const cron = require("node-cron");
const {
    SavingsBook
} = require("../models");
const moment = require("moment");
const { Op } = require("sequelize");
const STATE_ACCOUNT = require("../config/stateAccount");

module.exports = cron.schedule("*/2 * * * * *", async () => {
    try {
        console.log("=== JOB ===");
        const listSavingsBooks = await SavingsBook.findAll({
            where: {
                expirationDate: {
                    [Op.lt]: moment().format()
                },
                state: STATE_ACCOUNT.PENDING
            }
        });

        await Promise.all(listSavingsBooks.map(savingsBook => savingsBook.update({
            state: STATE_ACCOUNT.PROCESSING
        })));


    } catch (e) {

        return Promise.reject(e);
    }
}, {
    scheduled: false
});