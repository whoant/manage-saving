const { Customer, SavingsBook } = require("../models");
const STATE_ACCOUNT = require('../config/stateAccount');
const { Op } = require("sequelize");
const _ = require('lodash');
const moment = require("moment");

module.exports.getDashboard = async (req, res, next) => {
    const { user } = res.locals;
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

        let pathTemplate = "admin/dashboard.pug";

        switch (user.Office.short_name) {
            case "nhan_vien":
                pathTemplate = "staff/dashboard.pug"
                break;
            case "giam_doc":
                pathTemplate = "manager/dashboard.pug"
                break;
        }

        res.render(pathTemplate, {
            countCustomer,
            countSavingBook,
            countValidSavingBook,
            countInvalidSavingBook,
        })
    } catch (e) {
        res.render("dashboard/home.pug");
        next(e);
    }
};

module.exports.getAnalyzeUser = async (req, res, next) => {
    try {

        const listUser = await Customer.findAll({
            attributes: ['id', 'createdAt'],
            nest: true,
            raw: true
        });

        const groupedByMonth = _.groupBy(listUser, function (item) {
            return moment(item.createdAt).month() + 1;
        });

        const months = Object.keys(groupedByMonth);

        const data = [];
        const categories = [];

        months.forEach(month => {
            data.push(groupedByMonth[month].length);
            categories.push(`Tháng ${month}`);
        })

        const result = {
            series: [{
                name: "Số lượng khách hàng",
                data,
            }],
            xaxis: {
                categories
            }
        };

        res.json({
            status: "success",
            data: { chart: result }
        });

    } catch (e) {
        next(e);
    }
};


module.exports.getAnalyzeSavingBooks = async (req, res, next) => {
    try {

        const listSavingBookOpen = await SavingsBook.findAll({
            nest: true,
            raw: true
        });

        const listSavingBookClose = await SavingsBook.findAll({
            where: {
                state: {
                    [Op.or]: [STATE_ACCOUNT.FINISHED, STATE_ACCOUNT.ON_TIME]
                }
            },
            nest: true,
            raw: true
        });

        const groupedCreatedByMonth = _.groupBy(listSavingBookOpen, function (item) {
            return moment(item.createdAt).month() + 1;
        });

        const groupedCloseByMonth = _.groupBy(listSavingBookClose, function (item) {
            return moment(item.closingDate).month() + 1;
        });

        const monthsCreated = Object.keys(groupedCreatedByMonth);
        const monthsClose = Object.keys(groupedCloseByMonth);

        const dataOpen = [];
        const dataClose = [];
        const categories = [];
        const categorySet = new Set();

        const data = new Map();


        monthsCreated.forEach(month => {
            data.set(month, {
                month: `Tháng ${month}`,
                open: groupedCreatedByMonth[month].length,
                close: 0
            });
        });

        monthsClose.forEach(month => {
            const temp = data.get(month);
            if (temp) {
                const newData = {
                    ...temp,
                    close: groupedCloseByMonth[month].length
                }
                data.set(month, newData);
            } else {
                data.set(month, {
                    month: `Tháng ${month}`,
                    open: 0,
                    close: groupedCloseByMonth[month].length
                });
            }
        });

        data.forEach(item => {
            categories.push(item.month);
            dataOpen.push(item.open);
            dataClose.push(item.close);
        });

        const result = {
            series: [{
                name: 'Tổng sổ mở',
                data: dataOpen
            }, {
                name: 'Tổng sổ đóng',
                data: dataClose
            }],
            xaxis: {
                categories
            }
        };

        res.json({
            status: "success",
            data: { chart: result }
        });

    } catch (e) {
        next(e);
    }
};
