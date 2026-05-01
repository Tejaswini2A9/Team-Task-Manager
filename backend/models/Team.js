const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Team = sequelize.define('Team', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Team.belongsTo(User, { as: 'leader', foreignKey: 'leaderId' });
User.hasMany(Team, { foreignKey: 'leaderId' });

Team.belongsToMany(User, { as: 'members', through: 'TeamMembers', foreignKey: 'teamId', otherKey: 'userId' });
User.belongsToMany(Team, { as: 'teams', through: 'TeamMembers', foreignKey: 'userId', otherKey: 'teamId' });

module.exports = Team;
