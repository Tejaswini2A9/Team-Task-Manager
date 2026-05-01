import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiFolder, FiCheckSquare, FiUsers, FiMessageSquare } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const isActive = (path) => location.pathname === path;

  const links = [
    { name: 'Dashboard', path: '/', icon: <FiHome className="w-5 h-5" /> },
    { name: 'Projects', path: '/projects', icon: <FiFolder className="w-5 h-5" /> },
    { name: 'Tasks', path: '/tasks', icon: <FiCheckSquare className="w-5 h-5" /> },
    { name: 'Tickets', path: '/tickets', icon: <FiMessageSquare className="w-5 h-5" /> },
  ];

  if (user?.role === 'Admin') {
    links.push({ name: 'Teams', path: '/teams', icon: <FiUsers className="w-5 h-5" /> });
  }

  return (
    <aside className="w-64 bg-brand-dark min-h-[calc(100vh-4rem)] pt-6 flex flex-col">
      <nav className="px-4 space-y-2 flex-1">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
              isActive(link.path) 
                ? 'bg-brand-light text-brand-dark shadow-md' 
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            {link.icon}
            {link.name}
          </Link>
        ))}
      </nav>
      <div className="p-4 mt-auto">
        <div className="bg-white/10 p-4 rounded-2xl">
          <p className="text-white/80 text-xs text-center">Version 1.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
