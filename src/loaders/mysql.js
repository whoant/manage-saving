const {sequelize} = require('../models');

module.exports = async () => {
    await sequelize.sync({alter: true});
};