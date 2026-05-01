/**
 * Central model registry — loads all models and defines associations in one place.
 * Import THIS file instead of importing models directly so that associations are
 * always set up before any query runs.
 */
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// ─── Model Definitions ───────────────────────────────────────────────────────

const User = sequelize.define('User', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:       { type: DataTypes.STRING,  allowNull: false },
  email:      { type: DataTypes.STRING,  allowNull: false, unique: true },
  password:   { type: DataTypes.STRING,  allowNull: false },
  role:       { type: DataTypes.ENUM('Admin', 'Member'), defaultValue: 'Member' },
  otp:        { type: DataTypes.STRING,  allowNull: true },
  otpExpiry:  { type: DataTypes.DATE,    allowNull: true },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

const Project = sequelize.define('Project', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING,  allowNull: false },
  description: { type: DataTypes.TEXT },
}, { timestamps: true });

const Team = sequelize.define('Team', {
  id:   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING,  allowNull: false },
}, { timestamps: true });

const Task = sequelize.define('Task', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title:          { type: DataTypes.STRING,  allowNull: false },
  description:    { type: DataTypes.TEXT },
  status:         { type: DataTypes.ENUM('To Do', 'In Progress', 'Completed', 'Blocked'), defaultValue: 'To Do' },
  priority:       { type: DataTypes.ENUM('Low', 'Medium', 'High'), defaultValue: 'Medium' },
  estimatedHours: { type: DataTypes.FLOAT, defaultValue: 0 },
  loggedHours:    { type: DataTypes.FLOAT, defaultValue: 0 },
  dueDate:        { type: DataTypes.DATE },
}, { timestamps: true });

const TaskMemberProgress = sequelize.define('TaskMemberProgress', {
  id:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  status: { type: DataTypes.ENUM('Pending', 'Completed'), defaultValue: 'Pending' },
}, { timestamps: true });

const Ticket = sequelize.define('Ticket', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title:       { type: DataTypes.STRING,  allowNull: false },
  description: { type: DataTypes.TEXT },
  status:      { type: DataTypes.ENUM('Open', 'Resolved'), defaultValue: 'Open' },
  targetRole:  { type: DataTypes.ENUM('Admin', 'Team Leader'), defaultValue: 'Admin' },
}, { timestamps: true });

const Notification = sequelize.define('Notification', {
  id:      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  message: { type: DataTypes.TEXT,    allowNull: false },
  type:    { type: DataTypes.STRING },
  isRead:  { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

// ─── Associations ─────────────────────────────────────────────────────────────

// Project ↔ User (creator)
Project.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });
User.hasMany(Project, { foreignKey: 'creatorId' });

// Team ↔ User (leader)
Team.belongsTo(User, { as: 'leader', foreignKey: 'leaderId' });
User.hasMany(Team, { foreignKey: 'leaderId' });

// Team ↔ User (members – many-to-many)
Team.belongsToMany(User, { as: 'members', through: 'TeamMembers', foreignKey: 'teamId', otherKey: 'userId' });
User.belongsToMany(Team, { as: 'teams',   through: 'TeamMembers', foreignKey: 'userId', otherKey: 'teamId' });

// Task ↔ Project
Task.belongsTo(Project, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Project.hasMany(Task, { foreignKey: 'projectId' });

// Task ↔ User (assignee)
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assigneeId' });

// Task ↔ Team
Task.belongsTo(Team, { as: 'team', foreignKey: 'teamId' });

// TaskMemberProgress ↔ Task
TaskMemberProgress.belongsTo(Task, { foreignKey: 'taskId', onDelete: 'CASCADE' });
Task.hasMany(TaskMemberProgress, { as: 'memberProgress', foreignKey: 'taskId' });

// TaskMemberProgress ↔ User
TaskMemberProgress.belongsTo(User, { as: 'user', foreignKey: 'userId', onDelete: 'CASCADE' });

// Ticket ↔ User (raisedBy)
Ticket.belongsTo(User, { as: 'raisedBy', foreignKey: 'raisedById' });
User.hasMany(Ticket, { foreignKey: 'raisedById' });

// Notification ↔ User
Notification.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Notification, { foreignKey: 'userId' });

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  sequelize,
  User,
  Project,
  Team,
  Task,
  TaskMemberProgress,
  Ticket,
  Notification,
};
