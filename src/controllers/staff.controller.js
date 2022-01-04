const { hash256 } = require("../utils");

module.exports.get = (req, res, next) => {
    const { user } = res.locals;
    res.render("staff/index", {
        name: user.name
    });
};

module.exports.getDetailPassword = async (req, res, next) => {
    const { user } = res.locals;
    const messages = await req.consumeFlash("info");
    const errors = await req.consumeFlash("error");
    res.render("staff/info", {
        name: user.name,
        messages,
        errors
    });
};

module.exports.updatePassword = async (req, res, next) => {
    const { oldPassword, newPassword, repeatPassword } = req.body;

    try {
        const { user } = res.locals;
        if (newPassword !== repeatPassword) {
            throw new Error("Hai mật khẩu không khớp nhau");
        }

        if (user.password !== hash256(oldPassword)) {
            throw new Error("Mật khẩu cũ không khớp !");
        }

        user.password = hash256(newPassword);
        await user.save();

        await req.flash("info", "Cập nhập mật khẩu thành công !");
    } catch (e) {
        await req.flash("error", e.message);
    }
    res.redirect("/staff/info");
};

module.exports.put = (req, res, next) => {
};
