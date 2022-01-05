const { Period, Interest } = require("../models/index");
const { formatDate, hash256, covertPlainObject } = require("../utils");

module.exports.index = async (req, res, next) => {
    const { user } = res.locals;
    res.render("manager/index", user);
};

module.exports.indexInterest = async (req, res, next) => {
    try {
        let { type } = req.query;

        const periods = await getListPeriods();

        let interests = [];
        let interestsRender = [];
        if (type === "all") {
            interests = await Interest.findAll({
                include: "Period",
                raw: true,
                nest: true,
                order: [["createdAt", "DESC"]]
            });

            interestsRender = interests.map((interest) => {
                const { createdAt } = interest;
                interest.periodName = interest.Period.name;
                return { ...interest, created: formatDate(createdAt, "VN") };
            });
        } else {

            const listPeriodsRender = [];
            covertPlainObject(periods).forEach((period) => {
                if (period.Interests.length !== 0) {
                    listPeriodsRender.push({ ...period, Interests: period.Interests[0] });
                }
            });
            interestsRender = listPeriodsRender.map(period => {
                const { Interests } = period;
                const { name, factor, createdAt } = Interests;
                return {
                    name: name,
                    factor: factor,
                    periodName: period.name,
                    created: formatDate(createdAt, "VN")
                };
            });
        }

        const messages = await req.consumeFlash("info");
        
        res.render("manager/interest", {
            periods,
            interests: interestsRender,
            messages,
            type
        });
    } catch (e) {
        next(e);
    }
};

module.exports.createInterest = async (req, res, next) => {
    const { name, factor, periodId } = req.body;
    try {
        await Interest.create({ name, factor, periodId });
        await req.flash("info", "Thêm lãi suất mới thành công !");
        res.redirect("back");
    } catch (e) {
        next(e);
    }
};

module.exports.indexPeriods = async (req, res, next) => {
    try {
        const periods = await Period.findAll({ order: [["month", "DESC"]] });
        const [messages, errors] = await Promise.all([
            req.consumeFlash("info"),
            req.consumeFlash("error")
        ]);

        res.render("manager/periods", { periods, messages, errors });
    } catch (e) {
        next(e);
    }
};

module.exports.createPeriods = async (req, res, next) => {
    const { name, month } = req.body;

    try {
        const getMonth = await Period.findOne({
            where: {
                month
            }
        });

        if (getMonth) {
            throw new Error("Số tháng này đã tồn tại trên hệ thống !");
        }

        await Period.create({ name, month });
        await req.flash("info", "Thêm kì hạn thành công !");
    } catch (e) {
        await req.flash("error", e.message);
        next(e);
    }
    res.redirect("back");
};

module.exports.getDetailPassword = async (req, res, next) => {
    const { user } = res.locals;
    const [messages, errors] = await Promise.all([
        req.consumeFlash("info"),
        req.consumeFlash("error")
    ]);
    res.render("manager/info", {
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


function getListPeriods() {
    return Period.findAll({
        include: Interest,
        order: [
            ["month", "ASC"],
            [Interest, "createdAt", "DESC"]
        ]
    });
}