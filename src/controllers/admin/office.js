const { Office, Staff } = require('../../models');

module.exports.get = async (req, res, next) => {
    try {
        const listOffices = await Office.findAll({
            attributes: ['id', 'name'],
            include: Staff,
        });
        const messages = await req.consumeFlash('info');
        res.render('admin/office', { listOffices, messages });
    } catch (e) {
        next(e);
    }
};
