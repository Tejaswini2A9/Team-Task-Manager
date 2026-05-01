import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiFolder, FiFolderPlus, FiUser, FiEdit2, FiX } from 'react-icons/fi';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingProjectId, setEditingProjectId] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const startEditing = (project) => {
    setEditingProjectId(project.id);
    setName(project.name);
    setDescription(project.description || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingProjectId(null);
    setName('');
    setDescription('');
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = { name, description };

      if (editingProjectId) {
        await axios.put(`http://localhost:5000/api/projects/${editingProjectId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/projects', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      cancelEditing();
      fetchProjects();
    } catch (err) {
      alert(`Error ${editingProjectId ? 'updating' : 'creating'} project`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProjects();
    } catch (err) {
      alert('Error deleting project');
    }
  };

  return (
    <div className="bg-brand-dark min-h-full flex flex-col pt-6 relative overflow-hidden h-full w-full">
      {/* Background circles */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Info */}
      <div className="px-6 relative z-10 flex flex-col w-full max-w-7xl mx-auto mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Projects</h1>
          <p className="text-white/70 text-sm md:text-base">Organize and manage team initiatives</p>
        </div>
      </div>

      {/* Main White Content Area */}
      <div className="bg-white flex-1 rounded-t-[2.5rem] p-6 shadow-2xl relative z-10 flex flex-col mt-4 overflow-y-auto w-full">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
        
        <div className="max-w-7xl mx-auto w-full pb-10">
          
          {user?.role === 'Admin' && (
            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm mb-10 max-w-2xl relative overflow-hidden">
              {editingProjectId && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-400"></div>
              )}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${editingProjectId ? 'bg-yellow-100 text-yellow-600' : 'bg-brand-light/20 text-brand-dark'} rounded-full flex items-center justify-center`}>
                    {editingProjectId ? <FiEdit2 className="w-5 h-5" /> : <FiFolderPlus className="w-5 h-5" />}
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {editingProjectId ? 'Edit Project' : 'Create New Project'}
                  </h2>
                </div>
                {editingProjectId && (
                  <button onClick={cancelEditing} className="text-gray-400 hover:text-red-500 transition">
                    <FiX className="w-6 h-6" />
                  </button>
                )}
              </div>
              <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Project Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-light text-sm" placeholder="e.g. Website Redesign" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-light text-sm" placeholder="Brief project details..."></textarea>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className={`px-8 py-3 font-bold text-sm tracking-wider rounded-full hover:-translate-y-0.5 transition shadow-sm ${editingProjectId ? 'bg-yellow-400 text-yellow-900' : 'bg-brand-light text-brand-dark'}`}>
                    {editingProjectId ? 'SAVE CHANGES' : 'CREATE PROJECT'}
                  </button>
                  {editingProjectId && (
                    <button type="button" onClick={cancelEditing} className="px-8 py-3 bg-gray-100 text-gray-600 font-bold text-sm tracking-wider rounded-full hover:-translate-y-0.5 transition shadow-sm">
                      CANCEL
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-800 mb-6">Active Projects</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length === 0 ? (
              <p className="text-gray-500 col-span-3">No projects found.</p>
            ) : (
              projects.map(project => (
                <div key={project.id} className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 relative group">
                  {user?.role === 'Admin' && (
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button onClick={() => startEditing(project)} className="p-2 bg-gray-50 text-gray-500 hover:text-brand-dark rounded-full transition">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(project.id)} className="p-2 bg-gray-50 text-gray-500 hover:text-red-500 rounded-full transition">
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-5">
                    <FiFolder className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{project.name}</h3>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2 min-h-[40px]">{project.description}</p>
                  
                  <div className="pt-4 border-t border-gray-50 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <FiUser className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                      <p className="text-gray-400 font-bold uppercase tracking-wider">Creator</p>
                      <p className="font-bold text-gray-700">{project.creator?.name || 'Admin'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Projects;
