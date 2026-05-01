import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiArrowLeft, FiBell, FiGlobe, FiLock, FiShield, FiFileText } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-brand-dark min-h-full flex flex-col pt-6 relative overflow-y-auto">
      {/* Background circles */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Info */}
      <div className="px-6 relative z-10">
        <div className="flex justify-between items-center mb-16">
          <button onClick={() => navigate('/')} className="text-white hover:text-brand-light transition">
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-white">Profile</h1>
          <button className="relative text-white hover:text-brand-light transition">
            <FiBell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-brand-light rounded-full border border-brand-dark"></span>
          </button>
        </div>
      </div>

      {/* Main White Content Area */}
      <div className="bg-white flex-1 rounded-t-[2.5rem] p-6 shadow-2xl relative z-10 flex flex-col mt-20 pt-20 w-full">
        
        <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 relative">
          {/* Profile Image & Name Card overlapping the top edge */}
          <div className="absolute -top-36 left-0 right-0 bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-6 flex flex-col items-center text-center z-20">
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg -mt-14 mb-4 bg-gray-200 overflow-hidden flex items-center justify-center text-3xl font-bold text-gray-500">
              {user?.name?.[0] || 'U'}
            </div>
            <h2 className="text-xl font-bold text-gray-800">{user?.name || 'Hello, User'}</h2>
            <p className="text-sm text-gray-500 mt-1">+88 01685007600</p>
            <p className="text-brand-light font-medium text-sm mt-3">{user?.role || 'User'} Department (Dhaka Office)</p>
          </div>

          <div className="mt-8">
            <h3 className="font-bold text-gray-800 text-lg mb-4">General</h3>

            <div className="space-y-4">
              <button className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-brand-light flex items-center justify-center">
                    <FiGlobe className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-700">Language Setup</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <span>BN</span>
                  <div className="w-10 h-5 bg-brand-light rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                  </div>
                  <span className="text-brand-light">EN</span>
                </div>
              </button>

              <button className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-400 flex items-center justify-center">
                    <FiLock className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-700">Change Password</span>
                </div>
                <FiArrowLeft className="w-4 h-4 text-gray-300 rotate-180" />
              </button>

              <button className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-400 flex items-center justify-center">
                    <FiShield className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-700">Privacy Policy</span>
                </div>
                <FiArrowLeft className="w-4 h-4 text-gray-300 rotate-180" />
              </button>

              <button className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-400 flex items-center justify-center">
                    <FiFileText className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-700">Terms and Conditions</span>
                </div>
                <FiArrowLeft className="w-4 h-4 text-gray-300 rotate-180" />
              </button>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full md:w-auto md:px-12 bg-brand-light text-brand-dark font-bold text-sm tracking-wider py-4 rounded-full mt-10 shadow-[0_10px_20px_rgba(94,209,155,0.3)] hover:shadow-[0_10px_25px_rgba(94,209,155,0.4)] hover:-translate-y-0.5 transition-all mx-auto block"
          >
            LOG OUT
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
