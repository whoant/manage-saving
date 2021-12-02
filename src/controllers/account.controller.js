const moment = require('moment');

const {Customer, SavingsBook, Interest, Period} = require('../models');
const {covertPlainObject, formatDateVN, formatMoney} = require("../utils");
const ONLINE_SAVING = require('../config/onlineSaving');
const STATE_ACCOUNT = require('../config/stateAccount');

const STATE_ACCOUNT_MESSAGE = [
    'Trong hạn',
    'Đúng hạn',
    'Tất toán sớm'
];
const ONLINE_SAVING_MESSAGE = [
    'Nhận lãi. Gửi gốc sang kỳ hạn mới',
    'Gửi cả gốc và lãi sang kì hạn mới',
    'Đóng tài khoản. Nhận cả gốc và lãi'
];

module.exports.index = async (req, res, next) => {

};

module.exports.show = async (req, res, next) => {
    const {id_user} = req.params;

    try {
        const infoUser = await Customer.findOne({
            where: {
                id: id_user
            }
        });

        const getAccountsOfUser = await SavingsBook.findAll({
            where: {
                customerId: id_user
            },
        });
        if (!getAccountsOfUser) {
            return res.redirect('/staff/users');
        }

        const accountsRender = covertPlainObject(getAccountsOfUser).map(account => {
            return {
                ...account,
                deposit: formatMoney(account.deposit),
                interest: formatMoney(account.interest),
                expirationDate: formatDateVN(account.expirationDate),
                createdDate: formatDateVN(account.createdAt),
                stateMessage: STATE_ACCOUNT_MESSAGE[account.state - 1],
                accountTypeMessage: ONLINE_SAVING_MESSAGE[account.accountType - 1]
            };
        });

        res.render('account/show', {infoUser, accounts: accountsRender});

    } catch (e) {
        console.error(e);
    }
};

module.exports.indexAccount = async (req, res, next) => {
    const {id_user} = req.params;
    try {
        const getAccountsOfUser = await Customer.findOne({
            where: {
                id: id_user
            },
            raw: true,
            nest: true
        });

        const listPeriods = await Period.findAll({
            include: Interest,
            order: [['month', 'ASC'], [Interest, 'createdAt', 'DESC']],
        });

        const listPeriodsRender = [];
        covertPlainObject(listPeriods).forEach(period => {
            if (period.Interests.length !== 0) {
                listPeriodsRender.push({...period, Interests: period.Interests[0]});
            }
        });

        // console.log(listPeriodsRender);

        if (!getAccountsOfUser) {
            return res.redirect('/staff/users');
        }

        res.render('account/create', {getAccountsOfUser, listPeriodsRender});
    } catch (e) {
        console.log(e);
    }
};

module.exports.createAccount = async (req, res, next) => {
    let {id_user, interest_id, deposit, accountType} = req.body;

    try {
        if (accountType < ONLINE_SAVING.INTEREST_RECEIVER && accountType > ONLINE_SAVING.CLOSING_ACCOUNT) {
            return res.redirect('back');
        }

        const checkUser = await Customer.findOne({
            where: {
                id: id_user
            }
        });

        if (checkUser === null) {
            return res.redirect('back');
        }

        const listPeriods = await Period.findAll({
            include: Interest,
            order: [['month', 'ASC'], [Interest, 'createdAt', 'DESC']],
        });

        const listPeriodsRender = [];
        covertPlainObject(listPeriods).forEach(period => {
            if (period.Interests.length !== 0) {
                listPeriodsRender.push({...period, Interests: period.Interests[0]});
            }
        });

        const indexInterest = listPeriodsRender.findIndex(ele => ele.Interests.id === interest_id);
        if (indexInterest === -1) {
            return res.redirect('back');
        }

        const periodCurrent = listPeriodsRender[indexInterest];

        deposit = Number(deposit);
        let interest = deposit * periodCurrent.Interests.factor / 100 / 12 * periodCurrent.month;
        accountType = Number(accountType);
        const state = STATE_ACCOUNT.PENDING;
        const customerId = id_user;
        const interestId = interest_id;
        const expirationDate = moment().add(periodCurrent.month, 'M').toDate();
        const closingDate = expirationDate;

        const newSavingBook = {
            deposit,
            interest,
            accountType,
            state,
            expirationDate,
            closingDate,
            customerId,
            interestId
        }
        await SavingsBook.create(newSavingBook);

        res.redirect(`/staff/accounts/${id_user}`);

    } catch (e) {
        console.log(e);
    }
};