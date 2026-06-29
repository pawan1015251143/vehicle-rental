const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  bookingId: {
    type: DataTypes.INTEGER, // किस बुकिंग के लिए पेमेंट हुआ है
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER, // पेमेंट करने वाले यूज़र की ID
    allowNull: false
  },
  razorpayOrderId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  razorpayPaymentId: {
    type: DataTypes.STRING,
    allowNull: true // शुरुआत में यह खाली रहेगा, पेमेंट सक्सेस होने पर अपडेट होगा
  },
  razorpaySignature: {
    type: DataTypes.STRING,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'captured', 'failed', 'refunded'),
    defaultValue: 'pending'
  }
}, {
  timestamps: true
});

module.exports = Payment;