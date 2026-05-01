import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiMessageSquare, FiPlus, FiCheckCircle } from 'react-icons/fi';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetRole, setTargetRole] = useState('Admin');
  const [showForm, setShowForm] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/tickets', { title, description, targetRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTitle('');
      setDescription('');
      setTargetRole('Admin');
      setShowForm(false);
      fetchTickets();
    } catch (err) {
      alert('Error creating ticket');
    }
  };

  const handleResolve = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/tickets/${id}/resolve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTickets();
    } catch (err) {
      alert('Error resolving ticket');
    }
  };

  return (
    <div className="bg-brand-dark min-h-full flex flex-col pt-6 relative overflow-hidden h-full w-full">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="px-6 relative z-10 flex flex-col w-full max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Tickets</h1>
            <p className="text-white/70 text-sm md:text-base">Raise issues or complaints to leadership</p>
          </div>
          {user?.role === 'Member' && (
            <button 
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-brand-light text-brand-dark px-4 py-2 rounded-full font-bold text-sm shadow-md hover:-translate-y-0.5 transition"
            >
              <FiPlus /> New Ticket
            </button>
          )}
        </div>
      </div>

      <div className="bg-white flex-1 rounded-t-[2.5rem] p-6 shadow-2xl relative z-10 flex flex-col mt-4 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto w-full pb-10">
          
          {showForm && user?.role === 'Member' && (
            <div className="bg-gray-50 border border-gray-100 p-6 rounded-3xl shadow-sm mb-10 max-w-2xl">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Raise a Ticket</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Raise To</label>
                  <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-light text-sm">
                    <option value="Admin">Admin</option>
                    <option value="Team Leader">Team Leader</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-light text-sm" placeholder="Brief issue description" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Details</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-light text-sm" placeholder="Provide full details of your complaint or issue..."></textarea>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="px-8 py-3 bg-brand-dark text-white font-bold text-sm tracking-wider rounded-full hover:-translate-y-0.5 transition">Submit Ticket</button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-8 py-3 bg-gray-200 text-gray-700 font-bold text-sm tracking-wider rounded-full transition hover:bg-gray-300">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.length === 0 ? (
              <p className="text-gray-500">No tickets found.</p>
            ) : (
              tickets.map(ticket => (
                <div key={ticket.id} className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 relative group overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${ticket.status === 'Resolved' ? 'bg-brand-light' : 'bg-red-400'}`}></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ticket.status === 'Resolved' ? 'bg-brand-light/20 text-brand-dark' : 'bg-red-50 text-red-500'}`}>
                        <FiMessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Ticket #{ticket.id}</p>
                        <h3 className="font-bold text-gray-800 text-lg">{ticket.title}</h3>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${ticket.status === 'Resolved' ? 'bg-brand-light/10 text-brand-dark' : 'bg-red-50 text-red-600'}`}>
                      {ticket.status}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-[10px] font-extrabold px-2 py-1 bg-gray-100 text-gray-500 rounded-md uppercase tracking-wider">
                      To: {ticket.targetRole}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-6 bg-gray-50 p-4 rounded-xl">{ticket.description}</p>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 font-medium">Raised by: <span className="text-gray-700 font-bold">{ticket.raisedBy?.name || 'Unknown'}</span></p>
                    
                    {user?.role === 'Admin' && ticket.status !== 'Resolved' && (
                      <button 
                        onClick={() => handleResolve(ticket.id)}
                        className="flex items-center gap-1 text-xs font-bold text-brand-dark bg-brand-light/20 hover:bg-brand-light hover:text-white px-3 py-1.5 rounded-lg transition"
                      >
                        <FiCheckCircle /> Mark Resolved
                      </button>
                    )}
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

export default Tickets;
