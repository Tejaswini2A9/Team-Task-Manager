const Project = require('../models/Project');
const User = require('../models/User');

exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({
      name,
      description,
      creatorId: req.user.id,
    });
    res.status(201).json(project);
  } catch (error) {
    console.error('Create Project Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const Task = require('../models/Task');

exports.getProjects = async (req, res) => {
  try {
    if (req.user.role === 'Admin') {
      const projects = await Project.findAll({
        include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }]
      });
      return res.json(projects);
    } else {
      // Members only see projects where they have assigned tasks
      const tasks = await Task.findAll({
        where: { assigneeId: req.user.id },
        attributes: ['projectId']
      });
      const projectIds = [...new Set(tasks.map(t => t.projectId).filter(id => id != null))];
      
      const projects = await Project.findAll({
        where: { id: projectIds },
        include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }]
      });
      return res.json(projects);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }]
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const project = await Project.findByPk(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    
    await project.save();
    res.json(project);
  } catch (error) {
    console.error('Update Project Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    await project.destroy();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete Project Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
