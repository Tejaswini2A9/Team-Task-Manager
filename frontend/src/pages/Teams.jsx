import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiUsers, FiUserPlus, FiUser, FiEdit2, FiX } from 'react-icons/fi';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [leaderId, setLeaderId] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchTeams();
    if (user?.role === 'Admin') fetchUsers();
  }, [user]);

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/teams', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTeams(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMemberToggle = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const startEditing = (team) => {
    setEditingTeamId(team.id);
    setName(team.name);
    setLeaderId(team.leaderId || '');
    setSelectedMembers(team.members ? team.members.map(m => m.id) : []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingTeamId(null);
    setName('');
    setLeaderId('');
    setSelectedMembers([]);
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = { name, leaderId, memberIds: selectedMembers };

      if (editingTeamId) {
        await axios.put(`/api/teams/${editingTeamId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/teams', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      cancelEditing();
      fetchTeams();
    } catch (err) {
      alert(`Error ${editingTeamId ? 'updating' : 'creating'} team`);
    }
  };

  if (user?.role !== 'Admin') {
    return <div className="p-6 text-center text-gray-500">Only Admin can manage teams.</div>;
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/teams/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTeams();
    } catch (err) {
      alert('Error deleting team');
    }
  };

  return (
    <div className="bg-brand-dark min-h-full flex flex-col pt-6 relative overflow-hidden h-full w-full">
      {/* Background circles */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Info */}
      <div className="px-6 relative z-10 flex flex-col w-full max-w-7xl mx-auto mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Teams</h1>
          <p className="text-white/70 text-sm md:text-base">Organize your workforce into functional teams</p>
        </div>
      </div>

      {/* Main White Content Area */}
      <div className="bg-white flex-1 rounded-t-[2.5rem] p-6 shadow-2xl relative z-10 flex flex-col mt-4 overflow-y-auto w-full">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
        
        <div className="max-w-7xl mx-auto w-full pb-10">
          
          <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm mb-10 max-w-2xl relative overflow-hidden">
            {editingTeamId && (
              <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-400"></div>
            )}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${editingTeamId ? 'bg-yellow-100 text-yellow-600' : 'bg-brand-light/20 text-brand-dark'} rounded-full flex items-center justify-center`}>
                  {editingTeamId ? <FiEdit2 className="w-5 h-5" /> : <FiUserPlus className="w-5 h-5" />}
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {editingTeamId ? 'Edit Team' : 'Create New Team'}
                </h2>
              </div>
              {editingTeamId && (
                <button onClick={cancelEditing} className="text-gray-400 hover:text-red-500 transition">
                  <FiX className="w-6 h-6" />
                </button>
              )}
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Team Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-light text-sm" placeholder="e.g. Frontend Developers" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Team Leader</label>
                <select value={leaderId} onChange={(e) => setLeaderId(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-light text-sm">
                  <option value="">Select Team Leader</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Team Members</label>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  {users.map(u => (
                    <label key={u.id} className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedMembers.includes(u.id)}
                        onChange={() => handleMemberToggle(u.id)}
                        className="w-4 h-4 text-brand-light bg-white border-gray-300 rounded focus:ring-brand-light"
                      />
                      <span className="text-sm text-gray-700">{u.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button type="submit" className={`px-8 py-3 font-bold text-sm tracking-wider rounded-full hover:-translate-y-0.5 transition shadow-sm ${editingTeamId ? 'bg-yellow-400 text-yellow-900' : 'bg-brand-light text-brand-dark'}`}>
                  {editingTeamId ? 'SAVE CHANGES' : 'CREATE TEAM'}
                </button>
                {editingTeamId && (
                  <button type="button" onClick={cancelEditing} className="px-8 py-3 bg-gray-100 text-gray-600 font-bold text-sm tracking-wider rounded-full hover:-translate-y-0.5 transition shadow-sm">
                    CANCEL
                  </button>
                )}
              </div>
            </form>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6">Active Teams</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.length === 0 ? (
              <p className="text-gray-500 col-span-3">No teams found.</p>
            ) : (
              teams.map(team => (
                <div key={team.id} className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 relative group">
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button onClick={() => startEditing(team)} className="p-2 bg-gray-50 text-gray-500 hover:text-brand-dark rounded-full transition">
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(team.id)} className="p-2 bg-gray-50 text-gray-500 hover:text-red-500 rounded-full transition">
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-5">
                    <FiUsers className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{team.name}</h3>
                  
                  <div className="mt-6 pt-4 border-t border-gray-50">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Team Leader</p>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs">
                        {team.leader?.name?.[0] || 'L'}
                      </div>
                      <p className="font-bold text-gray-700">{team.leader?.name || 'Unassigned'}</p>
                    </div>

                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Members ({team.members?.length || 0})</p>
                    <div className="flex flex-wrap gap-1">
                      {team.members?.map(m => (
                        <span key={m.id} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                          {m.name}
                        </span>
                      ))}
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

export default Teams;
