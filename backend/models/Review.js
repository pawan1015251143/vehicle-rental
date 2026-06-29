const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER, // रिव्यू देने वाले यूज़र की ID
    allowNull: false
  },
  vehicleId: {
    type: DataTypes.INTEGER, // जिस गाड़ी को रिव्यू मिला है
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 } // 1 से 5 स्टार रेटिंग
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Review;