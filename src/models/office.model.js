const {Sequelize, DataTypes} = require('sequelize');

module.exports = sequelize => {
    return sequelize.define('Office', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4
        },
        short_name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })
};