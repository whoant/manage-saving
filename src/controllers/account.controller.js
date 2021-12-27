const moment = require('moment');

const {
    Customer,
    SavingsBook,
    Interest,
    Period,
    FormCreate,
    FormClose,
    Var,
} = require('../models');
const { covertPlainObject, formatMoney, formatDate, generateDeposit } = require('../utils');
const ONLINE_SAVING = require('../config/onlineSaving');
const STATE_ACCOUNT = require('../config/stateAccount');

const mailer = require('../services/mailer');

const { STATE_ACCOUNT_MESSAGE, ONLINE_SAVING_MESSAGE } = require('../config/message');
const { Op } = require('sequelize');

module.exports.index = async (req, res, next) => {};

module.exports.show = async (req, res, next) => {
    const { id_user } = req.params;
    let { search } = req.query;
    const { user } = res.locals;

    try {
        const infoUser = await getUser(id_user);
        search = search || '';
        const getAccountsOfUser = await SavingsBook.findAll({
            where: {
                customerId: id_user,
                id: {
                    [Op.like]: `%${search}%`,
                },
                state: {
                    [Op.or]: [STATE_ACCOUNT.PENDING, STATE_ACCOUNT.FINISHED],
                },
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
        const messages = await req.consumeFlash('info');

        res.render('account/show', {
            messages,
            infoUser,
            accounts: accountsRender,
            name: user.name,
        });
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
        const errors = await req.consumeFlash('error');
        res.render('account/create', { getAccountsOfUser, listPeriodsRender, messages, errors });
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

        const MIN_DEPOSIT = await Var.findOne({
            where: {
                name: 'min_deposit',
            },
        });

        if (Number(deposit) < MIN_DEPOSIT.value) {
            await req.flash('error', `Số tiền phải lớn hơn ${formatMoney(MIN_DEPOSIT.value)}`);
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

        const typeDeposit = `${periodCurrent.month} tháng & ${periodCurrent.Interests.factor}% năm`;

        // const genPdf = await generateDeposit({
        //     id: newSavingBook.id,
        //     name: checkUser.fullName,
        //     type: ONLINE_SAVING_MESSAGE[accountType - 1],
        //     expirationDate: formatDate(expirationDate, 'VN'),
        //     createdAt: formatDate(newSavingBook.createdAt, 'VN'),
        //     deposit: formatMoney(deposit),
        //     interest: formatMoney(interest),
        //     totalAmount: formatMoney(deposit + interest),
        //     typeDeposit,
        // });

        // await mailer(checkUser.email, 'Mở tài khoản tiết kiệm', '', genPdf);
        await req.flash('info', 'Mở tài khoản thành công !');
        res.redirect(`/staff/accounts/${id_user}`);
    } catch (e) {
        console.error(e);
        res.redirect('back');
    }
};

module.exports.downloadSavingBook = async (req, res, next) => {
    try {
        const { id_user, id_account } = req.params;
        const infoAccount = await SavingsBook.findOne({
            where: {
                customerId: id_user,
                id: id_account,
            },
            include: [{ model: Customer }, { model: Interest, include: [{ model: Period }] }],
            nest: true,
            raw: true,
        });
        const typeDeposit = `${infoAccount.Interest.Period.month} tháng & ${infoAccount.Interest.factor}% năm`;

        const genPdf = await generateDeposit({
            id: infoAccount.id,
            name: infoAccount.Customer.fullName,
            type: ONLINE_SAVING_MESSAGE[infoAccount.accountType - 1],
            expirationDate: formatDate(infoAccount.expirationDate, 'VN'),
            createdAt: formatDate(infoAccount.createdAt, 'VN'),
            deposit: formatMoney(infoAccount.deposit),
            interest: formatMoney(infoAccount.interest),
            totalAmount: formatMoney(infoAccount.deposit + infoAccount.interest),
            typeDeposit,
        });
    } catch (e) {
        console.error('=== downloadSavingBook ===');
        console.error(e);
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
        infoAccount.messages = await req.consumeFlash('info');

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
            include: Customer,
        });

        if (!infoAccount) {
            return res.redirect('back');
        }

        let newBalance = infoAccount.deposit;

        if (infoAccount.state === STATE_ACCOUNT.FINISHED) {
            newBalance += infoAccount.interest;
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
            balance: newBalance,
        });
        await req.flash('info', 'Đáo hạn thành công !');
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
