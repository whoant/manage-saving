const crypto = require('crypto');

const hash256 = (text) => {
    return crypto.createHash('sha256').update(text).digest('hex');
};

const formatDate = (time, locate = 'US') => {
    const date = new Date(time);
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;
    if (locate === 'US') return `${year}-${month}-${day}`;
    return `${day}-${month}-${year}`;
};

const covertPlainObject = (objORM) => {
    return objORM.map((obj) => obj.get({ plain: true }));
};

const formatMoney = (money) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(money);
};

const randomCharacters = (length) => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result;
};

module.exports = {
    hash256,
    formatDate,
    covertPlainObject,
    formatMoney,
    randomCharacters,
};
