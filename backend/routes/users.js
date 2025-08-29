const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private, Admin only
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, isActive, search } = req.query;

    const query = {};
    
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };

    const users = await User.find(query)
      .select('-password')
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit)
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while fetching users' }
    });
  }
});

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private, Admin only
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while fetching user' }
    });
  }
});

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private, Admin only
router.put('/:id', protect, authorize('admin'), [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(['admin', 'family_member', 'caregiver', 'emergency_contact'])
    .withMessage('Invalid role'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { firstName, lastName, email, phone, role, isActive } = req.body;
    const updateFields = {};

    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;
    if (role) updateFields.role = role;
    if (isActive !== undefined) updateFields.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    res.json({
      success: true,
      data: { user },
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while updating user' }
    });
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private, Admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot delete your own account' }
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while deleting user' }
    });
  }
});

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
router.put('/preferences', protect, [
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be a boolean'),
  body('notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('SMS notifications must be a boolean'),
  body('notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notifications must be a boolean'),
  body('privacy.shareLocation')
    .optional()
    .isBoolean()
    .withMessage('Share location must be a boolean'),
  body('privacy.shareHealthData')
    .optional()
    .isBoolean()
    .withMessage('Share health data must be a boolean'),
  body('monitoring.enableVideoMonitoring')
    .optional()
    .isBoolean()
    .withMessage('Enable video monitoring must be a boolean'),
  body('monitoring.enableActivityTracking')
    .optional()
    .isBoolean()
    .withMessage('Enable activity tracking must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { notifications, privacy, monitoring } = req.body;
    const updateFields = {};

    if (notifications) updateFields['preferences.notifications'] = notifications;
    if (privacy) updateFields['preferences.privacy'] = privacy;
    if (monitoring) updateFields['preferences.monitoring'] = monitoring;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: { user },
      message: 'Preferences updated successfully'
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while updating preferences' }
    });
  }
});

// @desc    Update emergency contacts
// @route   PUT /api/users/emergency-contacts
// @access  Private
router.put('/emergency-contacts', protect, [
  body('emergencyContacts')
    .isArray()
    .withMessage('Emergency contacts must be an array'),
  body('emergencyContacts.*.name')
    .trim()
    .notEmpty()
    .withMessage('Contact name is required'),
  body('emergencyContacts.*.phone')
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  body('emergencyContacts.*.relationship')
    .trim()
    .notEmpty()
    .withMessage('Relationship is required'),
  body('emergencyContacts.*.isPrimary')
    .optional()
    .isBoolean()
    .withMessage('isPrimary must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { emergencyContacts } = req.body;

    // Ensure only one primary contact
    const primaryCount = emergencyContacts.filter(contact => contact.isPrimary).length;
    if (primaryCount > 1) {
      return res.status(400).json({
        success: false,
        error: { message: 'Only one emergency contact can be primary' }
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { emergencyContacts },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: { user },
      message: 'Emergency contacts updated successfully'
    });

  } catch (error) {
    console.error('Update emergency contacts error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while updating emergency contacts' }
    });
  }
});

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/stats
// @access  Private, Admin only
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          inactiveUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
          },
          verifiedUsers: {
            $sum: { $cond: [{ $eq: ['$emailVerified', true] }, 1, 0] }
          },
          unverifiedUsers: {
            $sum: { $cond: [{ $eq: ['$emailVerified', false] }, 1, 0] }
          }
        }
      }
    ]);

    const roleBreakdown = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const recentUsers = await User.find()
      .select('firstName lastName email role createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          verifiedUsers: 0,
          unverifiedUsers: 0
        },
        roleBreakdown,
        recentUsers
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while fetching user statistics' }
    });
  }
});

// @desc    Deactivate user (Admin only)
// @route   PUT /api/users/:id/deactivate
// @access  Private, Admin only
router.put('/:id/deactivate', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot deactivate your own account' }
      });
    }

    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while deactivating user' }
    });
  }
});

// @desc    Reactivate user (Admin only)
// @route   PUT /api/users/:id/reactivate
// @access  Private, Admin only
router.put('/:id/reactivate', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    user.isActive = true;
    await user.save();

    res.json({
      success: true,
      message: 'User reactivated successfully'
    });

  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while reactivating user' }
    });
  }
});

// @desc    Get user dashboard data
// @route   GET /api/users/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    // Get user's recent activity (you can expand this based on your needs)
    const dashboardData = {
      user: user.getPublicProfile(),
      summary: {
        totalContacts: user.emergencyContacts?.length || 0,
        primaryContacts: user.emergencyContacts?.filter(contact => contact.isPrimary).length || 0,
        lastLogin: user.lastLogin,
        accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24))
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while fetching dashboard data' }
    });
  }
});

module.exports = router;
