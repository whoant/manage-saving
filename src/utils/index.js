const crypto = require("crypto");
const html_to_pdf = require("html-pdf-node");
const pug = require("pug");
const path = require("path");

const compiledFunction = pug.compileFile(path.join(__dirname, "..", "static", "deposit.pug"));

const hash256 = (text) => {
    return crypto.createHash("sha256").update(text).digest("hex");
};

const formatDate = (time, locate = "US") => {
    const date = new Date(time);
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    if (locate === "US") return `${year}-${month}-${day}`;
    return `${day}/${month}/${year}`;
};

const covertPlainObject = (objORM) => {
    return objORM.map((obj) => obj.get({ plain: true }));
};

const formatMoney = (money) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(money);
};

const randomCharacters = (length) => {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result;
};

const generateDeposit = ({
                             id,
                             name,
                             type,
                             createdAt,
                             expirationDate,
                             interest,
                             totalAmount,
                             typeDeposit,
                             deposit
                         }) => {

    const content = compiledFunction({
        id,
        type,
        name,
        createdAt,
        expirationDate,
        interest,
        totalAmount,
        typeDeposit,
        deposit
    });

    const options = { format: "A4" };
    return html_to_pdf.generatePdf({ content }, options);
};

module.exports = {
    hash256,
    formatDate,
    covertPlainObject,
    formatMoney,
    randomCharacters,
    generateDeposit
};
