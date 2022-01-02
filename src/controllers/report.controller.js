const { SavingsBook } = require("../models");
const { Op } = require("sequelize");

const { FINISHED, ON_TIME, PENDING } = require("../config/stateAccount");
const { INTEREST_RECEIVER, ROLLOVER_BOTH, CLOSING_ACCOUNT } = require("../config/onlineSaving");
const { ONLINE_SAVING_MESSAGE } = require("../config/message");
const { formatMoney } = require("../utils/index");

class ReportController {
    index(req, res, next) {
        res.render("report/index");
    }

    async getDetail(req, res, next) {
        const { date } = req.query;
        if (!date) {
            return res.json({
                status: false,
                message: "Vui lòng nhập ngày tháng"
            });
        }

        const firstDay = `${date} 00:00`;
        const lastDay = `${date} 23:59`;

        try {
            const listSavingsBooksIn = await SavingsBook.findAll({
                where: {
                    createdAt: {
                        [Op.gt]: firstDay,
                        [Op.lt]: lastDay
                    },
                    state: PENDING
                },
                attributes: ["deposit", "interest", "accountType"]
            });
            const listSavingsBooksOut = await SavingsBook.findAll({
                where: {
                    closingDate: {
                        [Op.gt]: firstDay,
                        [Op.lt]: lastDay
                    },
                    state: ON_TIME
                },
                attributes: ["deposit", "interest", "accountType"]
            });

            const interestReceiver = {
                name: ONLINE_SAVING_MESSAGE[INTEREST_RECEIVER - 1],
                in: 0,
                out: 0,
                diff: 0
            };
            const rolloverBoth = {
                name: ONLINE_SAVING_MESSAGE[ROLLOVER_BOTH - 1],
                in: 0,
                out: 0,
                diff: 0
            };
            const closingAccount = {
                name: ONLINE_SAVING_MESSAGE[CLOSING_ACCOUNT - 1],
                in: 0,
                out: 0,
                diff: 0
            };


            listSavingsBooksIn.forEach(item => {
                switch (item.accountType) {
                    case INTEREST_RECEIVER:
                        interestReceiver.in += item.deposit;
                        break;
                    case ROLLOVER_BOTH:
                        rolloverBoth.in += item.deposit;
                        break;
                    case CLOSING_ACCOUNT:
                        closingAccount.in += item.deposit;
                }
            });
            listSavingsBooksOut.forEach(item => {
                switch (item.accountType) {
                    case INTEREST_RECEIVER:
                        interestReceiver.out += item.deposit;
                        break;
                    case ROLLOVER_BOTH:
                        rolloverBoth.out += item.deposit;
                        break;
                    case CLOSING_ACCOUNT:
                        closingAccount.out += item.deposit;
                }
            });

            interestReceiver.diff = interestReceiver.in - interestReceiver.out;
            rolloverBoth.diff = rolloverBoth.in - rolloverBoth.out;
            closingAccount.diff = closingAccount.in - closingAccount.out;

            interestReceiver.diff = formatMoney(interestReceiver.diff);
            interestReceiver.in = formatMoney(interestReceiver.in);
            interestReceiver.out = formatMoney(interestReceiver.out);

            rolloverBoth.diff = formatMoney(rolloverBoth.diff);
            rolloverBoth.in = formatMoney(rolloverBoth.in);
            rolloverBoth.out = formatMoney(rolloverBoth.out);

            closingAccount.diff = formatMoney(closingAccount.diff);
            closingAccount.in = formatMoney(closingAccount.in);
            closingAccount.out = formatMoney(closingAccount.out);

            res.json({
                status: "success",
                data: [interestReceiver, rolloverBoth, closingAccount]
            });

        } catch (e) {

            res.json({
                status: false,
                message: "Vui lòng nhập ngày tháng"
            });
        }

    }

}

module.exports = new ReportController();