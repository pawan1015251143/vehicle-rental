import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDashboardStats,
  fetchAllUsers,
  adminUpdateUser,
  adminDeleteUser,
  fetchAllVehiclesAdmin,
  approveVehicle,
  fetchAllBookingsAdmin,
} from '../../redux/slices/adminSlice';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { FiUsers, FiTruck, FiCalendar, FiDollarSign, FiCheck, FiX, FiTrash2 } from 'react-icons/fi';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, users, vehicles, bookings, loading } = useSelector((state) => state.admin);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  useEffect(() => {
    if (tab === 'users') dispatch(fetchAllUsers({}));
    if (tab === 'vehicles') dispatch(fetchAllVehiclesAdmin({}));
    if (tab === 'bookings') dispatch(fetchAllBookingsAdmin({}));
  }, [tab, dispatch]);

  const handleApproval = async (id, status) => {
    try {
      await dispatch(approveVehicle({ id, status })).unwrap();
      toast.success(`Vehicle ${status}`);
    } catch (err) {
      toast.error(err);
    }
  };

  const handleUserUpdate = async (id, updates) => {
    try {
      await dispatch(adminUpdateUser({ id, updates })).unwrap();
      toast.success('User updated');
    } catch (err) {
      toast.error(err);
    }
  };

  const handleUserDelete = async (id) => {
    if (window.confirm('Delete this user?')) {
      try {
        await dispatch(adminDeleteUser(id)).unwrap();
        toast.success('User deleted');
      } catch (err) {
        toast.error(err);
      }
    }
  };

  const tabs = ['overview', 'users', 'vehicles', 'bookings'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 px-2 font-medium capitalize whitespace-nowrap transition-colors ${
              tab === t ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div>
          {loading ? (
            <Loader />
          ) : stats ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-5 shadow-sm border">
                  <FiUsers className="text-2xl text-blue-500 mb-2" />
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-sm text-gray-500">Total Users</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border">
                  <FiTruck className="text-2xl text-green-500 mb-2" />
                  <p className="text-2xl font-bold">{stats.totalVehicles}</p>
                  <p className="text-sm text-gray-500">Total Vehicles</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border">
                  <FiCalendar className="text-2xl text-purple-500 mb-2" />
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                  <p className="text-sm text-gray-500">Total Bookings</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border">
                  <FiDollarSign className="text-2xl text-orange-500 mb-2" />
                  <p className="text-2xl font-bold">₹{stats.totalRevenue}</p>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pending Approvals */}
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <h3 className="font-semibold mb-3">Pending Vehicle Approvals</h3>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingVehicles}</p>
                  <button onClick={() => setTab('vehicles')} className="text-sm text-primary-600 mt-2">Review →</button>
                </div>

                {/* Users by Role */}
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <h3 className="font-semibold mb-3">Users by Role</h3>
                  <div className="space-y-2">
                    {stats.usersByRole?.map((r) => (
                      <div key={r._id} className="flex justify-between">
                        <span className="capitalize text-gray-600">{r._id}</span>
                        <span className="font-semibold">{r.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="bg-white rounded-xl p-6 shadow-sm border mt-6">
                <h3 className="font-semibold mb-4">Recent Bookings</h3>
                {stats.recentBookings?.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentBookings.map((b) => (
                      <div key={b._id} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium text-sm">{b.customer?.name}</p>
                          <p className="text-xs text-gray-500">{b.vehicle?.name} {b.vehicle?.brand}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">₹{b.totalAmount}</p>
                          <span className="text-xs capitalize text-gray-500">{b.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No recent bookings</p>
                )}
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{u.name}</td>
                    <td className="p-4 text-gray-500">{u.email}</td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleUserUpdate(u._id, { role: e.target.value })}
                        className="text-xs border rounded px-2 py-1"
                      >
                        <option value="customer">Customer</option>
                        <option value="owner">Owner</option>
                        <option value="driver">Driver</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleUserUpdate(u._id, { isActive: !u.isActive })}
                        className={`text-xs px-2 py-1 rounded-full ${
                          u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4">
                      <button onClick={() => handleUserDelete(u._id)} className="text-red-500 hover:text-red-700">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vehicles Tab */}
      {tab === 'vehicles' && (
        <div className="space-y-3">
          {vehicles.map((v) => (
            <div key={v._id} className="bg-white rounded-xl p-4 shadow-sm border flex items-center gap-4">
              <img
                src={v.images?.[0]?.url || `https://placehold.co/80x60/e2e8f0/64748b?text=${v.type}`}
                alt="" className="w-20 h-14 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold">{v.brand} {v.model}</p>
                <p className="text-xs text-gray-500">Owner: {v.owner?.name} • {v.registrationNumber}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                v.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                v.status === 'approved' ? 'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'
              }`}>
                {v.status}
              </span>
              {v.status === 'pending' && (
                <div className="flex gap-1">
                  <button onClick={() => handleApproval(v._id, 'approved')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                    <FiCheck />
                  </button>
                  <button onClick={() => handleApproval(v._id, 'rejected')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                    <FiX />
                  </button>
                </div>
              )}
            </div>
          ))}
          {vehicles.length === 0 && <p className="text-center py-8 text-gray-500">No vehicles</p>}
        </div>
      )}

      {/* Bookings Tab */}
      {tab === 'bookings' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Vehicle</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Payment</th>
                  <th className="text-left p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{b.customer?.name}</td>
                    <td className="p-4">{b.vehicle?.brand} {b.vehicle?.model}</td>
                    <td className="p-4 font-medium">₹{b.totalAmount}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        b.status === 'completed' ? 'bg-green-100 text-green-700' :
                        b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        b.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bookings.length === 0 && <p className="text-center py-8 text-gray-500">No bookings</p>}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
