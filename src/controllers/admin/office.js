const {Office, Staff} = require("../../models");

module.exports.get = async (req, res, next) => {
    try {
        const listOffices = await Office.findAll({
            attributes: ['id', 'name'],
            include: Staff
        });
   
        res.render('admin/office', {listOffices});
    } catch (e) {
        console.log(e);
    }
};