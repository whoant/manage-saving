const { DataTypes, Sequelize } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define(
        'Var',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            value: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
        },
        {
            timestamps: false,
        }
    );
};
