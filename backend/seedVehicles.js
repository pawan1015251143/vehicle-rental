// backend/seedVehicles.js
const Vehicle = require('./models/Vehicle'); // Aapke model ka path

const seedVehicles = async () => {
  try {
    const cars = [
      {
        name: "Mahindra Thar Roxx",
        type: "SUV",
        fuelType: "Diesel",
        pricePerDay: 3500,
        vehicleNumber: "BR-01-TH-2026",
        imageUrl: "https://images.unsplash.com/photo-1695662057396-4190e2fe7f07?auto=format&fit=crop&q=80&w=600", // High-res Thar style SUV asset
        availability: true
      },
      {
        name: "Maruti Suzuki Grand Vitara",
        type: "SUV",
        fuelType: "Petrol (Hybrid)",
        pricePerDay: 2200,
        vehicleNumber: "BR-01-MS-8899",
        imageUrl: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=600",
        availability: true
      },
      {
        name: "Audi A6 Matrix",
        type: "Luxury",
        fuelType: "Petrol",
        pricePerDay: 9500,
        vehicleNumber: "BR-01-AU-4444",
        imageUrl: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=600",
        availability: true
      },
      {
        name: "Tesla Model S Cyber-Edition",
        type: "Luxury",
        fuelType: "Electric",
        pricePerDay: 12000,
        vehicleNumber: "BR-01-TS-7777",
        imageUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600",
        availability: true
      },
      {
        name: "Ford Mustang GT V8",
        type: "Luxury",
        fuelType: "Petrol",
        pricePerDay: 15000,
        vehicleNumber: "BR-01-GT-5000",
        imageUrl: "https://images.unsplash.com/photo-1611245555447-4c18227ece35?auto=format&fit=crop&q=80&w=600",
        availability: true
      },
      {
        name: "Mercedes-Benz S-Class 2026",
        type: "Luxury",
        fuelType: "Diesel",
        pricePerDay: 18000,
        vehicleNumber: "BR-01-MB-0001",
        imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=600",
        availability: true
      }
    ];

    await Vehicle.bulkCreate(cars);
    console.log("🚀 Custom Cyber Fleet inserted into MySQL Successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    process.exit(1);
  }
};

seedVehicles();