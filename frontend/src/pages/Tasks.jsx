import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiArrowLeft, FiBell, FiClock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = ['All', 'Pending', 'Ongoing', 'Completed'];

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending') return task.status === 'To Do';
    if (activeTab === 'Ongoing') return task.status === 'In Progress';
    if (activeTab === 'Completed') return task.status === 'Completed';
    return true;
  });

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/tasks/${taskId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert('Failed to update task status');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Completed') return 'text-brand-light bg-brand-light/10 border-brand-light/20';
    if (status === 'In Progress') return 'text-purple-500 bg-purple-50 border-purple-100';
    return 'text-red-400 bg-red-50 border-red-100';
  };

  const getStatusLabel = (status) => {
    if (status === 'Completed') return 'COMPLETED';
    if (status === 'In Progress') return 'IN PROGRESS';
    return 'PENDING';
  };

  return (
    <div className="bg-brand-dark min-h-full flex flex-col pt-6 relative overflow-hidden h-full w-full">
      {/* Background circles */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Info */}
      <div className="px-6 relative z-10 flex flex-col w-full max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Tasks</h1>
            <p className="text-white/70 text-sm md:text-base">Manage and track your assigned work</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/10 rounded-2xl p-1.5 mb-6 max-w-3xl overflow-x-auto shadow-inner border border-white/5 backdrop-blur-sm">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[100px] text-center py-3 px-4 text-sm font-bold rounded-xl transition-all ${
                activeTab === tab ? 'bg-white text-brand-dark shadow-md scale-105' : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main White Content Area */}
      <div className="bg-white flex-1 rounded-t-[2.5rem] p-6 shadow-2xl relative z-10 flex flex-col mt-4 overflow-y-auto w-full">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
        
        <div className="max-w-7xl mx-auto w-full pb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">All Task</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.length === 0 ? (
              <p className="text-center text-gray-500 py-8 md:col-span-3">No tasks found.</p>
            ) : (
              filteredTasks.map(task => (
                <div key={task.id} className="bg-white border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-3xl p-6 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden">
                  {/* Left color border accent */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    task.status === 'Completed' ? 'bg-brand-light' : 
                    task.status === 'In Progress' ? 'bg-purple-400' : 'bg-red-400'
                  }`}></div>
                  
                  <div className="flex justify-between items-start mb-3 relative">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="text-gray-500 font-medium"># {task.id}</span>
                        <span className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date'}
                        </span>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-1 rounded-full w-max tracking-wider uppercase ${task.team ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {task.team ? 'Team Task' : 'Individual Task'}
                      </span>
                    </div>

                    {user?.role === 'Admin' && (
                      <div className="absolute right-0 top-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate(`/edit-task/${task.id}`)} className="p-1.5 text-gray-400 hover:text-brand-dark bg-gray-50 rounded-full transition">
                          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button onClick={async () => {
                          if (!window.confirm('Delete this task?')) return;
                          try {
                            const token = localStorage.getItem('token');
                            await axios.delete(`http://localhost:5000/api/tasks/${task.id}`, { headers: { Authorization: `Bearer ${token}` }});
                            fetchTasks();
                          } catch (err) { alert('Error deleting task'); }
                        }} className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-50 rounded-full transition">
                          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                    )}

                    <div className="ml-auto flex items-center">
                      {task.status === 'In Progress' && (
                        <div className="w-10 h-10 rounded-full border-2 border-brand-light flex items-center justify-center text-xs font-bold text-brand-dark">
                          75%
                        </div>
                      )}
                      {task.status === 'Completed' && (
                        <div className="w-10 h-10 rounded-full border-2 border-brand-light flex items-center justify-center text-xs font-bold text-brand-dark">
                          100%
                        </div>
                      )}
                      {task.status === 'To Do' && (
                        <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                          0%
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-800 text-xl mb-6 pr-16">{task.title}</h3>

                  <div className="flex justify-between items-end mt-auto pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-500 font-bold text-lg">
                        {task.team ? 'T' : (task.assignee?.name?.[0] || 'U')}
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-800">
                          {task.team ? `Team: ${task.team.name}` : (task.assignee?.name || 'Unassigned')}
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">{task.Project?.name || 'General'}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 items-end">
                      <div className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider border ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </div>
                      
                      {/* Individual Status Update Buttons */}
                      {!task.team && user?.id === task.assigneeId && (
                        <>
                          {task.status === 'To Do' && (
                            <button onClick={() => handleStatusChange(task.id, 'In Progress')} className="text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition">START TASK</button>
                          )}
                          {task.status === 'In Progress' && (
                            <button onClick={() => handleStatusChange(task.id, 'Completed')} className="text-xs font-bold text-white bg-brand-light hover:bg-brand-dark px-3 py-1.5 rounded-lg transition shadow-sm">MARK COMPLETE</button>
                          )}
                        </>
                      )}

                      {/* Team Task Controls */}
                      {task.team && (
                        <div className="flex flex-col items-end gap-2 mt-2">
                          {/* Member updating their piece */}
                          {task.status !== 'Completed' && task.memberProgress?.some(mp => mp.userId === user?.id && mp.status === 'Pending') && (
                            <button 
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('token');
                                  await axios.put(`http://localhost:5000/api/tasks/${task.id}/progress`, {}, { headers: { Authorization: `Bearer ${token}` } });
                                  fetchTasks();
                                } catch (err) { alert('Error updating progress'); }
                              }}
                              className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                            >
                              MARK MY PART DONE
                            </button>
                          )}
                          
                          {/* Team Leader completing whole task */}
                          {user?.id === task.team.leaderId && task.status !== 'Completed' && (
                            <button 
                              onClick={() => {
                                const allDone = task.memberProgress?.length > 0 && task.memberProgress.every(mp => mp.status === 'Completed');
                                if (allDone) {
                                  handleStatusChange(task.id, 'Completed');
                                }
                              }}
                              disabled={!(task.memberProgress?.length > 0 && task.memberProgress.every(mp => mp.status === 'Completed'))}
                              className={`text-xs font-bold text-white px-3 py-1.5 rounded-lg transition shadow-sm ${
                                task.memberProgress?.length > 0 && task.memberProgress.every(mp => mp.status === 'Completed') 
                                  ? 'bg-brand-dark hover:bg-gray-800' 
                                  : 'bg-gray-300 cursor-not-allowed opacity-70'
                              }`}
                              title={!(task.memberProgress?.length > 0 && task.memberProgress.every(mp => mp.status === 'Completed')) ? "All members must complete their parts first" : "Mark task as completed"}
                            >
                              FINISH ENTIRE TASK
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Team Members Progress Tracking */}
                  {task.team && task.memberProgress && (
                    <div className="mt-4 pt-4 border-t border-gray-50 bg-gray-50 -mx-6 -mb-6 px-6 pb-6 pt-4 rounded-b-3xl">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Team Progress</p>
                      <div className="space-y-2">
                        {task.memberProgress.map(mp => (
                          <div key={mp.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                            <span className="text-sm text-gray-700 font-medium">{mp.user?.name}</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${mp.status === 'Completed' ? 'bg-brand-light/20 text-brand-dark' : 'bg-yellow-50 text-yellow-600'}`}>
                              {mp.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
