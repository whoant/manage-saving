const {Period, Interest} = require('../models/index');
const {formatDateVN} = require("../utils");

module.exports.index = async (req, res, next) => {
    const {user} = res.locals;
    res.render('manager/index', user);
};

module.exports.indexInterest = async (req, res, next) => {
    try {
        const periods = await Period.findAll({order: [['createdAt', 'DESC']]});
        const interests = await Interest.findAll({
            include: 'Period',
            raw: true,
            nest: true,
            order: [['createdAt', 'DESC']]
        });

        const interestsRender = interests.map(interest => {
            const {createdAt} = interest;
            return {...interest, created: formatDateVN(createdAt)};
        });

        res.render('manager/interest', {
            periods,
            interests: interestsRender
        });

    } catch (e) {
        console.error(e);
    }
};

module.exports.createInterest = async (req, res, next) => {
    const {name, factor, periodId} = req.body;
    try {

        await Interest.create({name, factor, periodId});
        res.redirect('back');
    } catch (e) {
        console.error(e);
    }
};

module.exports.indexPeriods = async (req, res, next) => {
    try {
        const periods = await Period.findAll({order: [['createdAt', 'DESC']]});
        res.render('manager/periods', {periods});

    } catch (e) {
        console.error(e);
    }
};

module.exports.createPeriods = async (req, res, next) => {
    const {name, month} = req.body;

    try {
        await Period.create({name, month});
        // res.render('manager/periods')
        res.redirect('back');
    } catch (e) {
        console.error(e);
    }
}