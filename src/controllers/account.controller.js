const {Customer, SavingsBook} = require('../models');

module.exports.index = async (req, res, next) => {

};

module.exports.show = async (req, res, next) => {
    const {id_user} = req.params;

    try {
        const geAccountsOfUser = await Customer.findOne({
            where: {
                id: id_user
            },
            include: 'SavingsBooks',
            raw: true,
            nest: true

        });
        // console.log(geAccountsOfUser);
        res.render('account/show', {geAccountsOfUser});

    } catch (e) {
        console.error(e);
    }
};

module.exports.createAccount = async (req, res, next) => {
    res.render('account/create');
};