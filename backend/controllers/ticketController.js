const { Ticket, User, Notification, Team } = require('../models');

exports.createTicket = async (req, res) => {
  try {
    const { title, description, targetRole } = req.body;
    const finalTargetRole = targetRole || 'Admin';

    const ticket = await Ticket.create({
      title,
      description,
      targetRole: finalTargetRole,
      raisedById: req.user.id,
    });

    if (finalTargetRole === 'Admin') {
      const admins = await User.findAll({ where: { role: 'Admin' } });
      const adminNotifications = admins.map(a => ({
        userId: a.id,
        message: `New ticket raised by a member: "${title}"`,
        type: 'ticket',
      }));
      if (adminNotifications.length > 0) await Notification.bulkCreate(adminNotifications);
    } else {
      const teams = await Team.findAll({ attributes: ['leaderId'] });
      const leaderIds = [...new Set(teams.map(t => t.leaderId).filter(Boolean))];
      const leaderNotifications = leaderIds.map(id => ({
        userId: id,
        message: `New ticket raised to Team Leaders: "${title}"`,
        type: 'ticket',
      }));
      if (leaderNotifications.length > 0) await Notification.bulkCreate(leaderNotifications);
    }

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create Ticket Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTickets = async (req, res) => {
  try {
    let whereClause = {};
    if (req.user.role === 'Member') {
      whereClause.raisedById = req.user.id;
    }
    const tickets = await Ticket.findAll({
      where: whereClause,
      include: [{ model: User, as: 'raisedBy', attributes: ['id', 'name', 'role'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(tickets);
  } catch (error) {
    console.error('Get Tickets Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.resolveTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.status = 'Resolved';
    await ticket.save();

    await Notification.create({
      userId: ticket.raisedById,
      message: `Your ticket has been resolved: "${ticket.title}"`,
      type: 'ticket',
    });

    res.json(ticket);
  } catch (error) {
    console.error('Resolve Ticket Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
