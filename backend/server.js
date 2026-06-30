import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mysql from 'mysql2';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 1. Load Env Config
dotenv.config();

// 2. Initialize Core App Engine
const app = express();

// 3. Middlewares Setup 
app.use(helmet());

// 🛠️ ULTIMATE CORS BYPASS: Allowing everything to kill CORS policy issues forever
app.use(cors({
  origin: '*', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 4. 🗄️ MySQL Connection Pool Settings
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', 
  database: process.env.DB_NAME || 'vehicle_rental',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Pipeline Checker
db.getConnection((err, connection) => {
  if (err) {
    console.error('💥 MySQL Connection Failed:', err.message);
  } else {
    console.log('Permanent MySQL Database Connected Successfully!');
    connection.release();
  }
});

// =========================================================================
// 🚀 FIXED SIGN UP / REGISTER ROUTE (ENDPOINT MATCHED: /auth/register)
// =========================================================================
app.post('/auth/register', async (req, res) => {
  console.log("📥 RECEIVED SIGNUP PAYLOAD:", req.body);

  try {
    const { 
      name, email, password, role, phone, address, 
      licenseNumber, experienceYears, gstin, businessName 
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required fields!" });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error("❌ SQL SELECT ERROR:", err.message);
        return res.status(500).json({ success: false, error: "Database verification layer failed." });
      }
      
      if (results && results.length > 0) {
        return res.status(400).json({ success: false, message: "Email already registered!" });
      }

      try {
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);
        const userRole = role || 'customer';

        const insertSql = `
          INSERT INTO users 
          (name, email, password, role, phone, address, licenseNumber, experienceYears, gstin, businessName, createdAt, updatedAt) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        db.query(insertSql, [
          name || 'Pawan Kumar', 
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
            return res.status(500).json({ success: false, error: `Database insertion collapsed: ${insertErr.message}` });
          }

          const secretKey = process.env.JWT_SECRET || 'cyber_secret_key_fixed_node_2026';
          const token = jwt.sign(
            { id: result.insertId, role: userRole },
            secretKey,
            { expiresIn: '7d' }
          );

          console.log("✅ USER RECORD LOCK: Saved successfully.");

          return res.status(201).json({
            success: true,
            message: "User successfully registered!",
            token,
            user: { id: result.insertId, name: name || 'Pawan Kumar', email, role: userRole }
          });
        });

      } catch (innerHashError) {
        return res.status(500).json({ success: false, error: "Credential mapping failed." });
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: "Global core process crash." });
  }
});

// =========================================================================
// 🚀 FIXED LOGIN ROUTE (ENDPOINT MATCHED: /auth/login)
// =========================================================================
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!results || results.length === 0) return res.status(400).json({ success: false, message: "User not found." });

    const user = results[0];

    try {
      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials." });

      const secretKey = process.env.JWT_SECRET || 'cyber_secret_key_fixed_node_2026';
      const token = jwt.sign(
        { id: user.id, role: user.role },
        secretKey,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (hashCompareError) {
      return res.status(500).json({ success: false, error: "Validation exception." });
    }
  });
});

// =========================================================================
// 🚙 VEHICLE & BOOKINGS SYSTEM OPERATIONS
// =========================================================================
app.get('/vehicles', (req, res) => {
  db.query('SELECT * FROM vehicles ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    return res.json({ success: true, vehicles: results });
  });
});

app.post('/bookings/add', (req, res) => {
  const { customerName, customerEmail, vehicleId, vehicleName, vehicleNumber, startDate, endDate, totalDays, totalCost, driverAllocated, driverPhone } = req.body;
  const sql = `INSERT INTO bookings (customerName, customerEmail, vehicleId, vehicleName, vehicleNumber, startDate, endDate, totalDays, totalCost, driverAllocated, driverPhone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active Leased')`;
  db.query(sql, [customerName, customerEmail, vehicleId, vehicleName, vehicleNumber, startDate, endDate, totalDays, totalCost, driverAllocated || 'Self Drive', driverPhone || 'N/A'], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    db.query('UPDATE vehicles SET status = "Rented" WHERE id = ?', [vehicleId]);
    return res.status(201).json({ success: true, message: "Booking permanent locked." });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Core Server processing matrix deployments on port ${PORT}`);
});