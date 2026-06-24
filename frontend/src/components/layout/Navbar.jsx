import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { FiMenu, FiX, FiUser, FiLogOut, FiHeart, FiMessageSquare, FiGrid } from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setShowDropdown(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'owner': return '/owner/dashboard';
      default: return '/dashboard';
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <FaCar className="text-primary-600 text-2xl" />
            <span className="text-xl font-bold text-primary-600">VehicleRent</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/vehicles" className="text-gray-600 hover:text-primary-600 transition-colors">
              Browse Vehicles
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/bookings" className="text-gray-600 hover:text-primary-600 transition-colors">
                  My Bookings
                </Link>
                <Link to="/chats" className="text-gray-600 hover:text-primary-600 transition-colors">
                  <FiMessageSquare className="text-xl" />
                </Link>
                <Link to="/wishlist" className="text-gray-600 hover:text-primary-600 transition-colors">
                  <FiHeart className="text-xl" />
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 text-gray-600 hover:text-primary-600"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <FiUser className="text-primary-600" />
                    </div>
                    <span className="font-medium">{user?.name?.split(' ')[0]}</span>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                      </div>
                      <Link
                        to={getDashboardLink()}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FiGrid /> Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FiUser /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                      >
                        <FiLogOut /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden flex items-center"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden border-t py-4 space-y-3">
            <Link to="/vehicles" className="block px-2 py-2 text-gray-600 hover:text-primary-600" onClick={() => setIsOpen(false)}>
              Browse Vehicles
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/bookings" className="block px-2 py-2 text-gray-600 hover:text-primary-600" onClick={() => setIsOpen(false)}>
                  My Bookings
                </Link>
                <Link to={getDashboardLink()} className="block px-2 py-2 text-gray-600 hover:text-primary-600" onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/chats" className="block px-2 py-2 text-gray-600 hover:text-primary-600" onClick={() => setIsOpen(false)}>
                  Messages
                </Link>
                <Link to="/wishlist" className="block px-2 py-2 text-gray-600 hover:text-primary-600" onClick={() => setIsOpen(false)}>
                  Wishlist
                </Link>
                <Link to="/profile" className="block px-2 py-2 text-gray-600 hover:text-primary-600" onClick={() => setIsOpen(false)}>
                  Profile
                </Link>
                <button onClick={handleLogout} className="block w-full text-left px-2 py-2 text-red-600">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-2 py-2 text-gray-600" onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/register" className="block px-2 py-2 text-primary-600 font-medium" onClick={() => setIsOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
