import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getWishlist } from '../redux/slices/authSlice';
import VehicleCard from '../components/vehicles/VehicleCard';
import Loader from '../components/common/Loader';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { wishlist, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getWishlist());
  }, [dispatch]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>

      {loading ? (
        <Loader text="Loading wishlist..." />
      ) : wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((vehicle) => (
            <VehicleCard key={vehicle._id} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <FiHeart className="text-5xl mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Your wishlist is empty</p>
          <p className="text-sm mt-1">Browse vehicles and add your favorites</p>
          <Link to="/vehicles" className="btn-primary mt-4 inline-block">Browse Vehicles</Link>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
