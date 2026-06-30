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

// 🛠️ Dynamic CORS Config
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
  if (err) console.error('💥 MySQL Connection Failed:', err.message);
  else { console.log('✅ MySQL Connected Successfully!'); connection.release(); }
});

// =========================================================================
// 🚀 DYNAMIC REUSABLE REGISTER FUNCTION
// =========================================================================
const handleRegister = async (req, res) => {
  console.log("📥 RECEIVED SIGNUP PAYLOAD:", req.body);
  try {
    const { name, email, password, role, phone, address, licenseNumber, experienceYears, gstin, businessName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required!" });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      if (results && results.length > 0) return res.status(400).json({ success: false, message: "Email already exists!" });

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
          name || 'Pawan Kumar', email, hashedPassword, userRole,
          phone || null, address || null, licenseNumber || null,
          experienceYears ? parseInt(experienceYears) : null, gstin || null, businessName || null
        ], (insertErr, result) => {
          if (insertErr) return res.status(500).json({ success: false, error: insertErr.message });

          const token = jwt.sign(
            { id: result.insertId, role: userRole },
            process.env.JWT_SECRET || 'cyber_secret_key_fixed_node_2026',
            { expiresIn: '7d' }
          );

          return res.status(201).json({
            success: true,
            message: "User successfully registered!",
            token,
            user: { id: result.insertId, name: name || 'Pawan Kumar', email, role: userRole }
          });
        });
      } catch (hashingError) { return res.status(500).json({ success: false, error: "Hashing failed" }); }
    });
  } catch (error) { return res.status(500).json({ success: false, error: "Server error" }); }
};

// 🎯 DUAL ROUTE MOUNTING: Frontend /api lagaye ya na lagaye, dono par chalega!
app.post('/auth/register', handleRegister);
app.post('/api/auth/register', handleRegister);

// =========================================================================
// 🚀 DUAL ROUTE LOGIN
// =========================================================================
const handleLogin = (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!results || results.length === 0) return res.status(400).json({ success: false, message: "User not found." });

    const user = results[0];
    try {
      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials." });

      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'cyber_secret_key_fixed_node_2026', { expiresIn: '7d' });
      return res.status(200).json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (e) { return res.status(500).json({ success: false, error: "Login failed" }); }
  });
};

app.post('/auth/login', handleLogin);
app.post('/api/auth/login', handleLogin);

// 🚙 OTHER SYSTEM ROUTING
app.get('/vehicles', (req, res) => db.query('SELECT * FROM vehicles ORDER BY id DESC', (err, r) => res.json({ success: true, vehicles: r })));
app.get('/api/vehicles', (req, res) => db.query('SELECT * FROM vehicles ORDER BY id DESC', (err, r) => res.json({ success: true, vehicles: r })));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Core Server processing matrix deployments on port ${PORT}`));