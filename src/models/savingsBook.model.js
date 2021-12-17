const { Sequelize, DataTypes, DATE } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('SavingsBook', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },
        deposit: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        interest: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        accountType: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        state: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        expirationDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        closingDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });
};
