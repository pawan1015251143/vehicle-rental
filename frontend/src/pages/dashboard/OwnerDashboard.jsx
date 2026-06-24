import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyVehicles, deleteVehicle, createVehicle } from '../../redux/slices/vehicleSlice';
import { fetchOwnerBookings, updateBookingStatus } from '../../redux/slices/bookingSlice';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiTruck, FiDollarSign, FiCalendar, FiEdit } from 'react-icons/fi';

const OwnerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myVehicles, loading: vLoading } = useSelector((state) => state.vehicles);
  const { bookings, loading: bLoading } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.auth);
  const [tab, setTab] = useState('vehicles');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', type: 'car', brand: '', model: '', year: new Date().getFullYear(),
    registrationNumber: '', fuelType: 'petrol', transmission: 'manual', seats: 4,
    pricePerHour: '', pricePerDay: '', city: '', state: '', address: '', description: '', features: '',
  });
  const [images, setImages] = useState(null);

  useEffect(() => {
    dispatch(fetchMyVehicles());
    dispatch(fetchOwnerBookings({}));
  }, [dispatch]);

  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (key === 'city' || key === 'state' || key === 'address') return;
      if (key === 'features') {
        fd.append(key, val);
        return;
      }
      fd.append(key, val);
    });
    fd.append('location[city]', formData.city);
    fd.append('location[state]', formData.state);
    fd.append('location[address]', formData.address);
    if (images) {
      for (let i = 0; i < images.length; i++) {
        fd.append('images', images[i]);
      }
    }
    try {
      await dispatch(createVehicle(fd)).unwrap();
      toast.success('Vehicle added! Pending admin approval.');
      setShowAddForm(false);
      setFormData({
        name: '', type: 'car', brand: '', model: '', year: new Date().getFullYear(),
        registrationNumber: '', fuelType: 'petrol', transmission: 'manual', seats: 4,
        pricePerHour: '', pricePerDay: '', city: '', state: '', address: '', description: '', features: '',
      });
      setImages(null);
    } catch (err) {
      toast.error(err || 'Failed to add vehicle');
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Delete this vehicle?')) {
      try {
        await dispatch(deleteVehicle(id)).unwrap();
        toast.success('Vehicle deleted');
      } catch (err) {
        toast.error(err);
      }
    }
  };

  const handleBookingAction = async (id, status) => {
    try {
      await dispatch(updateBookingStatus({ id, status })).unwrap();
      toast.success(`Booking ${status}`);
    } catch (err) {
      toast.error(err);
    }
  };

  const statusBadge = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Owner Dashboard</h1>
      <p className="text-gray-500 mb-6">Welcome, {user?.name}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <FiTruck className="text-2xl text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{myVehicles.length}</p>
          <p className="text-sm text-gray-500">My Vehicles</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <FiCalendar className="text-2xl text-green-500 mb-2" />
          <p className="text-2xl font-bold">{bookings.length}</p>
          <p className="text-sm text-gray-500">Total Bookings</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <FiDollarSign className="text-2xl text-purple-500 mb-2" />
          <p className="text-2xl font-bold">₹{totalRevenue}</p>
          <p className="text-sm text-gray-500">Total Revenue</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <FiCalendar className="text-2xl text-orange-500 mb-2" />
          <p className="text-2xl font-bold">{bookings.filter((b) => b.status === 'pending').length}</p>
          <p className="text-sm text-gray-500">Pending Bookings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        {['vehicles', 'bookings'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 px-1 font-medium capitalize transition-colors ${
              tab === t ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Vehicles Tab */}
      {tab === 'vehicles' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">My Vehicles</h2>
            <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary text-sm flex items-center gap-1">
              <FiPlus /> Add Vehicle
            </button>
          </div>

          {/* Add Vehicle Form */}
          {showAddForm && (
            <form onSubmit={handleAddVehicle} className="bg-white rounded-xl p-6 shadow-md border mb-6">
              <h3 className="font-semibold mb-4">Add New Vehicle</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Vehicle Name *" className="input-field text-sm" required />
                <select name="type" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="input-field text-sm">
                  <option value="car">Car</option><option value="bike">Bike</option><option value="scooter">Scooter</option>
                  <option value="suv">SUV</option><option value="van">Van</option><option value="truck">Truck</option>
                </select>
                <input name="brand" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} placeholder="Brand *" className="input-field text-sm" required />
                <input name="model" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} placeholder="Model *" className="input-field text-sm" required />
                <input type="number" name="year" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} placeholder="Year *" className="input-field text-sm" required />
                <input name="registrationNumber" value={formData.registrationNumber} onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})} placeholder="Registration Number *" className="input-field text-sm" required />
                <select name="fuelType" value={formData.fuelType} onChange={(e) => setFormData({...formData, fuelType: e.target.value})} className="input-field text-sm">
                  <option value="petrol">Petrol</option><option value="diesel">Diesel</option><option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option><option value="cng">CNG</option>
                </select>
                <select name="transmission" value={formData.transmission} onChange={(e) => setFormData({...formData, transmission: e.target.value})} className="input-field text-sm">
                  <option value="manual">Manual</option><option value="automatic">Automatic</option>
                </select>
                <input type="number" name="seats" value={formData.seats} onChange={(e) => setFormData({...formData, seats: e.target.value})} placeholder="Seats *" className="input-field text-sm" required />
                <input type="number" name="pricePerHour" value={formData.pricePerHour} onChange={(e) => setFormData({...formData, pricePerHour: e.target.value})} placeholder="Price/Hour (₹) *" className="input-field text-sm" required />
                <input type="number" name="pricePerDay" value={formData.pricePerDay} onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})} placeholder="Price/Day (₹) *" className="input-field text-sm" required />
                <input name="city" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="City *" className="input-field text-sm" required />
                <input name="state" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} placeholder="State" className="input-field text-sm" />
                <input name="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Full Address" className="input-field text-sm" />
              </div>
              <textarea name="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Description" className="input-field text-sm mt-4" rows={3} />
              <input name="features" value={formData.features} onChange={(e) => setFormData({...formData, features: e.target.value})} placeholder="Features (comma separated: AC, GPS, Bluetooth)" className="input-field text-sm mt-4" />
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Images (up to 5)</label>
                <input type="file" multiple accept="image/*" onChange={(e) => setImages(e.target.files)} className="input-field text-sm" />
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="btn-primary">Add Vehicle</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          )}

          {vLoading ? (
            <Loader />
          ) : myVehicles.length > 0 ? (
            <div className="grid gap-4">
              {myVehicles.map((v) => (
                <div key={v._id} className="bg-white rounded-xl p-4 shadow-sm border flex items-center gap-4">
                  <img
                    src={v.images?.[0]?.url || `https://placehold.co/100x80/e2e8f0/64748b?text=${v.type}`}
                    alt={v.name}
                    className="w-24 h-18 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{v.brand} {v.model}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge[v.status] || 'bg-gray-100'}`}>
                        {v.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{v.registrationNumber} • ₹{v.pricePerDay}/day</p>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/vehicles/${v._id}`} className="btn-secondary text-sm">View</Link>
                    <button onClick={() => handleDeleteVehicle(v._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No vehicles listed yet</p>
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {tab === 'bookings' && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Bookings for My Vehicles</h2>
          {bLoading ? (
            <Loader />
          ) : bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b._id} className="bg-white rounded-xl p-4 shadow-sm border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{b.vehicle?.brand} {b.vehicle?.model}</p>
                      <p className="text-sm text-gray-500">
                        Customer: {b.customer?.name} • {new Date(b.startDate).toLocaleDateString()} to {new Date(b.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm font-medium mt-1">₹{b.totalAmount} • {b.bookingType}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        b.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {b.status}
                      </span>
                      {b.status === 'confirmed' && (
                        <div className="flex gap-1">
                          <button onClick={() => handleBookingAction(b._id, 'ongoing')} className="text-xs btn-primary py-1">Start Trip</button>
                          <button onClick={() => handleBookingAction(b._id, 'cancelled')} className="text-xs btn-danger py-1">Cancel</button>
                        </div>
                      )}
                      {b.status === 'ongoing' && (
                        <button onClick={() => handleBookingAction(b._id, 'completed')} className="text-xs btn-success py-1">Complete</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No bookings yet</p>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
