const Service = require('../models/Service');
const Memorial = require('../models/Memorial');

// @desc    Get all services for a user
// @route   GET /api/services
// @access  Private
exports.getServices = async (req, res) => {
    try {
        const services = await Service.find({ user: req.user.id })
            .populate('memorial', 'name surname location')
            .sort({ scheduleDate: 1 });

        res.status(200).json({
            success: true,
            count: services.length,
            data: services
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private
exports.createService = async (req, res) => {
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

        const service = await Service.create(req.body);

        res.status(201).json({
            success: true,
            data: service
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private
exports.updateService = async (req, res) => {
    try {
        let service = await Service.findById(req.params.id).populate('memorial');

        if (!service) {
            return res.status(404).json({
                success: false,
                error: 'Service not found'
            });
        }

        // Make sure user owns the service
        if (service.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized'
            });
        }

        service = await Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: service
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                error: 'Service not found'
            });
        }

        // Make sure user owns the service
        if (service.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized'
            });
        }

        await service.deleteOne();

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

// @desc    Get services by status
// @route   GET /api/services/status/:status
// @access  Private
exports.getServicesByStatus = async (req, res) => {
    try {
        const services = await Service.find({
            user: req.user.id,
            status: req.params.status
        })
        .populate('memorial', 'name surname location')
        .sort({ scheduleDate: 1 });

        res.status(200).json({
            success: true,
            count: services.length,
            data: services
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};