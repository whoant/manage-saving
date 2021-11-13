const expressLoader = require('./express');
const mysqlLoader = require('./mysql');

module.exports = expressApp => {
    mysqlLoader();
    expressLoader(expressApp);
};