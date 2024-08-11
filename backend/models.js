const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});

const Event = sequelize.define('Event', {
    startYear: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    startEra: {
        type: DataTypes.STRING,
        allowNull: false
    },
    endYear: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    endEra: {
        type: DataTypes.STRING,
        allowNull: false
    },
    region: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

// Sync the database
sequelize.sync();

module.exports = Event;
