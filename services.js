const express = require('express');
const router = express.Router();
const {
    getServices,
    createService,
    updateService,
    deleteService,
    getServicesByStatus
} = require('../controllers/serviceController');
const { protect } = require('../middleware/auth');

router.route('/')
    .get(protect, getServices)
    .post(protect, createService);

router.route('/:id')
    .put(protect, updateService)
    .delete(protect, deleteService);

router.get('/status/:status', protect, getServicesByStatus);

module.exports = router;