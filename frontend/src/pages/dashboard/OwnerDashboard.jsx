import React, { useState } from 'react';
import toast from 'react-hot-toast';

// Initial Owner Fleet (With default images mapping)
const initialOwnerFleet = [
  { 
    id: 1, 
    name: "Mahindra Thar Roxx", 
    type: "SUV", 
    fuelType: "Diesel", 
    pricePerDay: 3500, 
    vehicleNumber: "BR-01-TH-2026", 
    status: "Rented",
    imageUrl: "https://images.unsplash.com/photo-1695662057396-4190e2fe7f07?auto=format&fit=crop&q=80&w=600"
  },
  { 
    id: 5, 
    name: "Ford Mustang GT V8", 
    type: "Luxury", 
    fuelType: "Petrol", 
    pricePerDay: 15000, 
    vehicleNumber: "BR-01-GT-5000", 
    status: "Available",
    imageUrl: "https://images.unsplash.com/photo-1611245555447-4c18227ece35?auto=format&fit=crop&q=80&w=600"
  }
];

// Dummy Live Rentals Database Grid
const initialBookingsLedger = [
  {
    id: "B-9901",
    customerName: "Pawan Gupta",
    vehicleName: "Mahindra Thar Roxx",
    vehicleNumber: "BR-01-TH-2026",
    duration: "01 July to 05 July (2026)",
    driverAllocated: "Kundan Bhai",
    driverPhone: "+91 9988776655",
    status: "Active Leased"
  }
];

const OwnerDashboard = () => {
  const [fleet, setFleet] = useState(initialOwnerFleet);
  const [bookings] = useState(initialBookingsLedger);

  // Add Vehicle Form States (With imageUrl Block)
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    type: 'SUV',
    fuelType: 'Petrol',
    pricePerDay: '',
    vehicleNumber: '',
    imageUrl: '' // Dynamic Image URL Link State
  });

  const handleInputChange = (e) => {
    setNewVehicle({ ...newVehicle, [e.target.name]: e.target.value });
  };

  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (!newVehicle.name || !newVehicle.pricePerDay || !newVehicle.vehicleNumber) {
      toast.error("SYSTEM_ERROR: Fill required parameter blocks!");
      return;
    }

    // Default Fallback Image agar user URL na dale toh
    const finalImageUrl = newVehicle.imageUrl.trim() || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600";

    const createdNode = {
      id: Date.now(), // Unique ID generation
      ...newVehicle,
      pricePerDay: parseInt(newVehicle.pricePerDay),
      imageUrl: finalImageUrl,
      status: 'Available'
    };

    setFleet([...fleet, createdNode]);
    toast.success(`FLEET_MUTATION: ${newVehicle.name} deployed with graphics network node!`);
    
    // Reset form states completely
    setNewVehicle({ name: '', type: 'SUV', fuelType: 'Petrol', pricePerDay: '', vehicleNumber: '', imageUrl: '' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-10">
      
      {/* Header Panel */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            FLEET CONTROL TERMINAL
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-mono">Manage active deployments, list inventory nodes, track assignments.</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono text-xs px-4 py-2 rounded-xl">
          ROLE: VEHICLE_OWNER_NODE
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Dynamic Add Vehicle Form with Photo Field */}
        <div className="lg:col-span-1 bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-6 h-fit space-y-6">
          <h2 className="text-xl font-bold font-mono tracking-wide text-purple-400 border-b border-white/5 pb-2">
            ➕ REGISTER_NEW_VEHICLE
          </h2>
          
          <form onSubmit={handleAddVehicle} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Model Name</label>
              <input 
                type="text" name="name" required value={newVehicle.name} onChange={handleInputChange} placeholder="e.g., Fortuner Legender"
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-purple-400 font-mono focus:outline-none focus:border-purple-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Category</label>
                <select name="type" value={newVehicle.type} onChange={handleInputChange} className="w-full bg-slate-900 text-slate-300 border border-white/10 rounded-xl p-3 font-mono text-xs focus:outline-none">
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Fuel Core</label>
                <select name="fuelType" value={newVehicle.fuelType} onChange={handleInputChange} className="w-full bg-slate-900 text-slate-300 border border-white/10 rounded-xl p-3 font-mono text-xs focus:outline-none">
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">EV Node</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Rate / Day (INR)</label>
              <input 
                type="number" name="pricePerDay" required value={newVehicle.pricePerDay} onChange={handleInputChange} placeholder="₹ Cost Per 24h"
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-purple-400 font-mono focus:outline-none focus:border-purple-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Plate Registration Index</label>
              <input 
                type="text" name="vehicleNumber" required value={newVehicle.vehicleNumber} onChange={handleInputChange} placeholder="e.g., BR-01-XX-9999"
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-purple-400 font-mono focus:outline-none focus:border-purple-500 text-xs"
              />
            </div>

            {/* 📸 PHOTOGRAPH FIELD (YE RAHI PHOTO KI LINKS POPULATION MODULE) */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Vehicle Image Web Link (URL)</label>
              <input 
                type="url" name="imageUrl" value={newVehicle.imageUrl} onChange={handleInputChange} placeholder="https://example.com/car-photo.jpg"
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-cyan-400 font-mono focus:outline-none focus:border-cyan-500 text-xs"
              />
              <span className="text-[10px] text-slate-600 font-mono block mt-1">Leave empty for automatic default mesh generation.</span>
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 text-slate-950 font-extrabold py-3 rounded-xl font-mono text-xs tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]">
              DEPLOY_ASSET_NODE
            </button>
          </form>
        </div>

        {/* Right Side: Owner's Fleet Cards Grid Display with Photos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold font-mono tracking-wide text-cyan-400 border-b border-white/5 pb-2 mb-6">
              🎛️ CURRENT_OWNED_FLEET ({fleet.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {fleet.map((car) => (
                <div key={car.id} className="bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between group transition-all duration-300 hover:border-cyan-500/30">
                  {/* Photo Display Framework */}
                  <div className="w-full h-36 bg-slate-950 border-b border-white/5 relative">
                    <img src={car.imageUrl} alt={car.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                    <span className={`absolute top-2 right-2 text-[9px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider font-bold ${car.status === 'Available' ? 'border-green-500/30 bg-green-950/80 text-green-400' : 'border-amber-500/30 bg-amber-950/80 text-amber-400'}`}>
                      {car.status}
                    </span>
                  </div>
                  
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-200 text-base">{car.name}</h4>
                      <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono py-0.5 px-2 rounded">
                        {car.type}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-mono text-slate-500 border-t border-white/5 pt-2 uppercase">
                      <span>Index: {car.vehicleNumber}</span>
                      <span className="text-cyan-400 font-bold">₹{car.pricePerDay}/Day</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Full Width Bottom Layout: Customer Bookings Table */}
      <div className="max-w-7xl mx-auto bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold font-mono tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 border-b border-white/5 pb-3 mb-6">
          📋 LIVE_CONTRACT_DISPATCH_LEDGER (Real-Time Subscriptions)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px] bg-white/[0.01]">
                <th className="p-4">Contract ID</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Selected Vehicle</th>
                <th className="p-4">Lease Duration Segment</th>
                <th className="p-4">Dispatched Driver Node</th>
                <th className="p-4 text-center">Clearance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-cyan-400 font-bold">{b.id}</td>
                  <td className="p-4 text-slate-200 font-semibold">{b.customerName}</td>
                  <td className="p-4">
                    <span className="block text-slate-200">{b.vehicleName}</span>
                    <span className="text-[10px] text-slate-500">{b.vehicleNumber}</span>
                  </td>
                  <td className="p-4 text-slate-300">{b.duration}</td>
                  <td className="p-4">
                    <span className="block text-purple-400 font-bold">{b.driverAllocated}</span>
                    <span className="text-[10px] text-slate-500">{b.driverPhone}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${b.status === 'Active Leased' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default OwnerDashboard;