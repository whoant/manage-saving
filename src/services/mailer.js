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

module.exports = (to, subject, html, content = '') => {
    return new Promise((resolve, reject) => {
        let mainOptions = {
            from: 'Võ Văn Hoàng Tuân',
            to,
            subject,
            html,
        };

        if (content !== '') {
            mainOptions = {
                ...mainOptions,
                attachments: {
                    filename: 'file.pdf',
                    content,
                    contentType: 'application/pdf',
                },
            };
        }

        transporter.sendMail(mainOptions, (err, info) => {
            if (err) {
                reject(err);
            } else {
                resolve(info);
            }
        });
    });
};
