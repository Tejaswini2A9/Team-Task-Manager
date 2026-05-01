import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';

const CreateTask = () => {
  const { id } = useParams();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [assignType, setAssignType] = useState('individual'); // 'individual' or 'team'
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const projRes = await axios.get('http://localhost:5000/api/projects', { headers: { Authorization: `Bearer ${token}` } });
        setProjects(projRes.data);
        
        try {
          const userRes = await axios.get('http://localhost:5000/api/auth/users', { headers: { Authorization: `Bearer ${token}` } });
          setUsers(userRes.data || []);
        } catch (e) {
          console.log('Could not fetch users', e);
        }

        try {
          const teamRes = await axios.get('http://localhost:5000/api/teams', { headers: { Authorization: `Bearer ${token}` } });
          setTeams(teamRes.data || []);
        } catch (e) {
          console.log('Could not fetch teams', e);
        }

        if (id) {
          const taskRes = await axios.get('http://localhost:5000/api/tasks', { headers: { Authorization: `Bearer ${token}` } });
          const taskToEdit = taskRes.data.find(t => t.id === parseInt(id));
          if (taskToEdit) {
            setTitle(taskToEdit.title);
            setDescription(taskToEdit.description);
            setProjectId(taskToEdit.projectId || '');
            setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '');
            setPriority(taskToEdit.priority || 'Medium');
            setEstimatedHours(taskToEdit.estimatedHours || '');
            if (taskToEdit.teamId) {
              setAssignType('team');
              setTeamId(taskToEdit.teamId);
            } else {
              setAssignType('individual');
              setAssigneeId(taskToEdit.assigneeId || '');
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (user?.role === 'Admin') fetchData();
  }, [user, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = { 
        title, 
        description, 
        projectId, 
        dueDate,
        priority,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : 0
      };
      
      if (assignType === 'individual') {
        payload.assigneeId = assigneeId || user.id;
        payload.teamId = null;
      } else {
        payload.teamId = teamId;
        payload.assigneeId = null;
      }

      if (id) {
        await axios.put(`http://localhost:5000/api/tasks/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        payload.status = 'To Do';
        await axios.post('http://localhost:5000/api/tasks', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      navigate('/tasks');
    } catch (err) {
      alert(`Error ${id ? 'updating' : 'creating'} task`);
    }
  };

  return (
    <div className="bg-brand-dark min-h-full flex flex-col pt-6 relative overflow-hidden h-full w-full">
      <div className="px-6 relative z-10 flex flex-col w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="text-white hover:text-brand-light transition">
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-white">{id ? 'Edit Task' : 'Create New Task'}</h1>
        </div>
      </div>

      <div className="bg-white flex-1 rounded-t-[2.5rem] p-6 shadow-2xl relative z-10 flex flex-col mt-4 overflow-y-auto w-full">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
        
        <div className="max-w-4xl mx-auto w-full pb-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Task Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-light text-base" placeholder="e.g., Website Redesign" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-light text-base" rows="4" placeholder="Task details..."></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-light text-base" />
              </div>
              
              {user?.role === 'Admin' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Project</label>
                  <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-light text-base">
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-light text-base">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Estimated Hours</label>
                <input type="number" min="0" step="0.5" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-light text-base" placeholder="e.g. 10.5" />
              </div>
            </div>
            
            {user?.role === 'Admin' && (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mt-6">
                <label className="block text-sm font-bold text-gray-700 mb-4">Assignment Type</label>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="individual" checked={assignType === 'individual'} onChange={() => setAssignType('individual')} className="text-brand-light focus:ring-brand-light" />
                    <span className="text-sm font-medium">Individual</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="team" checked={assignType === 'team'} onChange={() => setAssignType('team')} className="text-brand-light focus:ring-brand-light" />
                    <span className="text-sm font-medium">Whole Team</span>
                  </label>
                </div>

                {assignType === 'individual' ? (
                  <div>
                    <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} required className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-light text-base">
                      <option value="">Select User</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <select value={teamId} onChange={(e) => setTeamId(e.target.value)} required className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-light text-base">
                      <option value="">Select Team</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
            )}

            <button type="submit" className="w-full md:w-auto md:px-12 bg-brand-light text-brand-dark font-bold text-sm tracking-wider py-4 rounded-full mt-8 shadow-[0_10px_20px_rgba(94,209,155,0.3)] hover:-translate-y-0.5 transition-all">
              {id ? 'SAVE CHANGES' : 'SUBMIT TASK'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
