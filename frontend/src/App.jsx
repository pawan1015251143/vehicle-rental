import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Layout & Common Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Standard Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VehicleList from './pages/vehicles/VehicleList';
import VehicleDetails from './pages/vehicles/VehicleDetails';
import MyBookings from './pages/bookings/MyBookings';
import CustomerDashboard from './pages/dashboard/CustomerDashboard';
import OwnerDashboard from './pages/dashboard/OwnerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ChatPage from './pages/chat/ChatPage';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';

// 🚀 FIXED FULL FLEET ARRAY (Saari Rides Wapas Puri Shaan Se!)
const myCustomCars = [
  {
    id: 1,
    name: "Mahindra Thar Roxx",
    type: "SUV",
    fuelType: "Diesel",
    pricePerDay: 3500,
    vehicleNumber: "BR-01-TH-2026",
    imageUrl: "https://images.unsplash.com/photo-1695662057396-4190e2fe7f07?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 2,
    name: "Maruti Suzuki Grand Vitara",
    type: "SUV",
    fuelType: "Petrol (Hybrid)",
    pricePerDay: 2200,
    vehicleNumber: "BR-01-MS-8899",
    imageUrl: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 3,
    name: "Audi A6 Matrix",
    type: "Luxury",
    fuelType: "Petrol",
    pricePerDay: 9500,
    vehicleNumber: "BR-01-AU-4444",
    imageUrl: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 4,
    name: "Tesla Model S",
    type: "Luxury",
    fuelType: "Electric",
    pricePerDay: 12000,
    vehicleNumber: "BR-01-TS-7777",
    imageUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 5,
    name: "Ford Mustang GT V8",
    type: "Luxury",
    fuelType: "Petrol",
    pricePerDay: 15000,
    vehicleNumber: "BR-01-GT-5000",
    imageUrl: "https://images.unsplash.com/photo-1611245555447-4c18227ece35?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 6,
    name: "Mercedes-Benz S-Class",
    type: "Luxury",
    fuelType: "Diesel",
    pricePerDay: 18000,
    vehicleNumber: "BR-01-MB-0001",
    imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 7,
    name: "Hero Splendor Bike",
    type: "Sedan", 
    fuelType: "Petrol",
    pricePerDay: 600,
    vehicleNumber: "BR-01-HH-4567",
    imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 8,
    name: "Stryder Krueger Cycle",
    type: "Sedan", 
    fuelType: "Manual",
    pricePerDay: 200,
    vehicleNumber: "CYCLE-STR-99",
    imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 9,
    name: "Royal Enfield Classic 350",
    type: "Luxury",
    fuelType: "Petrol",
    pricePerDay: 1500,
    vehicleNumber: "BR-01-RE-3500",
    imageUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=600"
  }
];

// 🚀 DRIVER/FLEET VISUALIZER COMPONENT
const DriverDashboard = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState(myCustomCars); 
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/vehicles');
        if (res.data && res.data.vehicles && res.data.vehicles.length > 0) {
          setVehicles(res.data.vehicles);
        }
      } catch (err) {
        console.log("Database empty or API unreachable, displaying internal asset array.");
      }
    };
    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = !search || (vehicle.name && vehicle.name.toLowerCase().includes(search.toLowerCase()));
    // Custom handling for bike/cycle mapping to match display
    const matchesType = filterType === 'All' || vehicle.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            CYBER FLEET HUB
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-mono">Select your tactical ride identity block.</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 mb-8 flex flex-col sm:flex-row gap-4">
        <input 
          type="text" 
          placeholder="Filter modules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-900 border border-white/10 rounded-lg p-3 text-cyan-400 font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-900 text-slate-300 border border-white/10 rounded-lg p-3 font-mono cursor-pointer"
        >
          <option value="All">All Categories</option>
          <option value="Sedan">Sedan / Two-Wheelers</option>
          <option value="SUV">SUV</option>
          <option value="Luxury">Luxury</option>
        </select>
      </div>

      <main className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="group bg-white/5 backdrop-blur-md border border-white/10 hover:border-cyan-500/50 rounded-xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] transform hover:-translate-y-1">
            <div>
              <div className="w-full h-44 rounded-lg overflow-hidden border border-white/5 mb-4 relative bg-slate-900">
                <img src={vehicle.imageUrl} alt={vehicle.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-bold tracking-wide text-slate-100 group-hover:text-cyan-400">{vehicle.name}</h3>
              <p className="text-slate-400 text-xs font-mono mt-2 uppercase">Fuel: {vehicle.fuelType}</p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-lg font-mono text-cyan-400 font-semibold">₹{vehicle.pricePerDay}</span>
              {/* 🛠️ FIX: `RENT_NOW` triggers dynamic detailed setup */}
              <button 
                onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 px-4 rounded-lg text-sm font-mono transition-colors shadow-[0_0_10px_rgba(6,182,212,0.2)]"
              >
                RENT_NOW
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

// Main App Router Setup
function App() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/vehicles" element={<DriverDashboard />} />
          <Route path="/vehicles/:id" element={<VehicleDetails />} />
          
          {/* 🧭 Dynamic Authentication Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute roles={['driver']}><DriverDashboard /></ProtectedRoute>} />
          <Route path="/owner/dashboard" element={<ProtectedRoute roles={['owner']}><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/customer-dashboard" element={<ProtectedRoute roles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/driver-dashboard" element={<ProtectedRoute roles={['driver']}><DriverDashboard /></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          
          {/* Core System Blocks */}
          <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/chats" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          
          {/* Fallback Catch */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;