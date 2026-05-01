const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Task = require('./Task');
const User = require('./User');

const TaskMemberProgress = sequelize.define('TaskMemberProgress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Completed'),
    defaultValue: 'Pending',
  },
});

TaskMemberProgress.belongsTo(Task, { foreignKey: 'taskId', onDelete: 'CASCADE' });
Task.hasMany(TaskMemberProgress, { as: 'memberProgress', foreignKey: 'taskId' });

TaskMemberProgress.belongsTo(User, { as: 'user', foreignKey: 'userId', onDelete: 'CASCADE' });

module.exports = TaskMemberProgress;
