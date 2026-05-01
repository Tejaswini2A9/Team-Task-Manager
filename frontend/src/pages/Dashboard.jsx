import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiBell, FiAlertCircle, FiClock, FiCheckSquare, FiUser, FiTag, FiFileText } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [taskRes, userRes] = await Promise.all([
          axios.get('http://localhost:5000/api/tasks', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/auth/users', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
        ]);
        setTasks(taskRes.data);
        setUsers(userRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const pendingTasks = tasks.filter(t => t.status === 'To Do');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed');

  const dateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
  });

  // Pie Chart Data
  const pieData = [
    { name: 'To Do', value: pendingTasks.length, color: '#f87171' },
    { name: 'In Progress', value: inProgressTasks.length, color: '#c084fc' },
    { name: 'Completed', value: completedTasks.length, color: '#6ad09d' }
  ].filter(d => d.value > 0);

  // Bar Chart Data (Tasks per user)
  const userTaskCounts = {};
  const userCompletedCounts = {};
  tasks.forEach(task => {
    const assigneeName = task.assignee?.name || 'Unassigned';
    userTaskCounts[assigneeName] = (userTaskCounts[assigneeName] || 0) + 1;
    if (task.status === 'Completed') {
      userCompletedCounts[assigneeName] = (userCompletedCounts[assigneeName] || 0) + 1;
    }
  });

  const barData = Object.keys(userTaskCounts).map(name => ({
    name,
    Total: userTaskCounts[name],
    Completed: userCompletedCounts[name] || 0
  }));

  // Countdown Timer Logic (Nearest upcoming deadline)
  const upcomingTasks = tasks
    .filter(t => t.dueDate && t.status !== 'Completed' && new Date(t.dueDate) >= new Date())
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  
  const nextDeadlineTask = upcomingTasks[0];
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!nextDeadlineTask) return;
    const interval = setInterval(() => {
      const diff = new Date(nextDeadlineTask.dueDate) - new Date();
      if (diff <= 0) {
        setTimeLeft('Expired');
        clearInterval(interval);
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        setTimeLeft(`${d}d ${h}h ${m}m`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [nextDeadlineTask]);

  return (
    <div className="bg-brand-dark min-h-full flex flex-col pt-6 relative overflow-hidden h-full w-full">
      {/* Background circles */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-5%] w-64 h-64 bg-brand-light/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header Info */}
      <div className="px-6 relative z-10 w-full max-w-7xl mx-auto">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Hello, {user?.name || 'User'}</h1>
            <p className="text-white/70 text-sm md:text-base">{dateStr}</p>
          </div>
        </div>

        {/* Top Stats */}
        <div className="flex justify-start gap-12 mt-12 mb-8 px-2 overflow-x-auto">
          <div className="text-left flex items-center gap-4">
            <p className="text-5xl font-bold text-white">{String(pendingTasks.length).padStart(2, '0')}</p>
            <p className="text-sm text-white/70 leading-tight">Tasks<br/>Pending</p>
          </div>
          <div className="w-px bg-white/20 my-2"></div>
          <div className="text-left flex items-center gap-4">
            <p className="text-5xl font-bold text-white">{String(inProgressTasks.length).padStart(2, '0')}</p>
            <p className="text-sm text-white/70 leading-tight">Tasks<br/>In Progress</p>
          </div>
          <div className="w-px bg-white/20 my-2"></div>
          <div className="text-left flex items-center gap-4">
            <p className="text-5xl font-bold text-brand-light">{String(completedTasks.length).padStart(2, '0')}</p>
            <p className="text-sm text-white/70 leading-tight">Tasks<br/>Completed</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white flex-1 rounded-t-[2.5rem] p-6 shadow-2xl relative z-10 flex flex-col mt-4 w-full overflow-y-auto">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8 sm:hidden"></div>
        
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 pb-10">
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Metrics</h2>
            {user?.role === 'Admin' && (
              <button onClick={() => navigate('/create-task')} className="px-8 bg-brand-light text-brand-dark font-bold text-sm tracking-wider py-3 rounded-full shadow-[0_10px_20px_rgba(94,209,155,0.3)] hover:shadow-[0_10px_25px_rgba(94,209,155,0.4)] hover:-translate-y-0.5 transition-all">
                + NEW TASK
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1 mb-2">
            <button onClick={() => navigate('/tasks')} className="bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 flex flex-col items-start hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-5">
                <FiCheckSquare className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-gray-800 text-xl">My Task</h3>
              <p className="text-sm text-gray-500 mt-2">{tasks.length} tasks tracking</p>
            </button>

            <button onClick={() => navigate('/tickets')} className="bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 flex flex-col items-start hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-500 flex items-center justify-center mb-5">
                <FiTag className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-gray-800 text-xl">My Ticket</h3>
              <p className="text-sm text-gray-500 mt-2">Manage issues</p>
            </button>

            <button onClick={() => navigate('/reports')} className="bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 flex flex-col items-start hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-5">
                <FiFileText className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-gray-800 text-xl">Report</h3>
              <p className="text-sm text-gray-500 mt-2">See all your report</p>
            </button>

            <button onClick={() => navigate('/profile')} className="bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 flex flex-col items-start hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center mb-5">
                <FiUser className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-gray-800 text-xl">My Profile</h3>
              <p className="text-sm text-gray-500 mt-2">{user?.name}</p>
            </button>
          </div>

          {/* Quick Metrics & Countdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div onClick={() => setShowDeadlineModal(true)} className="bg-orange-50 border border-orange-100 p-6 rounded-3xl flex items-center gap-4 shadow-sm cursor-pointer hover:-translate-y-1 transition-transform group">
              <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <FiClock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-orange-600 font-bold mb-1">Next Deadline</p>
                {nextDeadlineTask ? (
                  <p className="text-xl font-black text-orange-800">{timeLeft}</p>
                ) : (
                  <p className="text-base font-bold text-orange-800">No upcoming tasks</p>
                )}
                <p className="text-xs text-orange-400 mt-1">Click for details</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center">
                <FiCheckSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-bold mb-1">Team Efficiency</p>
                <p className="text-xl font-black text-blue-800">
                  {tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0}% Done
                </p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex flex-col justify-center shadow-sm relative overflow-hidden">
              <div className="absolute right-[-10%] top-[-20%] text-red-100 opacity-50">
                <FiAlertCircle className="w-32 h-32" />
              </div>
              <p className="text-sm text-red-600 font-bold mb-1 z-10">Overdue Tasks</p>
              <p className="text-3xl font-black text-red-600 z-10">{overdueTasks.length}</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
            
            {/* Pie Chart */}
            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col items-center">
              <h3 className="font-bold text-gray-800 mb-4 self-start">Task Status Breakdown</h3>
              <div className="w-full h-64">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No tasks data available</div>
                )}
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col items-center">
              <h3 className="font-bold text-gray-800 mb-4 self-start">Tasks by User</h3>
              <div className="w-full h-64">
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend />
                      <Bar dataKey="Total" fill="#c084fc" radius={[4, 4, 0, 0]} barSize={30} />
                      <Bar dataKey="Completed" fill="#6ad09d" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No user data available</div>
                )}
              </div>
            </div>

          </div>

          {/* Highlighted Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                <FiAlertCircle className="text-red-500" /> Action Required: Overdue Tasks
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {overdueTasks.map(task => (
                  <div key={task.id} className="bg-red-50 border border-red-100 rounded-2xl p-5 flex justify-between items-center relative overflow-hidden group hover:-translate-y-1 transition-all shadow-sm cursor-pointer" onClick={() => navigate('/tasks')}>
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
                    <div>
                      <h4 className="font-bold text-red-900 text-lg">{task.title}</h4>
                      <p className="text-sm font-bold text-red-600 mt-1">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right bg-white/60 p-2 rounded-xl">
                      <p className="text-xs text-red-400 font-bold uppercase tracking-wider mb-1">Assignee</p>
                      <p className="text-sm font-bold text-red-800">{task.assignee?.name || 'Unassigned'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Deadline Modal */}
      {showDeadlineModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FiClock className="text-orange-500" /> Deadline Insights
              </h2>
              <button onClick={() => setShowDeadlineModal(false)} className="w-10 h-10 rounded-full bg-white text-gray-500 flex items-center justify-center hover:bg-gray-200 transition font-bold">X</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-white">
              
              <section>
                <h3 className="text-lg font-bold text-red-600 border-b pb-2 mb-4 border-red-100">Overdue Tasks ({overdueTasks.length})</h3>
                <div className="grid gap-3">
                  {overdueTasks.length ? overdueTasks.map(t => (
                    <div key={t.id} className="bg-red-50 p-4 rounded-xl border border-red-100 flex justify-between items-center"><span className="font-bold text-red-900">{t.title}</span><span className="text-sm text-red-500 font-bold">Due: {new Date(t.dueDate).toLocaleDateString()}</span></div>
                  )) : <p className="text-gray-400">None</p>}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-orange-500 border-b pb-2 mb-4 border-orange-100">Nearing Deadlines (Next 7 Days)</h3>
                <div className="grid gap-3">
                  {tasks.filter(t => t.dueDate && t.status !== 'Completed' && new Date(t.dueDate) >= new Date() && new Date(t.dueDate) <= new Date(Date.now() + 7*24*60*60*1000)).map(t => (
                    <div key={t.id} className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex justify-between items-center"><span className="font-bold text-orange-900">{t.title}</span><span className="text-sm text-orange-500 font-bold">Due: {new Date(t.dueDate).toLocaleDateString()}</span></div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-500 border-b pb-2 mb-4 border-gray-200">Blocked Tasks (Dependencies)</h3>
                <div className="grid gap-3">
                  {tasks.filter(t => t.status === 'Blocked').length ? tasks.filter(t => t.status === 'Blocked').map(t => (
                    <div key={t.id} className="bg-gray-100 p-4 rounded-xl border border-gray-200 flex justify-between items-center"><span className="font-bold text-gray-700">{t.title}</span><span className="text-sm text-gray-500 font-bold">Blocked</span></div>
                  )) : <p className="text-sm text-gray-400 italic">No blocked tasks currently.</p>}
                </div>
              </section>
              
              <section>
                <h3 className="text-lg font-bold text-brand-dark border-b pb-2 mb-4 border-brand-light/20">Recently Updated Tasks</h3>
                <div className="grid gap-3">
                  {tasks.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3).map(t => (
                    <div key={t.id} className="bg-brand-light/5 p-4 rounded-xl border border-brand-light/20 flex justify-between items-center"><span className="font-bold text-brand-dark">{t.title}</span><span className="text-xs text-brand-dark/70 font-bold uppercase">{t.status}</span></div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-blue-600 border-b pb-2 mb-4 border-blue-100">Status Summary</h3>
                <div className="flex gap-4">
                  <div className="flex-1 bg-blue-50 p-4 rounded-xl text-center"><p className="text-3xl font-black text-blue-500">{tasks.filter(t => t.status === 'To Do').length}</p><p className="text-xs font-bold text-blue-400 uppercase">Pending</p></div>
                  <div className="flex-1 bg-purple-50 p-4 rounded-xl text-center"><p className="text-3xl font-black text-purple-500">{tasks.filter(t => t.status === 'In Progress').length}</p><p className="text-xs font-bold text-purple-400 uppercase">In Progress</p></div>
                  <div className="flex-1 bg-emerald-50 p-4 rounded-xl text-center"><p className="text-3xl font-black text-emerald-500">{tasks.filter(t => t.status === 'Completed').length}</p><p className="text-xs font-bold text-emerald-400 uppercase">Completed</p></div>
                </div>
              </section>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
