const {Staff, Office} = require('../../models');

module.exports.get = async (req, res, next) => {
    try {
        const countOffice = await Office.count();
        const countStaff = await Staff.count();
        res.render('admin/home', {
            countOffice,
            countStaff
        });

    } catch (e) {
        res.render('admin/home', {
            countOffice: 0,
            countStaff: 0
        });
    }
};