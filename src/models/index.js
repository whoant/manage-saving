const {DATABASE} = require('../config');
const {Sequelize} = require("sequelize");

const OfficeModel = require('./office.model');
const StaffModel = require('./staff.model');
const CustomerModel = require('./customer.model');
const InterestModel = require('./interest.model');
const PeriodModel = require('./period.model');
const SavingsBookModel = require('./savingsBook.model');

const {DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS} = DATABASE;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: "mysql",
    // logging: false,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});

const Office = OfficeModel(sequelize);
const Staff = StaffModel(sequelize);
const Customer = CustomerModel(sequelize);
const Interest = InterestModel(sequelize);
const Period = PeriodModel(sequelize);
const SavingsBook = SavingsBookModel(sequelize);

module.exports = {
    Office,
    Staff,
    Customer,
    Interest,
    Period,
    SavingsBook,
    sequelize
};


