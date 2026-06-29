const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// MySQL से Sequelize का कनेक्शन सेटअप
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, 
    port: process.env.DB_PORT || 3306
  }
);

// कनेक्शन को टेस्ट करने का फंक्शन
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('🚀 MySQL Database Connected Successfully via Sequelize!');
  } catch (error) {
    console.error('❌ MySQL Connection Error:', error.message);
    process.exit(1);
  }
};

// 🌟 यह सबसे ज़रूरी लाइन है, दोनों को ऑब्जेक्ट बनाकर एक्सपोर्ट करना है!
module.exports = { sequelize, connectDB };