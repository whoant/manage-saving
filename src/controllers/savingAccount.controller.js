const {
    Customer,
    SavingsBook,
    Interest,
    Period,
    FormCreate,
    FormClose,
    Var,
} = require('../models');

const mailer = require('../services/mailer');
const ONLINE_SAVING = require('../config/onlineSaving');
const STATE_ACCOUNT = require('../config/stateAccount');
const { Op } = require('sequelize');
const moment = require('moment');
const { covertPlainObject } = require('../utils');

class SavingAccountController {
    async index(req, res, next) {
        try {
            const messages = await req.consumeFlash('info');
            const listSavingsBooks = await getAllSavingsBooks();
            res.render('savingAccount/index', { listSavingsBooks, messages });
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

            const [listSavingsBooks, listPeriods] = await Promise.all([
                getAllSavingsBooks(),
                getListPeriods(),
            ]);
            const listPeriodsRender = [];
            covertPlainObject(listPeriods).forEach((period) => {
                if (period.Interests.length !== 0) {
                    listPeriodsRender.push({ ...period, Interests: period.Interests[0] });
                }
            });

            listSavingsBooks.forEach((savingsBook) => {
                const monthCurrent = savingsBook.Interest.Period.month;
                const { customerId, accountType, deposit, interest, id } = savingsBook;
                const indexPeriod = listPeriodsRender.findIndex(
                    (period) => period.month === monthCurrent
                );

                createFormClose.push(
                    FormClose.create({
                        staffId: user.id,
                        savingsBookId: id,
                    })
                );

                const periodCurrent = listPeriodsRender[indexPeriod];
                updateSavingsBooks.push(
                    savingsBook.update({
                        state: STATE_ACCOUNT.ON_TIME,
                        closingDate: moment().toDate(),
                    })
                );

                let depositCurrent = deposit + interest;

                if (savingsBook.accountType === ONLINE_SAVING.INTEREST_RECEIVER) {
                    autoIncrementMoney.push(
                        savingsBook.Customer.increment({
                            balance: interest,
                        })
                    );

                    depositCurrent -= interest;
                }

                const newInterest =
                    ((depositCurrent * periodCurrent.Interests.factor) / 100 / 12) *
                    periodCurrent.month;
                const newExpirationDate = moment().add(periodCurrent.month, 'M').toDate();
                const newClosingDate = newExpirationDate;

                const interestId = periodCurrent.Interests.id;

                const newSavingBook = {
                    deposit: depositCurrent,
                    interest: newInterest,
                    accountType,
                    expirationDate: newExpirationDate,
                    closingDate: newClosingDate,
                    customerId,
                    interestId,
                };

                createSavingsBooks.push(SavingsBook.create(newSavingBook));
            });

            await Promise.all(createFormClose);
            await Promise.all(updateSavingsBooks);
            await Promise.all(autoIncrementMoney);

            const promiseCreateSavingsBooks = await Promise.all(createSavingsBooks);
            const createFormCreate = [];
            promiseCreateSavingsBooks.forEach((newSavingBook) => {
                createFormCreate.push(
                    FormCreate.create({
                        savingsBookId: newSavingBook.id,
                        staffId: user.id,
                    })
                );
            });
            await Promise.all(createFormCreate);

            await req.flash('info', 'Duyệt hết tài khoản thành công !');
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
            state: STATE_ACCOUNT.PENDING,
            accountType: {
                [Op.or]: [ONLINE_SAVING.INTEREST_RECEIVER, ONLINE_SAVING.ROLLOVER_BOTH],
            },
            expirationDate: {
                [Op.lte]: moment().toDate(),
            },
        },
        include: [{ model: Customer }, { model: Interest, include: [{ model: Period }] }],
    });
}

function getListPeriods() {
    return Period.findAll({
        include: Interest,
        order: [
            ['month', 'ASC'],
            [Interest, 'createdAt', 'DESC'],
        ],
    });
}

module.exports = new SavingAccountController();
