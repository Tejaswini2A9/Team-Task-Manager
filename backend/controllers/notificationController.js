const Notification = require('../models/Notification');
const Task = require('../models/Task');
const TaskMemberProgress = require('../models/TaskMemberProgress');
const { Op } = require('sequelize');

exports.getNotifications = async (req, res) => {
  try {
    // Fetch persistent notifications
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    
    // Generate dynamic reminders for tasks due in 1-2 days
    const today = new Date();
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(today.getDate() + 2);
    
    let whereClause = {
      dueDate: {
        [Op.between]: [today, twoDaysFromNow]
      },
      status: {
        [Op.ne]: 'Completed'
      }
    };
    
    if (req.user.role === 'Member') {
      const memberProgress = await TaskMemberProgress.findAll({ where: { userId: req.user.id } });
      const teamTaskIds = memberProgress.map(mp => mp.taskId);
      whereClause[Op.or] = [
        { assigneeId: req.user.id },
        { id: teamTaskIds }
      ];
    }
    
    const dueTasks = await Task.findAll({ where: whereClause });
    
    const dynamicNotifications = dueTasks.map(task => ({
      id: 'dyn_' + task.id,
      message: `Reminder: Task "${task.title}" is due soon! (${new Date(task.dueDate).toLocaleDateString()})`,
      type: 'task',
      isRead: false,
      createdAt: new Date()
    }));
    
    // Combine and sort
    const allNotifications = [...dynamicNotifications, ...notifications].sort((a, b) => b.createdAt - a.createdAt);
    
    res.json(allNotifications);
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, {
      where: { userId: req.user.id, isRead: false }
    });
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
