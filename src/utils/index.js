const crypto = require('crypto');

module.exports.hash256 = text => {
    return crypto.createHash('sha256').update(text).digest('hex');
};

module.exports.formatDate = (time) => {
    const date = new Date(time);
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;
    return `${year}-${month}-${day}`;
};

module.exports.covertPlainObject = (objORM) => {
    return objORM.map(obj => obj.get({plain: true}));
};