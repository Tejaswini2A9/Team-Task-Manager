import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiBell, FiCheckCircle } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/notifications/read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="bg-brand-dark border-b border-brand-dark/20 text-white relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold tracking-tight">Task Manager</h1>
          </div>
          <div className="flex items-center space-x-6">
            
            {/* Notifications */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => {
                  setShowDropdown(!showDropdown);
                  if (!showDropdown && unreadCount > 0) markAsRead();
                }} 
                className="relative p-2 rounded-full hover:bg-white/10 transition"
              >
                <FiBell className="w-5 h-5 text-white/90" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white border border-brand-dark">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl py-2 border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
                    <span className="text-xs bg-brand-light/20 text-brand-dark px-2 py-1 rounded-md font-bold">{notifications.length}</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-6">No new notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${!n.isRead ? 'bg-brand-light/5' : ''}`}>
                          <p className="text-sm text-gray-700">{n.message}</p>
                          <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-dark font-bold">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="font-medium text-sm hidden sm:block">Hello, {user?.name}</span>
            </div>
            <button onClick={handleLogout} className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-white hover:bg-white/20 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
