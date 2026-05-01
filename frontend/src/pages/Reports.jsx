import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { FiTrendingUp, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const Reports = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [taskRes, userRes, projRes] = await Promise.all([
          axios.get('http://localhost:5000/api/tasks', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/auth/users', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
          axios.get('http://localhost:5000/api/projects', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setTasks(taskRes.data);
        setUsers(userRes.data);
        setProjects(projRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const COLORS = ['#6ad09d', '#f87171', '#c084fc', '#60a5fa', '#fbbf24', '#a78bfa'];

  // 1. Tasks completed vs assigned & Active
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const activeTasks = tasks.filter(t => t.status !== 'Completed').length;
  
  // 2. On-time vs overdue tasks (using current date as simple heuristic if not completed, or due vs updated)
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed').length;
  const onTimeTasks = tasks.length - overdueTasks;
  const timeStatusData = [
    { name: 'On-Track/On-Time', value: onTimeTasks },
    { name: 'Overdue', value: overdueTasks }
  ];

  // 3. Task priority handled
  const priorityDataRaw = { Low: 0, Medium: 0, High: 0 };
  tasks.forEach(t => {
    if (t.priority) priorityDataRaw[t.priority]++;
    else priorityDataRaw['Medium']++;
  });
  const priorityData = Object.keys(priorityDataRaw).map(key => ({ name: key, value: priorityDataRaw[key] }));

  // 4. Tasks per project
  const projectCounts = {};
  tasks.forEach(t => {
    const pName = t.Project?.name || 'Unassigned';
    projectCounts[pName] = (projectCounts[pName] || 0) + 1;
  });
  const projectData = Object.keys(projectCounts).map(name => ({ name, Tasks: projectCounts[name] }));

  // 5. Member Workload (Overloaded vs Underutilized)
  const memberWorkload = {};
  users.forEach(u => memberWorkload[u.name] = { name: u.name, Active: 0, Completed: 0 });
  tasks.forEach(t => {
    if (t.assignee?.name && memberWorkload[t.assignee.name]) {
      if (t.status === 'Completed') memberWorkload[t.assignee.name].Completed++;
      else memberWorkload[t.assignee.name].Active++;
    }
  });
  const workloadData = Object.values(memberWorkload).filter(w => w.Active > 0 || w.Completed > 0);

  // 6. Estimated vs Actual Time
  const timeTrackingData = tasks.filter(t => t.estimatedHours > 0 || t.loggedHours > 0).map(t => ({
    name: `Task #${t.id}`,
    Estimated: t.estimatedHours || 0,
    Logged: t.loggedHours || 0
  })).slice(0, 10); // Top 10 for chart readability

  return (
    <div className="bg-brand-dark min-h-full flex flex-col pt-6 relative overflow-hidden h-full w-full">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="px-6 relative z-10 flex flex-col w-full max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Reports & Analytics</h1>
        <p className="text-white/70 text-sm md:text-base">Comprehensive insights into project and team performance</p>
      </div>

      <div className="bg-gray-50 flex-1 rounded-t-[2.5rem] p-6 shadow-2xl relative z-10 flex flex-col mt-4 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 pb-10">
          
          {/* Top KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center"><FiTrendingUp className="w-6 h-6"/></div>
              <div><p className="text-2xl font-bold text-gray-800">{tasks.length}</p><p className="text-xs text-gray-500 uppercase tracking-wide">Total Assigned</p></div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center"><FiCheckCircle className="w-6 h-6"/></div>
              <div><p className="text-2xl font-bold text-gray-800">{completedTasks}</p><p className="text-xs text-gray-500 uppercase tracking-wide">Completed</p></div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center"><FiClock className="w-6 h-6"/></div>
              <div><p className="text-2xl font-bold text-gray-800">{activeTasks}</p><p className="text-xs text-gray-500 uppercase tracking-wide">Active Tasks</p></div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center"><FiAlertCircle className="w-6 h-6"/></div>
              <div><p className="text-2xl font-bold text-gray-800">{overdueTasks}</p><p className="text-xs text-gray-500 uppercase tracking-wide">Overdue</p></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* On-Time vs Overdue */}
            <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-6">On-Time vs Overdue Tasks</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={timeStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      <Cell fill="#6ad09d" />
                      <Cell fill="#f87171" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Task Priority */}
            <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-6">Task Priority Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Member Workload */}
            <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 lg:col-span-2">
              <h3 className="font-bold text-gray-800 mb-6">Member Workload (Overloaded vs Underutilized)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workloadData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} />
                    <Legend />
                    <Bar dataKey="Active" stackId="a" fill="#60a5fa" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Completed" stackId="a" fill="#6ad09d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Estimated vs Actual Time */}
            <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 lg:col-span-2">
              <h3 className="font-bold text-gray-800 mb-6">Time Tracking: Estimated vs Logged (Hours)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeTrackingData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} />
                    <Legend />
                    <Line type="monotone" dataKey="Estimated" stroke="#c084fc" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Logged" stroke="#fbbf24" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
