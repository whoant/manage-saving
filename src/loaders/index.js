const expressLoader = require("./express");
const mysqlLoader = require("./mysql");
const jobLoader = require("./jobs");

module.exports = async expressApp => {
    await mysqlLoader();
    expressLoader(expressApp);
    jobLoader();
};