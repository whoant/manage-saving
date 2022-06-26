const { hash256 } = require("../utils");
const { Staff, Office } = require("../models");


module.exports.get = async (req, res, next) => {
    const { id } = req.signedCookies;

    // if (id) {
    //     return res.redirect("back");
    // }
    const errors = await req.consumeFlash("error");
    res.render("auth/login", { errors });
};

module.exports.post = async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const checkUser = await Staff.findOne({
            where: {
                username
            },
            include: Office
        });

        if (!checkUser || checkUser.password !== hash256(password)) {
            await req.flash("error", "Vui lòng kiểm tra lại thông tin tài khoản !");
            return res.redirect("/auth");

        }

        res.cookie("id", checkUser.id, { signed: true });

        if (checkUser.Office.short_name === "nhan_vien") {
            return res.redirect("/staff");
        } else if (checkUser.Office.short_name === "giam_doc") {
            return res.redirect("/manager");
        } else if (checkUser.Office.short_name === "quan_tri_vien") {
            return res.redirect("/admin");
        }
    } catch (e) {
        console.log(e);
    }
};

module.exports.logout = async (req, res) => {
    res.clearCookie("id");
    res.redirect("/auth");
};


module.exports.getDetailPassword = async (req, res, next) => {
    const { user } = res.locals;

    const [messages, errors] = await Promise.all([
        req.consumeFlash("info"),
        req.consumeFlash("error")
    ]);

    let viewUrl = "staff/info";
    switch (user.Office.short_name) {
        case "quan_tri_vien":
            viewUrl = "admin/info"
            break;
        case "giam_doc":
            viewUrl = "manage/info"
            break;
    }

    res.render(viewUrl, {
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
        next(e);
    }
    res.redirect("/manager/info");
};