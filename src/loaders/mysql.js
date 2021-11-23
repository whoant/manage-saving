const {sequelize} = require('../models');

module.exports = async () => {
    try {
        await sequelize.sync({alter: true, force: false});
        console.log('Connect database successfully');
    } catch (e) {
        console.error('Connect database failed');
        console.error(e);
        process.exit(0);
    }

};