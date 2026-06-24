import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, updatePassword } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock } from 'react-icons/fi';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [tab, setTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    address: { street: '', city: '', state: '', pincode: '' },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || { street: '', city: '', state: '', pincode: '' },
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile(profileData)).unwrap();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err || 'Update failed');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await dispatch(updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })).unwrap();
      toast.success('Password updated');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err || 'Update failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      {/* User Info Card */}
      <div className="bg-white rounded-xl p-6 shadow-md mb-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold">
          {user?.name?.[0]}
        </div>
        <div>
          <h2 className="text-xl font-semibold">{user?.name}</h2>
          <p className="text-gray-500">{user?.email}</p>
          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        <button
          onClick={() => setTab('profile')}
          className={`pb-3 font-medium ${tab === 'profile' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
        >
          Edit Profile
        </button>
        <button
          onClick={() => setTab('password')}
          className={`pb-3 font-medium ${tab === 'password' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
        >
          Change Password
        </button>
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleProfileUpdate} className="bg-white rounded-xl p-6 shadow-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={profileData.address.city}
                onChange={(e) => setProfileData({ ...profileData, address: { ...profileData.address, city: e.target.value } })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={profileData.address.state}
                onChange={(e) => setProfileData({ ...profileData, address: { ...profileData.address, state: e.target.value } })}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
            <input
              type="text"
              value={profileData.address.street}
              onChange={(e) => setProfileData({ ...profileData, address: { ...profileData.address, street: e.target.value } })}
              className="input-field"
            />
          </div>
          <button type="submit" className="btn-primary">Save Changes</button>
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={handlePasswordUpdate} className="bg-white rounded-xl p-6 shadow-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="input-field pl-10"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">Update Password</button>
        </form>
      )}
    </div>
  );
};

export default Profile;
