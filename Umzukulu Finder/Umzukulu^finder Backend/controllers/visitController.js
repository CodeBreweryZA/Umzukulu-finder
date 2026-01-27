const Visit = require('../models/Visit');
const Memorial = require('../models/Memorial');

// @desc    Get all visits for a user
// @route   GET /api/visits
// @access  Private
exports.getVisits = async (req, res) => {
    try {
        const visits = await Visit.find({ user: req.user.id })
            .populate('memorial', 'name surname location')
            .sort({ visitDate: -1 });

        res.status(200).json({
            success: true,
            count: visits.length,
            data: visits
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Create new visit
// @route   POST /api/visits
// @access  Private
exports.createVisit = async (req, res) => {
    try {
        // Add user to req.body
        req.body.user = req.user.id;

        // Verify memorial belongs to user
        const memorial = await Memorial.findOne({
            _id: req.body.memorial,
            user: req.user.id
        });

        if (!memorial) {
            return res.status(404).json({
                success: false,
                error: 'Memorial not found'
            });
        }

        const visit = await Visit.create(req.body);

        res.status(201).json({
            success: true,
            data: visit
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Update visit
// @route   PUT /api/visits/:id
// @access  Private
exports.updateVisit = async (req, res) => {
    try {
        let visit = await Visit.findById(req.params.id).populate('memorial');

        if (!visit) {
            return res.status(404).json({
                success: false,
                error: 'Visit not found'
            });
        }

        // Make sure user owns the visit
        if (visit.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized'
            });
        }

        visit = await Visit.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: visit
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Delete visit
// @route   DELETE /api/visits/:id
// @access  Private
exports.deleteVisit = async (req, res) => {
    try {
        const visit = await Visit.findById(req.params.id);

        if (!visit) {
            return res.status(404).json({
                success: false,
                error: 'Visit not found'
            });
        }

        // Make sure user owns the visit
        if (visit.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized'
            });
        }

        await visit.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};