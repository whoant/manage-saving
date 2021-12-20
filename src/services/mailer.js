const nodemailer = require('nodemailer');
const { MAIL_USER, MAIL_PASS } = require('../config');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
    },
});

module.exports = (to, subject, html) => {
    return new Promise((resolve, reject) => {
        const mainOptions = {
            from: 'Võ Văn Hoàng Tuân',
            to,
            subject,
            html,
        };
        transporter.sendMail(mainOptions, function (err, info) {
            if (err) {
                reject(err);
            } else {
                resolve(info);
            }
        });
    });
};
