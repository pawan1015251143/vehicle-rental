import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleWishlist } from '../../redux/slices/authSlice';
import StarRating from '../common/StarRating';
import { FiHeart, FiMapPin, FiUsers, FiZap } from 'react-icons/fi';
import { FaHeart, FaGasPump } from 'react-icons/fa';
import { TbManualGearbox } from 'react-icons/tb';
import toast from 'react-hot-toast';

const VehicleCard = ({ vehicle }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const isWishlisted = user?.wishlist?.includes(vehicle._id);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }
    dispatch(toggleWishlist(vehicle._id));
  };

  const placeholderImg = `https://placehold.co/400x250/e2e8f0/64748b?text=${vehicle.type}`;

  return (
    <Link to={`/vehicles/${vehicle._id}`} className="card group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={vehicle.images?.[0]?.url || placeholderImg}
          alt={vehicle.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.src = placeholderImg; }}
        />
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
        >
          {isWishlisted ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FiHeart className="text-gray-600" />
          )}
        </button>
        <span className="absolute top-3 left-3 bg-primary-600 text-white text-xs px-2 py-1 rounded-full capitalize">
          {vehicle.type}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 truncate">
          {vehicle.brand} {vehicle.model}
        </h3>
        <p className="text-sm text-gray-500 truncate">{vehicle.name} • {vehicle.year}</p>

        {/* Features */}
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <FiUsers /> {vehicle.seats} seats
          </span>
          <span className="flex items-center gap-1">
            <FaGasPump /> {vehicle.fuelType}
          </span>
          <span className="flex items-center gap-1">
            <TbManualGearbox /> {vehicle.transmission}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
          <FiMapPin /> {vehicle.location?.city}
        </div>

        {/* Rating & Price */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="flex items-center gap-1">
            <StarRating rating={vehicle.averageRating} />
            <span className="text-xs text-gray-500">({vehicle.totalReviews})</span>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary-600">₹{vehicle.pricePerDay}</p>
            <p className="text-xs text-gray-500">/day</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VehicleCard;
