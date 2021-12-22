const moment = require('moment');

const { Customer, SavingsBook, Interest, Period, FormCreate, FormClose } = require('../models');
const { covertPlainObject, formatMoney, formatDate } = require('../utils');
const ONLINE_SAVING = require('../config/onlineSaving');
const STATE_ACCOUNT = require('../config/stateAccount');

const { STATE_ACCOUNT_MESSAGE, ONLINE_SAVING_MESSAGE } = require('../config/message');

module.exports.index = async (req, res, next) => {};

module.exports.show = async (req, res, next) => {
    const { id_user } = req.params;
    const { user } = res.locals;

    try {
        const infoUser = await getUser(id_user);

        const getAccountsOfUser = await SavingsBook.findAll({
            where: {
                customerId: id_user,
            },
            order: [['createdAt', 'DESC']],
        });
        if (!getAccountsOfUser) {
            return res.redirect('/staff/users');
        }

        const accountsRender = covertPlainObject(getAccountsOfUser).map((account) => {
            return {
                ...account,
                deposit: formatMoney(account.deposit),
                interest: formatMoney(account.interest),
                expirationDate: formatDate(account.expirationDate, 'VN'),
                createdDate: formatDate(account.createdAt, 'VN'),
                stateMessage: STATE_ACCOUNT_MESSAGE[account.state - 1],
                accountTypeMessage: ONLINE_SAVING_MESSAGE[account.accountType - 1],
            };
        });

        res.render('account/show', { infoUser, accounts: accountsRender, name: user.name });
    } catch (e) {
        console.error(e);
    }
};

module.exports.indexAccount = async (req, res, next) => {
    const { id_user } = req.params;
    try {
        const getAccountsOfUser = await getUser(id_user);

        const listPeriods = await getListPeriods();

        const listPeriodsRender = [];
        covertPlainObject(listPeriods).forEach((period) => {
            if (period.Interests.length !== 0) {
                listPeriodsRender.push({ ...period, Interests: period.Interests[0] });
            }
        });

        if (!getAccountsOfUser) {
            return res.redirect('/staff/users');
        }

        const messages = await req.consumeFlash('info');
        res.render('account/create', { getAccountsOfUser, listPeriodsRender, messages });
    } catch (e) {
        console.log(e);
    }
};

module.exports.createAccount = async (req, res, next) => {
    let { id_user, interest_id, deposit, accountType } = req.body;
    const { user } = res.locals;
    try {
        if (
            accountType < ONLINE_SAVING.INTEREST_RECEIVER &&
            accountType > ONLINE_SAVING.CLOSING_ACCOUNT
        ) {
            return res.redirect('back');
        }

        const checkUser = await getUser(id_user);

        if (checkUser === null) {
            return res.redirect('back');
        }

        const listPeriodsRender = [];
        const listPeriods = await getListPeriods();

        covertPlainObject(listPeriods).forEach((period) => {
            if (period.Interests.length !== 0) {
                listPeriodsRender.push({ ...period, Interests: period.Interests[0] });
            }
        });

        const indexInterest = listPeriodsRender.findIndex(
            (ele) => ele.Interests.id === interest_id
        );
        if (indexInterest === -1) {
            return res.redirect('back');
        }

        const periodCurrent = listPeriodsRender[indexInterest];

        deposit = Number(deposit);
        let interest =
            ((deposit * periodCurrent.Interests.factor) / 100 / 12) * periodCurrent.month;
        accountType = Number(accountType);
        const customerId = id_user;
        const interestId = interest_id;
        const expirationDate = moment().add(periodCurrent.month, 'M').toDate();
        const closingDate = expirationDate;

        const newSavingBook = await SavingsBook.create({
            deposit,
            interest,
            accountType,
            expirationDate,
            closingDate,
            customerId,
            interestId,
        });

        await FormCreate.create({
            savingsBookId: newSavingBook.id,
            staffId: user.id,
        });

        await req.flash('info', 'Thêm tài khoản tiết kiệm thành công !');
        res.redirect(`/staff/accounts/${id_user}`);
    } catch (e) {
        res.redirect('back');
    }
};

module.exports.getDetailAccount = async (req, res, next) => {
    const { id_user, id_account } = req.params;
    const { user } = res.locals;
    try {
        const infoAccount = await SavingsBook.findOne({
            where: {
                customerId: id_user,
                id: id_account,
            },

            include: [{ model: Customer }, { model: Interest, include: [{ model: Period }] }],
            nest: true,
            raw: true,
        });

        infoAccount.deposit = formatMoney(infoAccount.deposit);
        infoAccount.interest = formatMoney(infoAccount.interest);
        infoAccount.createdAt = formatDate(infoAccount.createdAt, 'VN');
        infoAccount.expirationDate = formatDate(infoAccount.expirationDate, 'VN');
        infoAccount.accountTypeMessage = ONLINE_SAVING_MESSAGE[infoAccount.accountType - 1];
        infoAccount.closingDate = formatDate(infoAccount.closingDate, 'VN');
        if (infoAccount.state === STATE_ACCOUNT.PENDING) {
            infoAccount.closingDate = 'Chưa kết thúc';
        }
        infoAccount.name = user.name;

        res.render('account/detail-account', infoAccount);
    } catch (e) {
        console.log(e);
    }
};

module.exports.putDetailAccount = async (req, res, next) => {
    const { id_user, id_account } = req.params;
    const { user } = res.locals;
    try {
        const infoAccount = await SavingsBook.findOne({
            where: {
                customerId: id_user,
                id: id_account,
            },
            include: [{ model: Customer }, { model: Interest, include: [{ model: Period }] }],
        });

        if (!infoAccount || infoAccount.state !== STATE_ACCOUNT.PENDING) {
            return res.redirect('back');
        }

        await infoAccount.update({
            state: STATE_ACCOUNT.ON_TIME,
            closingDate: moment().toDate(),
        });

        await FormClose.create({
            staffId: user.id,
            savingsBookId: id_account,
        });

        await infoAccount.Customer.increment({
            balance: infoAccount.deposit,
        });

        res.redirect('back');
    } catch (e) {
        console.log(e);
    }
};

function getListPeriods() {
    return Period.findAll({
        include: Interest,
        order: [
            ['month', 'ASC'],
            [Interest, 'createdAt', 'DESC'],
        ],
    });
}

function getUser(id_user) {
    return Customer.findOne({
        where: {
            id: id_user,
        },
        raw: true,
        nest: true,
    });
}
