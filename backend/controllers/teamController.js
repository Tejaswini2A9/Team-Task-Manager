const Team = require('../models/Team');
const User = require('../models/User');

exports.createTeam = async (req, res) => {
  try {
    const { name, leaderId, memberIds } = req.body;
    
    // Create team
    const team = await Team.create({
      name,
      leaderId,
    });
    
    // Add members
    if (memberIds && memberIds.length > 0) {
      await team.setMembers(memberIds);
    }
    
    res.status(201).json(team);
  } catch (error) {
    console.error('Create Team Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.findAll({
      include: [
        { model: User, as: 'leader', attributes: ['id', 'name'] },
        { model: User, as: 'members', attributes: ['id', 'name'], through: { attributes: [] } }
      ]
    });
    res.json(teams);
  } catch (error) {
    console.error('Get Teams Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, leaderId, memberIds } = req.body;
    
    const team = await Team.findByPk(id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    
    if (name) team.name = name;
    if (leaderId) team.leaderId = leaderId;
    await team.save();
    
    if (memberIds && Array.isArray(memberIds)) {
      await team.setMembers(memberIds);
    }
    
    res.json(team);
  } catch (error) {
    console.error('Update Team Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findByPk(id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    
    await team.destroy();
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Delete Team Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
