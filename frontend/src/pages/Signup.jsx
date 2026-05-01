import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Member');
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(name, email, password, role);
      navigate('/');
    } catch (err) {
      alert('Signup failed');
    }
  };

  return (
    <div className="bg-brand-dark min-h-screen flex flex-col justify-center items-center py-12 px-4 relative overflow-hidden">
      {/* Background circles */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8 text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Create Account</h1>
          <p className="text-white/70 text-sm">Join the Team Task Manager</p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-light" placeholder="Jhon Steward" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-light" placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-light" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-light">
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            
            <button type="submit" className="w-full bg-brand-light text-brand-dark font-bold text-sm tracking-wider py-4 rounded-full mt-6 shadow-[0_10px_20px_rgba(94,209,155,0.3)] hover:-translate-y-0.5 transition-all">
              SIGN UP
            </button>
          </form>
          
          <p className="mt-6 text-center text-sm font-medium text-gray-500">
            Already have an account? <Link to="/login" className="text-brand-dark font-bold hover:text-brand-light transition">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
