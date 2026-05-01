import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Member');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const { login, verifyLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (step === 1) {
        const result = await login(email, password, role);
        if (!result.emailSent) {
          setError('Credentials valid but email delivery failed. Check server console for OTP.');
        }
        setStep(2);
      } else {
        await verifyLogin(email, otp);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="bg-brand-dark min-h-screen flex flex-col justify-center items-center py-12 px-4 relative overflow-hidden">
      {/* Background circles */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8 text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Task Manager</h1>
          <p className="text-white/70 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl">
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-light" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-light" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Login As</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-light">
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Enter OTP</label>
                <p className="text-xs text-gray-500 mb-3">Please check your email for the verification code.</p>
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-light" placeholder="6-digit OTP" />
              </div>
            )}
            
            {error && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
                {error}
              </div>
            )}

            <button type="submit" className="w-full bg-brand-light text-brand-dark font-bold text-sm tracking-wider py-4 rounded-full mt-8 shadow-[0_10px_20px_rgba(94,209,155,0.3)] hover:-translate-y-0.5 transition-all">
              {step === 1 ? 'SIGN IN' : 'VERIFY OTP'}
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm font-medium text-gray-500">
            Don't have an account? <Link to="/signup" className="text-brand-dark font-bold hover:text-brand-light transition">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
