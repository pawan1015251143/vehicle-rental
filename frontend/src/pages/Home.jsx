import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleNavigation = (role) => {
    if (role === 'customer') {
      navigate('/vehicles');
    } else {
      // ओनर या ड्राइवर के लिए रोल को क्वेरी पैरामीटर में भेजेंगे ताकि रजिस्टर पेज उसे पहचान सके
      navigate(`/register?role=${role}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans relative overflow-hidden flex flex-col justify-center items-center py-16">
      
      {/* 🌌 बैकग्राउंड नियॉन ग्लो इफेक्ट्स */}
      <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[15%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* 🚀 हीरो सेक्शन */}
      <div className="text-center max-w-3xl mx-auto px-6 mb-16 z-10 relative">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
          Drive. Earn. Connect.
        </h1>
        <p className="text-lg md:text-xl text-gray-400 font-light leading-relaxed">
          पटना का सबसे आधुनिक व्हीकल रेंटल प्लेटफॉर्म। चाहे गाड़ी किराए पर चाहिए, अपनी गाड़ी से कमाना हो, या बतौर ड्राइवर जुड़ना हो—सब कुछ एक ही जगह।
        </p>
      </div>

      {/* 🎴 ग्लासमोर्फिक ऐक्शन कार्ड्स (Role-based Flow) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 max-w-6xl w-full mx-auto z-10 relative">
        
        {/* कार्ड 1: कस्टमर (Book Vehicle) */}
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 p-8 rounded-2xl shadow-2xl hover:border-cyan-500/40 transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-6 text-cyan-400 font-bold text-xl">
              🚗
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Need a Ride?</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              शानदार कार्स और बाइक्स बुक करें सबसे किफायती दामों पर। बिना किसी हिडन चार्ज के आसान और सुरक्षित बुकिंग।
            </p>
          </div>
          <button 
            onClick={() => handleNavigation('customer')}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black font-semibold text-sm tracking-wide shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300"
          >
            Find Vehicles
          </button>
        </div>

        {/* कार्ड 2: ओनर (Apply as Vehicle Owner) */}
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 p-8 rounded-2xl shadow-2xl hover:border-purple-500/40 transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-6 text-purple-400 font-bold text-xl">
              💰
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Rent Your Vehicle</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              अपनी खाली खड़ी कार या बाइक को कमाई का जरिया बनाएं। हमारे साथ जुड़ें और घर बैठे हर महीने बेहतरीन रेंटल इनकम पाएं।
            </p>
          </div>
          <button 
            onClick={() => handleNavigation('owner')}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm tracking-wide shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all duration-300"
          >
            Apply as Owner
          </button>
        </div>

        {/* कार्ड 3: ड्राइवर (Apply as Driver) */}
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 p-8 rounded-2xl shadow-2xl hover:border-emerald-500/40 transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 text-emerald-400 font-bold text-xl">
              🔑
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Join as Driver</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              ड्राइविंग कम्युनिटी का हिस्सा बनें। अपनी मर्जी के वर्किंग आवर्स चुनें, बेहतरीन राइड्स स्वीकार करें और हर हफ्ते सीधा पेमेंट पाएं।
            </p>
          </div>
          <button 
            onClick={() => handleNavigation('driver')}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-sm tracking-wide shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-300"
          >
            Apply as Driver
          </button>
        </div>

      </div>
    </div>
  );
};

export default Home;