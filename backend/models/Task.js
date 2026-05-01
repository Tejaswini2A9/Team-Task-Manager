const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Project = require('./Project');
const User = require('./User');
const Team = require('./Team');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('To Do', 'In Progress', 'Completed', 'Blocked'),
    defaultValue: 'To Do',
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    defaultValue: 'Medium',
  },
  estimatedHours: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  loggedHours: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  dueDate: {
    type: DataTypes.DATE,
  },
}, {
  timestamps: true,
});

Task.belongsTo(Project, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Project.hasMany(Task, { foreignKey: 'projectId' });

Task.belongsTo(User, { as: 'assignee', foreignKey: 'assigneeId' });
Task.belongsTo(Team, { as: 'team', foreignKey: 'teamId' });

module.exports = Task;
