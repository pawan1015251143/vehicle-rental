import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Redux se user nikalne ke liye
import axios from 'axios';
import toast from 'react-hot-toast';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 🔑 Redux state se log-in user ka details nikal rahe hain
  const { user } = useSelector((state) => state.auth);

  const [vehicle, setVehicle] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalDays, setTotalDays] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);

  // 🔄 Database se specific vehicle fetch karna
  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/vehicles/${id}`);
        if (res.data && res.data.vehicle) {
          setVehicle(res.data.vehicle);
        }
      } catch (err) {
        console.error("Database fetch failed, loading static fallback mode.");
        // Static boundary guard just in case backend is loading
      }
    };
    fetchVehicleDetails();
  }, [id]);

  // 📅 Days Calculator Logic
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const differenceInTime = end.getTime() - start.getTime();
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
      setTotalDays(differenceInDays > 0 ? differenceInDays : 0);
    }
  }, [startDate, endDate]);

  if (!vehicle) return <div className="text-cyan-400 text-center mt-20 font-mono">LOADING_VEHICLE_MATRIX...</div>;

  const baseCost = totalDays * vehicle.pricePerDay;
  const secureTax = totalDays > 0 ? 450 : 0;
  const totalCost = baseCost + secureTax;

  // 🚀 HARDCORE MYSQL POST SUBMIT HANDLER
  const handleExecuteContract = async (e) => {
    e.preventDefault();
    if (totalDays <= 0) {
      toast.error("Invalid dynamic date parameters!");
      return;
    }

    setBookingLoading(true);

    const bookingPayload = {
      customerName: user?.name || "Walk-in Customer",
      customerEmail: user?.email || "customer@cyberfleet.in",
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      vehicleNumber: vehicle.vehicleNumber,
      startDate: startDate,
      endDate: endDate,
      totalDays: totalDays,
      totalCost: totalCost,
      driverAllocated: "Kundan Bhai", // Testing placeholder driver assignment
      driverPhone: "+91 9988776655"
    };

    try {
      // 📡 Seedhe data MySQL API routing block par hit karega
      const res = await axios.post('http://localhost:5000/api/bookings/add', bookingPayload);
      if (res.data.success) {
        toast.success("💥 DATA_LOCKED: Booking saved permanently to MySQL!");
        navigate('/bookings');
      }
    } catch (err) {
      console.error(err);
      toast.error("DATABASE_WRITE_REJECTION: Check backend pool status.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex items-center justify-center">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/[0.02] backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
        
        {/* Left Side: Spec Sheet */}
        <div className="flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-mono px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-full uppercase tracking-wider">{vehicle.type} Matrix</span>
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mt-3">{vehicle.name}</h2>
            <p className="text-xs font-mono text-slate-500 mt-1">PLATE_INDEX: {vehicle.vehicleNumber}</p>
          </div>
          <div className="w-full h-64 rounded-xl overflow-hidden border border-white/10 bg-slate-900">
            <img src={vehicle.imageUrl} alt={vehicle.name} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-white/[0.01] border border-white/5 p-4 rounded-xl">
            <div>⛽ Fuel: <span className="text-cyan-400 font-bold">{vehicle.fuelType}</span></div>
            <div>💰 Index: <span className="text-cyan-400 font-bold">₹{vehicle.pricePerDay}/day</span></div>
          </div>
        </div>

        {/* Right Side: Ledger Form */}
        <div className="border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8 flex flex-col justify-between">
          <form onSubmit={handleExecuteContract} className="space-y-4">
            <h3 className="text-xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">EXECUTE_DB_RESERVATION</h3>
            
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Pick Date</label>
              <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-cyan-400 font-mono" />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Drop Date</label>
              <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-cyan-400 font-mono" />
            </div>

            {totalDays > 0 && (
              <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4 space-y-2 font-mono text-xs">
                <div className="text-cyan-400 font-bold border-b border-cyan-500/20 pb-1">LIVE SQL INVOICE META</div>
                <div className="flex justify-between"><span>Duration Segment:</span> <span>{totalDays} Days</span></div>
                <div className="flex justify-between"><span>Base Amount:</span> <span>₹{baseCost}</span></div>
                <div className="flex justify-between font-bold text-cyan-400 pt-2 border-t border-dashed border-white/10"><span>TOTAL CHARGE:</span> <span>₹{totalCost}</span></div>
              </div>
            )}

            <button type="submit" disabled={bookingLoading || totalDays <= 0} className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-extrabold py-3.5 rounded-xl font-mono text-xs tracking-widest uppercase">
              {bookingLoading ? 'SYNCING TO DATABASE...' : 'LOCK DATABASE CONTRACT'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default VehicleDetails;