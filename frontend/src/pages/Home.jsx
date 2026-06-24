import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles } from '../redux/slices/vehicleSlice';
import VehicleCard from '../components/vehicles/VehicleCard';
import Loader from '../components/common/Loader';
import { FaCar, FaShieldAlt, FaHeadset, FaMoneyBillWave } from 'react-icons/fa';
import { FiSearch, FiArrowRight } from 'react-icons/fi';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { vehicles, loading } = useSelector((state) => state.vehicles);
  const [searchCity, setSearchCity] = useState('');

  useEffect(() => {
    dispatch(fetchVehicles({ limit: 8 }));
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/vehicles${searchCity ? `?city=${searchCity}` : ''}`);
  };

  const features = [
    { icon: FaCar, title: 'Wide Selection', desc: 'Cars, bikes, SUVs, and more from verified owners' },
    { icon: FaShieldAlt, title: 'Safe & Secure', desc: 'All vehicles verified and insured for your safety' },
    { icon: FaMoneyBillWave, title: 'Best Prices', desc: 'Competitive hourly and daily rental rates' },
    { icon: FaHeadset, title: '24/7 Support', desc: 'Real-time chat with owners and customer support' },
  ];

  const vehicleTypes = [
    { type: 'car', label: 'Cars', emoji: '🚗' },
    { type: 'bike', label: 'Bikes', emoji: '🏍️' },
    { type: 'suv', label: 'SUVs', emoji: '🚙' },
    { type: 'scooter', label: 'Scooters', emoji: '🛵' },
    { type: 'van', label: 'Vans', emoji: '🚐' },
    { type: 'truck', label: 'Trucks', emoji: '🚛' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Rent Your Perfect <br />
              <span className="text-primary-200">Vehicle Today</span>
            </h1>
            <p className="mt-4 text-lg text-primary-100 max-w-xl">
              Find the best vehicles for rent — by the hour or by the day.
              Book instantly, pay securely, and hit the road.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-8 flex gap-2">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Enter city to search vehicles..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-300 outline-none"
                />
              </div>
              <button type="submit" className="bg-primary-500 hover:bg-primary-400 px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap">
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Vehicle Types */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">Browse by Vehicle Type</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {vehicleTypes.map((vt) => (
            <Link
              key={vt.type}
              to={`/vehicles?type=${vt.type}`}
              className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border hover:border-primary-300"
            >
              <span className="text-3xl mb-2">{vt.emoji}</span>
              <span className="text-sm font-medium text-gray-700">{vt.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Featured Vehicles</h2>
            <Link to="/vehicles" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View All <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <Loader text="Loading vehicles..." />
          ) : vehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {vehicles.slice(0, 8).map((vehicle) => (
                <VehicleCard key={vehicle._id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FaCar className="text-5xl mx-auto mb-4 text-gray-300" />
              <p>No vehicles available yet. Be the first to list one!</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">Why Choose VehicleRent?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center p-6">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon className="text-2xl text-primary-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Have a Vehicle? Start Earning!</h2>
          <p className="text-primary-100 mb-6">
            List your vehicle on VehicleRent and earn money from rentals. Easy setup, quick approvals.
          </p>
          <Link to="/register" className="inline-block bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-primary-50 transition-colors">
            Register as Owner
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
