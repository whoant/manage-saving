const crypto = require('crypto');

module.exports.hash256 = text => {
    return crypto.createHash('sha256').update(text).digest('hex');

}