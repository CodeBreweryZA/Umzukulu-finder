const express = require('express');
const router = express.Router();
const {
    getVisits,
    createVisit,
    updateVisit,
    deleteVisit
} = require('../controllers/visitController');
const { protect } = require('../middleware/auth');

router.route('/')
    .get(protect, getVisits)
    .post(protect, createVisit);

router.route('/:id')
    .put(protect, updateVisit)
    .delete(protect, deleteVisit);

module.exports = router;