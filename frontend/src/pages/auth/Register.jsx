import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mysql from 'mysql2';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();

app.use(helmet());

// 🛠️ CORS FIX: Vercel Production aur Local Dono Domain Allowed Hain
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://frontend-nine-lime-88.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// 🗄️ MySQL Connection Pool Settings
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', 
  database: process.env.DB_NAME || 'vehicle_rental',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('💥 MySQL Connection Failed:', err.message);
  } else {
    console.log('✅ Permanent MySQL Database Connected Successfully!');
    connection.release();
  }
});

// =========================================================================
// 🚀 DYNAMIC SIGN UP / REGISTER ROUTE (ALL CORES INTEGRATED)
// =========================================================================
app.post('/api/auth/register', async (req, res) => {
  console.log("📥 RECEIVED SIGNUP PAYLOAD:", req.body);

  try {
    const { 
      name, email, password, role, phone, address, 
      licenseNumber, experienceYears, gstin, businessName 
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required!" });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error("❌ SQL SELECT ERROR:", err.message);
        return res.status(500).json({ success: false, error: "Database mapping failure." });
      }
      
      if (results && results.length > 0) {
        return res.status(400).json({ success: false, message: "Email is already registered!" });
      }

      try {
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);
        const userRole = role || 'customer';

        // 🛠️ FIX: Saare fields explicit push kar rahe hain taaki blank hone par NULL save ho, crash na ho!
        const insertSql = `
          INSERT INTO users 
          (name, email, password, role, phone, address, licenseNumber, experienceYears, gstin, businessName, createdAt, updatedAt) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        db.query(insertSql, [
          name || 'New User', 
          email, 
          hashedPassword, 
          userRole,
          phone || null,
          address || null,
          licenseNumber || null,
          experienceYears ? parseInt(experienceYears) : null,
          gstin || null,
          businessName || null
        ], (insertErr, result) => {
          if (insertErr) {
            console.error("❌ MySQL Insertion Error:", insertErr.message);
            return res.status(500).json({ success: false, error: `DB Insert Failure: ${insertErr.message}` });
          }

          const token = jwt.sign(
            { id: result.insertId, role: userRole },
            process.env.JWT_SECRET || 'cyber_secret_key_fixed_node_2026',
            { expiresIn: '7d' }
          );

          console.log("✅ USER DATA SUCCESSFULLY STORED IN DATABASE!");

          return res.status(201).json({
            success: true,
            message: "Registration completed successfully!",
            token,
            user: { id: result.insertId, name: name || 'New User', email, role: userRole }
          });
        });

      } catch (innerHashError) {
        return res.status(500).json({ success: false, error: "Password encryption failed." });
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: "Global system routing crash." });
  }
});

// =========================================================================
// 🚀 LOGIN ROUTE
// =========================================================================
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!results || results.length === 0) return res.status(400).json({ success: false, message: "User not found." });

    const user = results[0];

    try {
      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ success: false, message: "Invalid password structure." });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'cyber_secret_key_fixed_node_2026',
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (hashCompareError) {
      return res.status(500).json({ success: false, error: "Validation processing exception." });
    }
  });
});

// =========================================================================
// 🚙 ADDITIONAL SYSTEMS (VEHICLES & BOOKINGS)
// =========================================================================
app.get('/api/vehicles', (req, res) => {
  db.query('SELECT * FROM vehicles ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    return res.json({ success: true, vehicles: results });
  });
});

app.get('/api/vehicles/:id', (req, res) => {
  db.query('SELECT * FROM vehicles WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (results.length === 0) return res.status(404).json({ success: false, message: "Not found." });
    return res.json({ success: true, vehicle: results[0] });
  });
});

app.post('/api/vehicles/add', (req, res) => {
  const { name, type, fuelType, pricePerDay, vehicleNumber, imageUrl } = req.body;
  db.query('INSERT INTO vehicles (name, type, fuelType, pricePerDay, vehicleNumber, imageUrl, status) VALUES (?, ?, ?, ?, ?, ?, "Available")', [name, type, fuelType, pricePerDay, vehicleNumber, imageUrl], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    return res.status(201).json({ success: true, message: "Vehicle deployed live!" });
  });
});

app.post('/api/bookings/add', (req, res) => {
  const { customerName, customerEmail, vehicleId, vehicleName, vehicleNumber, startDate, endDate, totalDays, totalCost, driverAllocated, driverPhone } = req.body;
  const sql = `INSERT INTO bookings (customerName, customerEmail, vehicleId, vehicleName, vehicleNumber, startDate, endDate, totalDays, totalCost, driverAllocated, driverPhone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active Leased')`;
  db.query(sql, [customerName, customerEmail, vehicleId, vehicleName, vehicleNumber, startDate, endDate, totalDays, totalCost, driverAllocated || 'Self Drive', driverPhone || 'N/A'], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    db.query('UPDATE vehicles SET status = "Rented" WHERE id = ?', [vehicleId]);
    return res.status(201).json({ success: true, message: "Booking permanent locked." });
  });
});

app.get('/api/bookings/all', (req, res) => {
  db.query('SELECT * FROM bookings ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    return res.json({ success: true, bookings: results });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Core Server processing matrix deployments on port ${PORT}`));