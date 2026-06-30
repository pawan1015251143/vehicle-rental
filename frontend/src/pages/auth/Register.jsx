import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiMapPin, FiAward, FiFileText, FiBriefcase } from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 🧭 URL search query settings for role identification
  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role') || 'customer';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: initialRole, 
    address: '',
    licenseNumber: '',
    experienceYears: '',
    gstin: '',
    businessName: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      // 🧭 App.jsx routers redirect sync layers
      if (user.role === 'owner') {
        navigate('/owner/dashboard');
      } else if (user.role === 'driver') {
        navigate('/driver-dashboard');
      } else {
        navigate('/vehicles');
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.address) {
      toast.error('Please fill in Name, Email, Phone, and Address');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.role === 'driver' && (!formData.licenseNumber || !formData.experienceYears)) {
      toast.error('Drivers must fill in License Number and Experience');
      return;
    }
    if (formData.role === 'owner' && (!formData.businessName || !formData.gstin)) {
      toast.error('Owners must fill in Business Name and GSTIN');
      return;
    }

    const { confirmPassword, ...data } = formData;
    dispatch(register(data));
  };

  const roles = [
    { value: 'customer', label: 'Customer' },
    { value: 'owner', label: 'Vehicle Owner' },
    { value: 'driver', label: 'Driver' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-6">
          <FaCar className="text-purple-500 text-4xl mx-auto mb-3 drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
            Create Account
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Join Patna's premium vehicle network</p>
        </div>

        <form onSubmit={handleSubmit} className="backdrop-blur-xl bg-white/[0.02] border border-white/10 p-8 rounded-2xl shadow-2xl space-y-4">
          
          {/* Role Selection Tabs */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">I am joining as a</label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => handleRoleChange(r.value)}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all duration-300 ${
                    formData.role === r.value
                      ? 'border-purple-500 bg-purple-500/20 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                      : 'border-white/10 bg-white/[0.01] text-gray-500 hover:border-white/20'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Full Name *</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition text-sm" placeholder="John Doe" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email *</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition text-sm" placeholder="you@example.com" />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number *</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition text-sm" placeholder="9876543210" />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Permanent Address *</label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition text-sm" placeholder="Boring Road, Patna, Bihar" />
            </div>
          </div>

          {/* DRIVER SPECIAL FIELDS */}
          {formData.role === 'driver' && (
            <div className="border-t border-dashed border-white/10 pt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-cyan-400 mb-1">Driving License Number *</label>
                <div className="relative">
                  <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/60" />
                  <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} className="w-full bg-slate-900 border border-cyan-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition text-sm" placeholder="BR-01XXXXXXXXX" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-400 mb-1">Experience (In Years) *</label>
                <div className="relative">
                  <FiAward className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/60" />
                  <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} className="w-full bg-slate-900 border border-cyan-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition text-sm" placeholder="5" />
                </div>
              </div>
            </div>
          )}

          {/* OWNER SPECIAL FIELDS */}
          {formData.role === 'owner' && (
            <div className="border-t border-dashed border-white/10 pt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-400 mb-1">Business / Fleet Name *</label>
                <div className="relative">
                  <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500/60" />
                  <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} className="w-full bg-slate-900 border border-purple-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition text-sm" placeholder="Patna Cyber Wheels Ltd" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-400 mb-1">GSTIN Number *</label>
                <div className="relative">
                  <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500/60" />
                  <input type="text" name="gstin" value={formData.gstin} onChange={handleChange} className="w-full bg-slate-900 border border-purple-500/20 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition text-sm" placeholder="10AAAAA0000A1Z5" />
                </div>
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password *</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition text-sm" placeholder="Min 6 characters" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-400 transition">
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Confirm Password *</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition text-sm" placeholder="Re-enter password" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold text-sm tracking-wide shadow-[0_0_15px_rgba(147,51,234,0.3)] transition duration-300 disabled:opacity-50">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-400 pt-1">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 font-medium hover:underline">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;