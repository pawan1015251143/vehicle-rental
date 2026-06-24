import { FaCar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <FaCar className="text-primary-400 text-2xl" />
              <span className="text-xl font-bold text-white">VehicleRent</span>
            </div>
            <p className="text-sm text-gray-400">
              Your trusted platform for renting vehicles. Find the perfect ride for every journey.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/vehicles" className="hover:text-white transition-colors">Browse Vehicles</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Owners</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register" className="hover:text-white transition-colors">List Your Vehicle</Link></li>
              <li><Link to="/owner/dashboard" className="hover:text-white transition-colors">Owner Dashboard</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>support@vehiclerent.com</li>
              <li>+91 98765 43210</li>
              <li>Mumbai, India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} VehicleRent. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
