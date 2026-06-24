import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicle, fetchVehicleReviews, clearVehicle } from '../../redux/slices/vehicleSlice';
import { createBooking } from '../../redux/slices/bookingSlice';
import { toggleWishlist } from '../../redux/slices/authSlice';
import StarRating from '../../components/common/StarRating';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { FiMapPin, FiUsers, FiCalendar, FiClock, FiHeart, FiMessageSquare } from 'react-icons/fi';
import { FaHeart, FaGasPump, FaCheckCircle } from 'react-icons/fa';
import { TbManualGearbox } from 'react-icons/tb';

const VehicleDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { vehicle, loading, reviews } = useSelector((state) => state.vehicles);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { loading: bookingLoading } = useSelector((state) => state.bookings);

  const [activeImg, setActiveImg] = useState(0);
  const [bookingType, setBookingType] = useState('daily');
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    pickupLocation: '',
    dropoffLocation: '',
    notes: '',
  });

  useEffect(() => {
    dispatch(fetchVehicle(id));
    dispatch(fetchVehicleReviews({ vehicleId: id }));
    return () => dispatch(clearVehicle());
  }, [id, dispatch]);

  const isWishlisted = user?.wishlist?.includes(vehicle?._id);

  const calculateTotal = () => {
    if (!bookingData.startDate || !bookingData.endDate || !vehicle) return 0;
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    if (bookingType === 'hourly') {
      const hours = Math.ceil((end - start) / (1000 * 60 * 60));
      return hours * vehicle.pricePerHour;
    }
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return (days < 1 ? 1 : days) * vehicle.pricePerDay;
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to book');
      navigate('/login');
      return;
    }
    if (!bookingData.startDate || !bookingData.endDate || !bookingData.pickupLocation) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      const result = await dispatch(
        createBooking({
          vehicle: vehicle._id,
          bookingType,
          ...bookingData,
        })
      ).unwrap();
      toast.success('Booking created! Proceed to payment.');
      navigate(`/bookings`);
    } catch (err) {
      toast.error(err || 'Booking failed');
    }
  };

  if (loading) return <Loader text="Loading vehicle details..." />;
  if (!vehicle) return <div className="text-center py-20 text-gray-500">Vehicle not found</div>;

  const placeholderImg = `https://placehold.co/800x500/e2e8f0/64748b?text=${vehicle.type}`;
  const images = vehicle.images?.length > 0 ? vehicle.images : [{ url: placeholderImg }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Image */}
          <div className="bg-white rounded-xl overflow-hidden shadow-md">
            <img
              src={images[activeImg]?.url || placeholderImg}
              alt={vehicle.name}
              className="w-full h-[400px] object-cover"
              onError={(e) => { e.target.src = placeholderImg; }}
            />
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                      activeImg === i ? 'border-primary-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <span className="badge-approved capitalize">{vehicle.type}</span>
                <h1 className="text-2xl font-bold mt-2">{vehicle.brand} {vehicle.model}</h1>
                <p className="text-gray-500">{vehicle.name} • {vehicle.year}</p>
              </div>
              <button
                onClick={() => {
                  if (!isAuthenticated) { toast.error('Please login'); return; }
                  dispatch(toggleWishlist(vehicle._id));
                }}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                {isWishlisted ? <FaHeart className="text-red-500 text-xl" /> : <FiHeart className="text-xl" />}
              </button>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <StarRating rating={vehicle.averageRating} size="md" />
              <span className="text-gray-500">({vehicle.totalReviews} reviews)</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiUsers className="text-primary-500" /> {vehicle.seats} Seats
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaGasPump className="text-primary-500" /> {vehicle.fuelType}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TbManualGearbox className="text-primary-500" /> {vehicle.transmission}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiMapPin className="text-primary-500" /> {vehicle.location?.city}
              </div>
            </div>

            {vehicle.description && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{vehicle.description}</p>
              </div>
            )}

            {vehicle.features?.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-semibold mb-2">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((f, i) => (
                    <span key={i} className="flex items-center gap-1 text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full">
                      <FaCheckCircle className="text-xs" /> {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Owner Info */}
            <div className="mt-6 pt-4 border-t">
              <h3 className="font-semibold mb-3">Listed by</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                    {vehicle.owner?.name?.[0]}
                  </div>
                  <div>
                    <p className="font-medium">{vehicle.owner?.name}</p>
                    <p className="text-xs text-gray-500">{vehicle.owner?.email}</p>
                  </div>
                </div>
                {isAuthenticated && user?._id !== vehicle.owner?._id && (
                  <button
                    onClick={() => navigate('/chats', { state: { participantId: vehicle.owner?._id } })}
                    className="btn-secondary text-sm flex items-center gap-1"
                  >
                    <FiMessageSquare /> Chat
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="font-semibold text-lg mb-4">Reviews ({vehicle.totalReviews})</h3>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{review.user?.name}</span>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-sm text-gray-600">{review.comment}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No reviews yet</p>
            )}
          </div>
        </div>

        {/* Right: Booking Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-md sticky top-20">
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-bold text-primary-600">₹{vehicle.pricePerDay}</span>
              <span className="text-gray-500">/day</span>
              <span className="text-gray-400 mx-1">|</span>
              <span className="text-lg font-semibold text-gray-700">₹{vehicle.pricePerHour}</span>
              <span className="text-gray-500">/hr</span>
            </div>

            <form onSubmit={handleBook} className="space-y-4">
              {/* Booking Type */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBookingType('daily')}
                  className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                    bookingType === 'daily'
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <FiCalendar className="inline mr-1" /> Daily
                </button>
                <button
                  type="button"
                  onClick={() => setBookingType('hourly')}
                  className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                    bookingType === 'hourly'
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <FiClock className="inline mr-1" /> Hourly
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  value={bookingData.startDate}
                  onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                  className="input-field text-sm"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End Date & Time *</label>
                <input
                  type="datetime-local"
                  value={bookingData.endDate}
                  onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                  className="input-field text-sm"
                  min={bookingData.startDate}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Pickup Location *</label>
                <input
                  type="text"
                  value={bookingData.pickupLocation}
                  onChange={(e) => setBookingData({ ...bookingData, pickupLocation: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Enter pickup address"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Drop-off Location</label>
                <input
                  type="text"
                  value={bookingData.dropoffLocation}
                  onChange={(e) => setBookingData({ ...bookingData, dropoffLocation: e.target.value })}
                  className="input-field text-sm"
                  placeholder="Same as pickup if empty"
                />
              </div>

              {/* Price Summary */}
              {calculateTotal() > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Rental ({bookingType})</span>
                    <span className="font-medium">₹{calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t mt-2">
                    <span>Total</span>
                    <span className="text-primary-600">₹{calculateTotal()}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={bookingLoading}
                className="btn-primary w-full py-3 text-base"
              >
                {bookingLoading ? 'Booking...' : 'Book Now'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
