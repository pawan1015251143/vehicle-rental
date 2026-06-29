const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true // प्रोफाइल अपडेट और रजिस्ट्रेशन के लिए ज़रूरी है
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('customer', 'owner', 'driver', 'admin', 'user'), // कंट्रोलर के मुताबिक सारे रोल्स ऐड कर दिए
    defaultValue: 'customer'
  },
  avatar: {
    type: DataTypes.JSON, // इमेज ऑब्जेक्ट (public_id और url) स्टोर करने के लिए
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true // लॉगिन चेक के लिए ज़रूरी है
  }
}, {
  timestamps: true
});

// 🔑 कंट्रोलर के मुताबिक पासवर्ड मैच करने का मेथड (comparePassword नाम से)
User.prototype.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 🔄 'beforeSave' हुक: यह नए रजिस्ट्रेशन और पासवर्ड अपडेट दोनों समय पासवर्ड को खुद-ब-खुद हैश कर देगा
User.beforeSave(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

module.exports = User;