const express = require('express');
const router = express.Router();
const {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getMyVehicles,
  updateVehicleApproval,
  getAllVehiclesAdmin,
} = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getVehicles);
router.get('/owner/me', protect, authorize('owner', 'admin'), getMyVehicles);
router.get('/admin/all', protect, authorize('admin'), getAllVehiclesAdmin);
router.get('/:id', getVehicleById);
router.post('/', protect, authorize('owner', 'admin'), upload.array('images', 5), createVehicle);
router.put('/:id', protect, authorize('owner', 'admin'), upload.array('images', 5), updateVehicle);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteVehicle);
router.put('/:id/approval', protect, authorize('admin'), updateVehicleApproval);

module.exports = router;
