const { Project, User, Task } = require('../models');

exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({ name, description, creatorId: req.user.id });
    res.status(201).json(project);
  } catch (error) {
    console.error('Create Project Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    if (req.user.role === 'Admin') {
      const projects = await Project.findAll({
        include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
        order: [['createdAt', 'DESC']],
      });
      return res.json(projects);
    }

    // Members only see projects where they have assigned tasks
    const tasks = await Task.findAll({ where: { assigneeId: req.user.id }, attributes: ['projectId'] });
    const projectIds = [...new Set(tasks.map(t => t.projectId).filter(id => id != null))];

    const projects = await Project.findAll({
      where: { id: projectIds.length ? projectIds : [0] },
      include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.json(projects);
  } catch (error) {
    console.error('Get Projects Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const { name, description } = req.body;
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    await project.save();
    res.json(project);
  } catch (error) {
    console.error('Update Project Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await project.destroy();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete Project Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
