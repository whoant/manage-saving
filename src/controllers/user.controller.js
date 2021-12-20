const { Customer, SavingsBook } = require('../models');
const {
    formatDate,
    hash256,
    covertPlainObject,
    formatMoney,
    randomCharacters,
} = require('../utils');
const mailer = require('../services/mailer');

const STATE_ACCOUNT = require('../config/stateAccount');
const { Op } = require('sequelize');

module.exports.get = async (req, res, next) => {
    const { user } = res.locals;
    let { search } = req.query;
    search = search || '';

    const listCustomer = await Customer.findAll({
        where: {
            identityNumber: {
                [Op.like]: `%${search}%`,
            },
        },
        order: [['createdAt', 'DESC']],
        include: SavingsBook,
    });

    const plainListCustomer = [];
    covertPlainObject(listCustomer).forEach((customer) => {
        let total = 0;
        let amount = 0;
        customer.SavingsBooks.forEach((book) => {
            if (book.state === STATE_ACCOUNT.PENDING) {
                amount += book.deposit;
                total += 1;
            }
        });
        plainListCustomer.push({
            ...customer,
            total,
            amount: formatMoney(amount),
            balance: formatMoney(customer.balance),
        });
    });
    const messages = await req.consumeFlash('info');
    res.render('staff/users', { name: user.name, listCustomer: plainListCustomer, messages });
};

module.exports.index = (req, res, next) => {
    const { user } = res.locals;
    res.render('staff/create-user', { name: user.name });
};

module.exports.createUser = async (req, res, next) => {
    const { fullName, identityNumber, username, email, phone, sex, address, birthday } = req.body;

    try {
        if (
            !fullName ||
            !identityNumber ||
            !username ||
            !email ||
            !phone ||
            !sex ||
            !address ||
            !birthday
        ) {
            throw new Error('Vui lòng nhập đủ thông tin !');
        }
        const subject = 'Mật khẩu mặc định';
        const password = randomCharacters(6);
        const html = `Mật khẩu mặc định của bạn: <b>${password}</b>`;

        await mailer(email, subject, html);
        req.body.password = hash256(password);
        await Customer.create(req.body);

        await req.flash('info', 'Tạo khách hàng thành công !');
        res.redirect('/staff/users');
    } catch (e) {
        let error = e.message;

        if (e.name === 'SequelizeUniqueConstraintError') {
            error = 'Số chức minh nhân dân đã đã kí';
        }

        return res.render('staff/create-user', {
            errors: [error],
            ...req.body,
        });
    }
};

module.exports.show = async (req, res, next) => {
    const { id_user } = req.params;

    try {
        const infoUser = await Customer.findOne({
            where: {
                id: id_user,
            },
            raw: true,
            nest: true,
        });

        if (infoUser === null) {
            throw new Error('Invalid id user');
        }

        const birthday = formatDate(infoUser.birthday);

        res.render('staff/edit-user', { ...infoUser, birthday });
    } catch (e) {
        return res.redirect('/staff/users');
    }
};

module.exports.put = async (req, res, next) => {
    const { id_user } = req.params;
    const { fullName, identityNumber, username, email, phone, sex, address, birthday } = req.body;

    try {
        if (
            !id_user ||
            !fullName ||
            !identityNumber ||
            !username ||
            !email ||
            !phone ||
            !sex ||
            !address ||
            !birthday
        ) {
            throw new Error('Vui lòng nhập đủ thông tin !');
        }
        const body = { ...req.body };

        await Customer.update(body, {
            where: {
                id: id_user,
            },
        });

        await req.flash('info', 'Cập nhập thông tin khách hàng thành công !');

        res.redirect('/staff/users');
    } catch (e) {
        let error = e.message;

        if (e.name === 'SequelizeUniqueConstraintError') {
            error = 'Số chức minh nhân dân đã đăng kí';
        }

        return res.render('staff/edit-user', {
            errors: [error],
            ...req.body,
        });
    }
};
