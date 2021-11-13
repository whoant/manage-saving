const {Sequelize, DataTypes} = require('sequelize');

module.exports = sequelize => {
    return sequelize.define('SavingsBook', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4
        },
        deposit: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        interest: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        accountType: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        state: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        closingDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        expirationDate: {
            type: DataTypes.DATE,
            allowNull: false
        }
    });
};