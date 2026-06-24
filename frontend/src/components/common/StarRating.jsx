import { FiStar } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';

const StarRating = ({ rating = 0, size = 'sm', interactive = false, onRate }) => {
  const sizeClass = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-2xl';

  if (interactive) {
    return (
      <div className={`flex gap-1 ${sizeClass}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRate(star)}
            className="text-yellow-400 hover:scale-110 transition-transform"
          >
            {star <= rating ? <FaStar /> : <FiStar />}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex gap-0.5 ${sizeClass} text-yellow-400`}>
      {[1, 2, 3, 4, 5].map((star) => {
        if (star <= Math.floor(rating)) return <FaStar key={star} />;
        if (star === Math.ceil(rating) && rating % 1 >= 0.5) return <FaStarHalfAlt key={star} />;
        return <FiStar key={star} className="text-gray-300" />;
      })}
    </div>
  );
};

export default StarRating;
