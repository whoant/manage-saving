const {Customer, SavingsBook} = require('../models');
const {formatDate, hash256, covertPlainObject, formatMoney} = require("../utils");

const STATE_ACCOUNT = require('../config/stateAccount');


module.exports.get = async (req, res, next) => {
    const {user} = res.locals;
    const listCustomer = await Customer.findAll({
        order: [["createdAt", "DESC"]],
        include: SavingsBook
    });

    const plainListCustomer = [];
    covertPlainObject(listCustomer).forEach(customer => {
        let total = 0;
        let amount = 0;
        customer.SavingsBooks.forEach(book => {
            if (book.state === STATE_ACCOUNT.PENDING) {
                amount += book.deposit
                total += 1
            }
        });
        plainListCustomer.push({
            ...customer,
            total,
            amount: formatMoney(amount),
            balance: formatMoney(customer.balance)
        });
    });

    res.render('staff/users', {name: user.name, listCustomer: plainListCustomer});
};

module.exports.create = (req, res, next) => {
    const {user} = res.locals;
    res.render('staff/create-user', {name: user.name});
};

module.exports.createUser = async (req, res, next) => {
    const {fullName, identityNumber, username, password, email, phone, sex, address, birthday} = req.body;

    try {
        if (!fullName || !identityNumber || !username || !password || !email || !phone || !sex || !address || !birthday) {
            throw new Error('Vui lòng nhập đủ thông tin !');

        }
        req.body.password = hash256(req.body.password);
        await Customer.create(req.body);
        const listCustomer = await Customer.findAll();
        res.render('staff/users', {
            msg: "Tạo khách hàng thành công !",
            listCustomer
        });

    } catch (e) {
        console.error(e);
        let error = e.message;

        if (e.name === 'SequelizeUniqueConstraintError') {
            error = "Số chức minh nhân dân đã đã kí"
        }

        return res.render('staff/create-user', {
            errors: [error],
            ...req.body
        })
    }
};

module.exports.show = async (req, res, next) => {
    const {id_user} = req.params;

    try {
        const infoUser = await Customer.findOne({
            where: {
                id: id_user
            },
            raw: true,
            nest: true
        });

        if (infoUser === null) {
            throw new Error("Invalid id user");
        }

        const birthday = formatDate(infoUser.birthday);

        res.render('staff/edit-user',
            {...infoUser, birthday},
        );

    } catch (e) {
        console.log(e);
        return res.redirect('/staff/users');
    }
};

module.exports.put = async (req, res, next) => {
    const {id_user} = req.params;
    const {fullName, identityNumber, username, email, phone, sex, address, birthday} = req.body;

    try {

        if (!id_user || !fullName || !identityNumber || !username || !email || !phone || !sex || !address || !birthday) {
            throw new Error('Vui lòng nhập đủ thông tin !');
        }
        const body = {...req.body};
        // body.password = hash256(body.password);

        await Customer.update(body, {
            where: {
                id: id_user
            }
        });
        const listCustomer = await Customer.findAll();
        res.render('staff/users', {
            msg: "Cập nhập thông tin khách hàng thành công !",
            listCustomer
        });
    } catch (e) {
        console.error(e);
        let error = e.message;

        if (e.name === 'SequelizeUniqueConstraintError') {
            error = "Số chức minh nhân dân đã đăng kí"
        }

        return res.render('staff/edit-user', {
            errors: [error],
            ...req.body
        })
    }
};