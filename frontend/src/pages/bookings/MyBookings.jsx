import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBookings, updateBookingStatus, createPaymentOrder, verifyPayment } from '../../redux/slices/bookingSlice';
import { submitReview } from '../../redux/slices/bookingSlice';
import Loader from '../../components/common/Loader';
import StarRating from '../../components/common/StarRating';
import toast from 'react-hot-toast';
import { FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  ongoing: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  refunded: 'bg-gray-100 text-gray-800',
  failed: 'bg-red-100 text-red-800',
};

const MyBookings = () => {
  const dispatch = useDispatch();
  const { bookings, loading } = useSelector((state) => state.bookings);
  const [filter, setFilter] = useState('');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    dispatch(fetchMyBookings(filter ? { status: filter } : {}));
  }, [dispatch, filter]);

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await dispatch(updateBookingStatus({ id: bookingId, status: 'cancelled' })).unwrap();
        toast.success('Booking cancelled');
      } catch (err) {
        toast.error(err);
      }
    }
  };

  const handlePayment = async (bookingId) => {
    try {
      const { order, key } = await dispatch(createPaymentOrder(bookingId)).unwrap();

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'VehicleRent',
        description: 'Vehicle Booking Payment',
        order_id: order.id,
        handler: async (response) => {
          try {
            await dispatch(verifyPayment(response)).unwrap();
            toast.success('Payment successful! Booking confirmed.');
            dispatch(fetchMyBookings({}));
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        theme: { color: '#2563eb' },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.error('Razorpay SDK not loaded. Add the script to index.html');
      }
    } catch (err) {
      toast.error(err || 'Payment failed');
    }
  };

  const handleReview = async () => {
    if (!reviewData.comment.trim()) {
      toast.error('Please write a comment');
      return;
    }
    try {
      await dispatch(submitReview({ bookingId: reviewModal, ...reviewData })).unwrap();
      toast.success('Review submitted!');
      setReviewModal(null);
      setReviewData({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err || 'Review failed');
    }
  };

  if (loading) return <Loader text="Loading bookings..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['', 'pending', 'confirmed', 'ongoing', 'completed', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === s ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-xl shadow-md p-6 border">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Vehicle Image */}
                <div className="w-full md:w-40 h-28 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={booking.vehicle?.images?.[0]?.url || `https://placehold.co/200x120/e2e8f0/64748b?text=Vehicle`}
                    alt={booking.vehicle?.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">
                      {booking.vehicle?.brand} {booking.vehicle?.model}
                    </h3>
                    <span className={`badge ${statusColors[booking.status]}`}>{booking.status}</span>
                    <span className={`badge ${paymentColors[booking.paymentStatus]}`}>
                      Payment: {booking.paymentStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <FiCalendar className="text-primary-500" />
                      {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <FiClock className="text-primary-500" />
                      {booking.bookingType} ({booking.totalDays ? `${booking.totalDays} days` : `${booking.totalHours} hrs`})
                    </div>
                    <div className="flex items-center gap-1">
                      <FiMapPin className="text-primary-500" />
                      {booking.pickupLocation}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <p className="text-lg font-bold text-primary-600">₹{booking.totalAmount}</p>
                    <div className="flex gap-2">
                      {booking.status === 'pending' && booking.paymentStatus === 'pending' && (
                        <>
                          <button onClick={() => handlePayment(booking._id)} className="btn-primary text-sm">
                            Pay Now
                          </button>
                          <button onClick={() => handleCancel(booking._id)} className="btn-danger text-sm">
                            Cancel
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button onClick={() => handleCancel(booking._id)} className="btn-danger text-sm">
                          Cancel
                        </button>
                      )}
                      {booking.status === 'completed' && (
                        <button onClick={() => setReviewModal(booking._id)} className="btn-success text-sm">
                          Write Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg font-medium">No bookings found</p>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <StarRating
                  rating={reviewData.rating}
                  interactive
                  size="lg"
                  onRate={(r) => setReviewData({ ...reviewData, rating: r })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Comment</label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  className="input-field"
                  rows={4}
                  placeholder="Share your experience..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setReviewModal(null)} className="btn-secondary">Cancel</button>
                <button onClick={handleReview} className="btn-primary">Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
