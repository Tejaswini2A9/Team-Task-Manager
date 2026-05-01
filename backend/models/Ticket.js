const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('Open', 'Resolved'),
    defaultValue: 'Open',
  },
  targetRole: {
    type: DataTypes.ENUM('Admin', 'Team Leader'),
    defaultValue: 'Admin',
  }
});

Ticket.belongsTo(User, { as: 'raisedBy', foreignKey: 'raisedById' });
User.hasMany(Ticket, { foreignKey: 'raisedById' });

module.exports = Ticket;
