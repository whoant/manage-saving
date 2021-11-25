const {DATABASE} = require('../config');
const {Sequelize} = require("sequelize");

const OfficeModel = require('./office.model');
const StaffModel = require('./staff.model');
const CustomerModel = require('./customer.model');
const InterestModel = require('./interest.model');
const PeriodModel = require('./period.model');
const SavingsBookModel = require('./savingsBook.model');
const ParameterModel = require('./parameter.model');
const FormCreateModel = require('./formCreate.model');
const FormCloseModel = require('./formClose.model');

const {DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS} = DATABASE;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: "mysql",
    logging: false,
    pool: {
        max: 10,
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
const Parameter = ParameterModel(sequelize);
const FormCreate = FormCreateModel(sequelize);
const FormClose = FormCloseModel(sequelize);

Office.hasMany(Staff, {
    foreignKey: 'officeId'
});

Staff.belongsTo(Office, {
    foreignKey: 'officeId'
});

Customer.hasMany(SavingsBook, {
    foreignKey: 'customerId'
});

SavingsBook.belongsTo(Customer, {
    foreignKey: 'customerId'
});

FormCreate.belongsTo(SavingsBook, {
    foreignKey: 'savingsBookId'
});

SavingsBook.hasOne(FormCreate, {
    foreignKey: 'savingsBookId'
});

Staff.hasMany(FormCreate, {
    foreignKey: 'staffId'
});

FormCreate.belongsTo(Staff, {
    foreignKey: 'staffId'
});


Staff.hasMany(FormClose, {
    foreignKey: 'staffId'
});

FormClose.belongsTo(Staff, {
    foreignKey: 'staffId'
});

FormClose.belongsTo(SavingsBook, {
    foreignKey: 'savingsBookId'
});

SavingsBook.hasOne(FormClose, {
    foreignKey: 'savingsBookId'
});


Period.hasMany(Interest, {
    foreignKey: 'periodId'
});

Interest.belongsTo(Period, {
    foreignKey: 'periodId'
});

Interest.hasMany(SavingsBook, {
    foreignKey: 'interestId'
});

SavingsBook.belongsTo(Interest, {
    foreignKey: 'interestId'
});

module.exports = {
    Office,
    Staff,
    Customer,
    Interest,
    Period,
    SavingsBook,
    Parameter,
    FormCreate,
    sequelize
};


