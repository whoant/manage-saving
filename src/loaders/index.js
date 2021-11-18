const expressLoader = require('./express');
const mysqlLoader = require('./mysql');

module.exports = async expressApp => {
    await mysqlLoader();
    expressLoader(expressApp);
};