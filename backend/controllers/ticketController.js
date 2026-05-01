const Ticket = require('../models/Ticket');
const User = require('../models/User');

exports.createTicket = async (req, res) => {
  try {
    const { title, description, targetRole } = req.body;
    const finalTargetRole = targetRole || 'Admin';

    const ticket = await Ticket.create({
      title,
      description,
      targetRole: finalTargetRole,
      raisedById: req.user.id
    });
    
    // Auto-create a notification
    const Notification = require('../models/Notification');
    
    if (finalTargetRole === 'Admin') {
      const admins = await User.findAll({ where: { role: 'Admin' } });
      const adminNotifications = admins.map(a => ({
        userId: a.id,
        message: `New ticket raised to Admin by ${req.user.name}: ${title}`,
        type: 'ticket'
      }));
      if (adminNotifications.length > 0) await Notification.bulkCreate(adminNotifications);
    } else {
      // Find Team Leaders (either all or those related to the user)
      // For simplicity here, notify all Team Leaders, or if we have Teams we could find leaders
      // Actually, since there's no strict "Team Leader" role (it's Member but they are leaderId of Team),
      // we can find all unique leaderIds from the Team model
      const Team = require('../models/Team');
      const teams = await Team.findAll();
      const leaderIds = [...new Set(teams.map(t => t.leaderId).filter(id => id))];
      
      const leaderNotifications = leaderIds.map(id => ({
        userId: id,
        message: `New ticket raised to Team Leaders by ${req.user.name}: ${title}`,
        type: 'ticket'
      }));
      if (leaderNotifications.length > 0) await Notification.bulkCreate(leaderNotifications);
    }

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create Ticket Error:', error);
    res.status(500).json({ message: 'Server error' });
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
      order: [['createdAt', 'DESC']]
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resolveTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    
    // Only Admin or Team Leader can resolve (simplified auth check: anyone but the raiser or role check in middleware)
    // Actually, middleware should restrict this route.
    ticket.status = 'Resolved';
    await ticket.save();
    
    // Notify the user who raised it
    const Notification = require('../models/Notification');
    await Notification.create({
      userId: ticket.raisedById,
      message: `Your ticket has been resolved: ${ticket.title}`,
      type: 'ticket'
    });
    
    res.json(ticket);
  } catch (error) {
    console.error('Resolve Ticket Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
