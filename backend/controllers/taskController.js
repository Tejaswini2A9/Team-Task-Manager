const Task = require('../models/Task');
const User = require('../models/User');
const Project = require('../models/Project');
const Team = require('../models/Team');
const TaskMemberProgress = require('../models/TaskMemberProgress');
const { Op } = require('sequelize');

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, estimatedHours, loggedHours, dueDate, projectId, assigneeId, teamId } = req.body;
    const task = await Task.create({
      title,
      description,
      status,
      priority: priority || 'Medium',
      estimatedHours: estimatedHours || 0,
      loggedHours: loggedHours || 0,
      dueDate: dueDate || null,
      projectId: projectId || null,
      assigneeId: assigneeId || null,
      teamId: teamId || null,
    });

    if (teamId) {
      const team = await Team.findByPk(teamId, { include: [{ model: User, as: 'members' }] });
      if (team && team.members) {
        const progressEntries = team.members.map(member => ({
          taskId: task.id,
          userId: member.id,
        }));
        await TaskMemberProgress.bulkCreate(progressEntries);
      }
    }

    res.status(201).json(task);
  } catch (error) {
    console.error('Create Task Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    let whereClause = {};
    if (req.user.role === 'Member') {
      const memberProgress = await TaskMemberProgress.findAll({ where: { userId: req.user.id } });
      const teamTaskIds = memberProgress.map(mp => mp.taskId);
      whereClause = {
        [Op.or]: [
          { assigneeId: req.user.id },
          { id: teamTaskIds }
        ]
      };
    }

    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name'] },
        { model: Project, attributes: ['id', 'name'] },
        { model: Team, as: 'team', attributes: ['id', 'name', 'leaderId'], include: [{ model: User, as: 'members', attributes: ['id', 'name'] }] },
        { model: TaskMemberProgress, as: 'memberProgress', include: [{ model: User, as: 'user', attributes: ['id', 'name'] }] }
      ]
    });
    res.json(tasks);
  } catch (error) {
    console.error('Get Tasks Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    task.status = status;
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTaskMemberProgress = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    
    const progress = await TaskMemberProgress.findOne({ where: { taskId, userId } });
    if (!progress) return res.status(404).json({ message: 'Progress record not found' });
    
    progress.status = 'Completed';
    await progress.save();
    
    res.json(progress);
  } catch (error) {
    console.error('Update Member Progress Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, assigneeId, teamId, projectId, status, priority, estimatedHours, loggedHours } = req.body;
    
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assigneeId !== undefined) task.assigneeId = assigneeId;
    if (teamId !== undefined) task.teamId = teamId;
    if (projectId !== undefined) task.projectId = projectId;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (loggedHours !== undefined) task.loggedHours = loggedHours;
    
    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Update Task Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    await task.destroy();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete Task Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
