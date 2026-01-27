const Memorial = require('../models/Memorial');

// @desc    Get all memorials for a user
// @route   GET /api/memorials
// @access  Private
exports.getMemorials = async (req, res) => {
    try {
        const memorials = await Memorial.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: memorials.length,
            data: memorials
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Get single memorial
// @route   GET /api/memorials/:id
// @access  Private
exports.getMemorial = async (req, res) => {
    try {
        const memorial = await Memorial.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!memorial) {
            return res.status(404).json({
                success: false,
                error: 'Memorial not found'
            });
        }

        res.status(200).json({
            success: true,
            data: memorial
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Create new memorial
// @route   POST /api/memorials
// @access  Private
exports.createMemorial = async (req, res) => {
    try {
        // Add user to req.body
        req.body.user = req.user.id;

        const memorial = await Memorial.create(req.body);

        res.status(201).json({
            success: true,
            data: memorial
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Update memorial
// @route   PUT /api/memorials/:id
// @access  Private
exports.updateMemorial = async (req, res) => {
    try {
        let memorial = await Memorial.findById(req.params.id);

        if (!memorial) {
            return res.status(404).json({
                success: false,
                error: 'Memorial not found'
            });
        }

        // Make sure user owns the memorial
        if (memorial.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized'
            });
        }

        memorial = await Memorial.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: memorial
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Delete memorial
// @route   DELETE /api/memorials/:id
// @access  Private
exports.deleteMemorial = async (req, res) => {
    try {
        const memorial = await Memorial.findById(req.params.id);

        if (!memorial) {
            return res.status(404).json({
                success: false,
                error: 'Memorial not found'
            });
        }

        // Make sure user owns the memorial
        if (memorial.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized'
            });
        }

        await memorial.deleteOne();

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

// @desc    Search memorials
// @route   GET /api/memorials/search
// @access  Public (for searching without login)
exports.searchMemorials = async (req, res) => {
    try {
        const { name, surname, location } = req.query;
        
        let query = {};

        // Build search query
        if (name || surname) {
            query.$or = [];
            if (name) query.$or.push({ name: { $regex: name, $options: 'i' } });
            if (surname) query.$or.push({ surname: { $regex: surname, $options: 'i' } });
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        // Only return limited info for public search
        const memorials = await Memorial.find(query)
            .select('name surname dateOfPassing location coordinates')
            .limit(50);

        res.status(200).json({
            success: true,
            count: memorials.length,
            data: memorials
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};