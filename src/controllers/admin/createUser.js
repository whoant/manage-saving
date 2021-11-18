const {Office, Staff} = require("../../models");
module.exports.get = async (req, res, next) => {
    try {
        const listOffices = await Office.findAll({
            attributes: ['id', 'name']
        })
        res.render('admin/create-user', {listOffices});

    } catch (e) {
        console.error(e);
    }
};

module.exports.post = async (req, res, next) => {
    const {name, username, password, email, phone, sex, birthday, office} = req.body
    try {

        if (!name || !username || !password || !email || !phone || !sex || !birthday || !office) {
            return res.render('admin/create-user', {
                ...req.body,
                errors: ['Vui lòng nhập đủ thông tin của nhân viên !']
            });
        }


    } catch (e) {
        console.error(e);
    }
};