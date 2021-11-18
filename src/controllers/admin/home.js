const {Staff, Office} = require('../../models');


module.exports.getListUser = async (req, res, next) => {
    try {
        const listStaff = await Staff.findAll({
            include: Office
        });
        // console.log(listUsers);
        res.json({
            msg: 'ok',
            data: listStaff
        });

    } catch (e) {
        console.error(e);
    }
}