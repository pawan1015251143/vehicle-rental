import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBookings } from '../../redux/slices/bookingSlice';
import { getWishlist } from '../../redux/slices/authSlice';
import { FiCalendar, FiHeart, FiClock, FiCheckCircle } from 'react-icons/fi';

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const { user, wishlist } = useSelector((state) => state.auth);
  const { bookings } = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(fetchMyBookings({}));
    dispatch(getWishlist());
  }, [dispatch]);

  const stats = [
    {
      label: 'Total Bookings',
      value: bookings.length,
      icon: FiCalendar,
      color: 'bg-blue-500',
      link: '/bookings',
    },
    {
      label: 'Active Bookings',
      value: bookings.filter((b) => ['confirmed', 'ongoing'].includes(b.status)).length,
      icon: FiClock,
      color: 'bg-green-500',
      link: '/bookings',
    },
    {
      label: 'Completed',
      value: bookings.filter((b) => b.status === 'completed').length,
      icon: FiCheckCircle,
      color: 'bg-purple-500',
      link: '/bookings',
    },
    {
      label: 'Wishlist',
      value: wishlist.length,
      icon: FiHeart,
      color: 'bg-red-500',
      link: '/wishlist',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}! 👋</h1>
        <p className="text-gray-500">Here's an overview of your account</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white mb-3`}>
              <stat.icon className="text-xl" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Bookings</h2>
          <Link to="/bookings" className="text-primary-600 text-sm font-medium">View All →</Link>
        </div>
        {bookings.length > 0 ? (
          <div className="space-y-3">
            {bookings.slice(0, 5).map((booking) => (
              <div key={booking._id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium">{booking.vehicle?.brand} {booking.vehicle?.model}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(booking.startDate).toLocaleDateString()} • {booking.bookingType}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{booking.totalAmount}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No bookings yet. <Link to="/vehicles" className="text-primary-600">Browse vehicles</Link></p>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
