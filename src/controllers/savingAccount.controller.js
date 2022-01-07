const { Customer, SavingsBook, Interest, Period, FormCreate, FormClose } = require("../models");

const mailer = require("../services/mailer");
const ONLINE_SAVING = require("../config/onlineSaving");
const STATE_ACCOUNT = require("../config/stateAccount");
const { Op } = require("sequelize");
const moment = require("moment");
const { covertPlainObject } = require("../utils");

class SavingAccountController {
    async index(req, res, next) {
        const { user } = res.locals;
        try {
            const messages = await req.consumeFlash("info");
            const listSavingsBooks = await getAllSavingsBooks();
            res.render("savingAccount/index", { listSavingsBooks, messages, user });
        } catch (e) {
            next(e);
        }
    }

    async create(req, res, next) {
        try {
            const { user } = res.locals;

            const createFormClose = [];
            const createSavingsBooks = [];
            const updateSavingsBooks = [];
            const autoIncrementMoney = [];
            let sendMail = [];

            const [listSavingsBooks, listPeriods] = await Promise.all([
                getAllSavingsBooks(),
                getListPeriods()
            ]);
            const listPeriodsRender = [];
            covertPlainObject(listPeriods).forEach((period) => {
                if (period.Interests.length !== 0) {
                    listPeriodsRender.push({ ...period, Interests: period.Interests[0] });
                }
            });

            listSavingsBooks.forEach((savingsBook) => {
                const monthCurrent = savingsBook.Interest.Period.month;
                const { customerId, accountType, deposit, interest, id, Customer } = savingsBook;
                const indexPeriod = listPeriodsRender.findIndex(
                    (period) => period.month === monthCurrent
                );

                createFormClose.push(
                    FormClose.create({
                        staffId: user.id,
                        savingsBookId: id
                    })
                );

                updateSavingsBooks.push(
                    savingsBook.update({
                        state: STATE_ACCOUNT.FINISHED,
                        closingDate: moment().toDate()
                    })
                );

                let depositCurrent = deposit + interest;

                if (accountType === ONLINE_SAVING.INTEREST_RECEIVER) {
                    autoIncrementMoney.push(
                        Customer.increment({
                            balance: interest
                        })
                    );

                    depositCurrent -= interest;
                }

                const { Interests, month } = listPeriodsRender[indexPeriod];

                const newInterest = ((depositCurrent * Interests.factor) / 100 / 12) * month;
                const newExpirationDate = moment().add(month, "M").toDate();
                const newClosingDate = newExpirationDate;

                const interestId = Interests.id;

                const newSavingBook = {
                    deposit: depositCurrent,
                    interest: newInterest,
                    accountType,
                    expirationDate: newExpirationDate,
                    closingDate: newClosingDate,
                    customerId,
                    interestId
                };

                createSavingsBooks.push(SavingsBook.create(newSavingBook));

                const html = `<b>${Customer.fullName}</b> thân mếm <br/> Tất toán tài khoản <b>${id}</b> thành công <br/> Cảm ơn quý khách đã dùng dịch vụ của chúng tôi`;
                sendMail.push(mailer(Customer.email, "Tất toán tài khoản", html));
            });

            await Promise.all(createFormClose);
            await Promise.all(updateSavingsBooks);
            await Promise.all(autoIncrementMoney);
            await Promise.allSettled(sendMail);
            sendMail.length = 0;

            const promiseCreateSavingsBooks = await Promise.all(createSavingsBooks);

            const createFormCreate = [];
            promiseCreateSavingsBooks.forEach((newSavingBook) => {
                createFormCreate.push(
                    FormCreate.create({
                        savingsBookId: newSavingBook.id,
                        staffId: user.id
                    })
                );
            });
            await Promise.all(createFormCreate);

            await req.flash("info", "Duyệt hết tài khoản thành công !");
            res.redirect(`/staff/saving-account`);
        } catch (e) {
            console.log(e);
            next(e);
        }
    }
}

function getAllSavingsBooks() {
    return SavingsBook.findAll({
        where: {
            state: STATE_ACCOUNT.PROCESSING,
            accountType: {
                [Op.or]: [ONLINE_SAVING.INTEREST_RECEIVER, ONLINE_SAVING.ROLLOVER_BOTH]
            }
        },
        include: [{ model: Customer }, { model: Interest, include: [{ model: Period }] }]
    });
}

function getListPeriods() {
    return Period.findAll({
        include: Interest,
        order: [
            ["month", "ASC"],
            [Interest, "createdAt", "DESC"]
        ]
    });
}

module.exports = new SavingAccountController();
