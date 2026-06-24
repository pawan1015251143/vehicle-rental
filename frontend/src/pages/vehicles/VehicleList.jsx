import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles } from '../../redux/slices/vehicleSlice';
import VehicleCard from '../../components/vehicles/VehicleCard';
import Loader from '../../components/common/Loader';
import { FiFilter, FiX, FiSearch } from 'react-icons/fi';

const VehicleList = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { vehicles, loading, total, totalPages, currentPage } = useSelector((state) => state.vehicles);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || '',
    city: searchParams.get('city') || '',
    fuelType: searchParams.get('fuelType') || '',
    transmission: searchParams.get('transmission') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    seats: searchParams.get('seats') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    order: searchParams.get('order') || 'desc',
    page: searchParams.get('page') || '1',
  });

  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    dispatch(fetchVehicles(params));
  }, [filters, dispatch]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: '1' };
    setFilters(newFilters);
    const params = {};
    Object.entries(newFilters).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params);
  };

  const clearFilters = () => {
    const cleared = {
      search: '', type: '', city: '', fuelType: '', transmission: '',
      minPrice: '', maxPrice: '', seats: '', sortBy: 'createdAt', order: 'desc', page: '1',
    };
    setFilters(cleared);
    setSearchParams({});
  };

  const handlePage = (page) => {
    handleFilterChange('page', String(page));
    window.scrollTo(0, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Browse Vehicles</h1>
          <p className="text-gray-500 text-sm">{total} vehicles found</p>
        </div>
        <div className="flex gap-3 items-center w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input-field pl-10 text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <FiFilter /> Filters
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Filters</h3>
            <button onClick={clearFilters} className="text-sm text-red-500 flex items-center gap-1">
              <FiX /> Clear All
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)} className="input-field text-sm">
                <option value="">All Types</option>
                <option value="car">Car</option>
                <option value="bike">Bike</option>
                <option value="scooter">Scooter</option>
                <option value="suv">SUV</option>
                <option value="van">Van</option>
                <option value="truck">Truck</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
              <input type="text" value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)} className="input-field text-sm" placeholder="Enter city" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fuel Type</label>
              <select value={filters.fuelType} onChange={(e) => handleFilterChange('fuelType', e.target.value)} className="input-field text-sm">
                <option value="">All</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
                <option value="cng">CNG</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Transmission</label>
              <select value={filters.transmission} onChange={(e) => handleFilterChange('transmission', e.target.value)} className="input-field text-sm">
                <option value="">All</option>
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Min Price/Day (₹)</label>
              <input type="number" value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} className="input-field text-sm" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max Price/Day (₹)</label>
              <input type="number" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} className="input-field text-sm" placeholder="10000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Min Seats</label>
              <input type="number" value={filters.seats} onChange={(e) => handleFilterChange('seats', e.target.value)} className="input-field text-sm" placeholder="2" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sort By</label>
              <select value={filters.sortBy} onChange={(e) => handleFilterChange('sortBy', e.target.value)} className="input-field text-sm">
                <option value="createdAt">Newest</option>
                <option value="pricePerDay">Price</option>
                <option value="averageRating">Rating</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Grid */}
      {loading ? (
        <Loader text="Loading vehicles..." />
      ) : vehicles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id} vehicle={vehicle} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePage(page)}
                  className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${
                    currentPage === page
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-600 border hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg font-medium">No vehicles found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
};

export default VehicleList;
