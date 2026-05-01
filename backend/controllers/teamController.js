const { Team, User } = require('../models');

exports.createTeam = async (req, res) => {
  try {
    const { name, leaderId, memberIds } = req.body;
    const team = await Team.create({ name, leaderId });
    if (memberIds && memberIds.length > 0) {
      await team.setMembers(memberIds);
    }
    const result = await Team.findByPk(team.id, {
      include: [
        { model: User, as: 'leader',  attributes: ['id', 'name'] },
        { model: User, as: 'members', attributes: ['id', 'name'], through: { attributes: [] } }
      ]
    });
    res.status(201).json(result);
  } catch (error) {
    console.error('Create Team Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.findAll({
      include: [
        { model: User, as: 'leader',  attributes: ['id', 'name'] },
        { model: User, as: 'members', attributes: ['id', 'name'], through: { attributes: [] } }
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(teams);
  } catch (error) {
    console.error('Get Teams Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    const { name, leaderId, memberIds } = req.body;
    if (name !== undefined) team.name = name;
    if (leaderId !== undefined) team.leaderId = leaderId;
    await team.save();
    if (memberIds && Array.isArray(memberIds)) {
      await team.setMembers(memberIds);
    }
    const result = await Team.findByPk(team.id, {
      include: [
        { model: User, as: 'leader',  attributes: ['id', 'name'] },
        { model: User, as: 'members', attributes: ['id', 'name'], through: { attributes: [] } }
      ]
    });
    res.json(result);
  } catch (error) {
    console.error('Update Team Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    await team.destroy();
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Delete Team Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
