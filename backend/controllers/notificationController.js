const { Notification, Task, TaskMemberProgress } = require('../models');
const { Op } = require('sequelize');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    // Generate dynamic reminders for tasks due within 2 days
    const today = new Date();
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(today.getDate() + 2);

    let whereClause = {
      dueDate: { [Op.between]: [today, twoDaysFromNow] },
      status:  { [Op.ne]: 'Completed' },
    };

    if (req.user.role === 'Member') {
      const memberProgress = await TaskMemberProgress.findAll({ where: { userId: req.user.id } });
      const teamTaskIds = memberProgress.map(mp => mp.taskId);
      whereClause[Op.or] = [
        { assigneeId: req.user.id },
        { id: { [Op.in]: teamTaskIds.length ? teamTaskIds : [0] } },
      ];
    }

    const dueTasks = await Task.findAll({ where: whereClause });
    const dynamicNotifications = dueTasks.map(task => ({
      id: 'dyn_' + task.id,
      message: `Reminder: Task "${task.title}" is due soon! (${new Date(task.dueDate).toLocaleDateString()})`,
      type: 'task',
      isRead: false,
      createdAt: new Date(),
    }));

    const allNotifications = [...dynamicNotifications, ...notifications]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(allNotifications);
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, {
      where: { userId: req.user.id, isRead: false },
    });
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Mark As Read Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
