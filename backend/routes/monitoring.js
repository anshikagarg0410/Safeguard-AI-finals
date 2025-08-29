const express = require('express');
const { body, validationResult } = require('express-validator');
const Monitoring = require('../models/Monitoring');
const Alert = require('../models/Alert');
const Contact = require('../models/Contact');
const smsService = require('../services/smsService');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Start monitoring session
// @route   POST /api/monitoring/start
// @access  Private
router.post('/start', protect, [
  body('deviceInfo.deviceId')
    .notEmpty()
    .withMessage('Device ID is required'),
  body('deviceInfo.deviceType')
    .notEmpty()
    .withMessage('Device type is required'),
  body('deviceInfo.location')
    .optional()
    .isString()
    .withMessage('Location must be a string'),
  body('aiAnalysis.confidence')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('AI confidence must be between 0 and 1')
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

    const { deviceInfo, aiAnalysis, privacySettings } = req.body;

    // Check if user already has an active session
    const existingSession = await Monitoring.findOne({
      userId: req.user._id,
      status: 'active'
    });

    if (existingSession) {
      return res.status(400).json({
        success: false,
        error: { message: 'User already has an active monitoring session' }
      });
    }

    // Generate unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create monitoring session
    const monitoring = await Monitoring.create({
      userId: req.user._id,
      sessionId,
      deviceInfo: {
        ...deviceInfo,
        ipAddress: req.ip
      },
      aiAnalysis: {
        ...aiAnalysis,
        lastUpdate: new Date()
      },
      privacySettings: privacySettings || {}
    });

    res.status(201).json({
      success: true,
      data: {
        monitoring: monitoring,
        sessionId: monitoring.sessionId
      },
      message: 'Monitoring session started successfully'
    });

  } catch (error) {
    console.error('Start monitoring error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while starting monitoring session' }
    });
  }
});

// @desc    Stop monitoring session
// @route   PUT /api/monitoring/stop/:sessionId
// @access  Private
router.put('/stop/:sessionId', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const monitoring = await Monitoring.findOne({
      sessionId,
      userId: req.user._id
    });

    if (!monitoring) {
      return res.status(404).json({
        success: false,
        error: { message: 'Monitoring session not found' }
      });
    }

    if (monitoring.status === 'stopped') {
      return res.status(400).json({
        success: false,
        error: { message: 'Monitoring session is already stopped' }
      });
    }

    monitoring.status = 'stopped';
    monitoring.endTime = new Date();
    await monitoring.save();

    res.json({
      success: true,
      data: { monitoring },
      message: 'Monitoring session stopped successfully'
    });

  } catch (error) {
    console.error('Stop monitoring error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while stopping monitoring session' }
    });
  }
});

// @desc    Pause monitoring session
// @route   PUT /api/monitoring/pause/:sessionId
// @access  Private
router.put('/pause/:sessionId', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const monitoring = await Monitoring.findOne({
      sessionId,
      userId: req.user._id
    });

    if (!monitoring) {
      return res.status(404).json({
        success: false,
        error: { message: 'Monitoring session not found' }
      });
    }

    if (monitoring.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: { message: 'Only active sessions can be paused' }
      });
    }

    monitoring.status = 'paused';
    await monitoring.save();

    res.json({
      success: true,
      data: { monitoring },
      message: 'Monitoring session paused successfully'
    });

  } catch (error) {
    console.error('Pause monitoring error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while pausing monitoring session' }
    });
  }
});

// @desc    Resume monitoring session
// @route   PUT /api/monitoring/resume/:sessionId
// @access  Private
router.put('/resume/:sessionId', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const monitoring = await Monitoring.findOne({
      sessionId,
      userId: req.user._id
    });

    if (!monitoring) {
      return res.status(404).json({
        success: false,
        error: { message: 'Monitoring session not found' }
      });
    }

    if (monitoring.status !== 'paused') {
      return res.status(400).json({
        success: false,
        error: { message: 'Only paused sessions can be resumed' }
      });
    }

    monitoring.status = 'active';
    await monitoring.save();

    res.json({
      success: true,
      data: { monitoring },
      message: 'Monitoring session resumed successfully'
    });

  } catch (error) {
    console.error('Resume monitoring error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while resuming monitoring session' }
    });
  }
});

// @desc    Add activity data
// @route   POST /api/monitoring/:sessionId/activity
// @access  Private
router.post('/:sessionId/activity', protect, [
  body('activityType')
    .isIn(['sleep', 'walk', 'sit', 'stand', 'fall', 'inactivity', 'unknown'])
    .withMessage('Invalid activity type'),
  body('confidence')
    .isFloat({ min: 0, max: 1 })
    .withMessage('Confidence must be between 0 and 1'),
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a positive integer'),
  body('location')
    .optional()
    .isString()
    .withMessage('Location must be a string'),
  body('riskLevel')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid risk level')
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

    const { sessionId } = req.params;
    const activityData = req.body;

    const monitoring = await Monitoring.findOne({
      sessionId,
      userId: req.user._id
    });

    if (!monitoring) {
      return res.status(404).json({
        success: false,
        error: { message: 'Monitoring session not found' }
      });
    }

    if (monitoring.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot add activity to inactive session' }
      });
    }

    // Add activity to monitoring session
    await monitoring.addActivity(activityData);

    // Check if activity requires alert
    if (activityData.riskLevel === 'high' || activityData.riskLevel === 'critical') {
      const alert = await Alert.create({
        userId: req.user._id,
        monitoringSessionId: monitoring._id,
        alertType: activityData.activityType === 'fall' ? 'fall' : 'medical',
        severity: activityData.riskLevel,
        title: `${activityData.activityType.charAt(0).toUpperCase() + activityData.activityType.slice(1)} detected`,
        description: `High-risk activity detected: ${activityData.activityType} with ${Math.round(activityData.confidence * 100)}% confidence`,
        location: activityData.location,
        metadata: {
          activityType: activityData.activityType,
          confidence: activityData.confidence,
          duration: activityData.duration,
          riskFactors: [activityData.activityType]
        }
      });

      // Notify available contacts for this alert type
      try {
        const contacts = await Contact.getAvailableContactsForAlert(
          req.user._id,
          alert.alertType,
          new Date()
        );

        for (const contact of contacts) {
          if (contact.notificationPreferences.email.enabled) {
            await alert.addNotification(contact._id, 'email');
          }
          if (contact.notificationPreferences.sms.enabled) {
            await alert.addNotification(contact._id, 'sms');
            smsService
              .sendAlertSMS(contact.phone, alert)
              .then(() => alert.updateNotificationStatus(contact._id, 'sent', 'SMS sent'))
              .catch((err) => alert.updateNotificationStatus(contact._id, 'failed', err?.message || 'SMS failed'));
          }
          if (contact.notificationPreferences.push.enabled) {
            await alert.addNotification(contact._id, 'push');
          }
        }
      } catch (notifyErr) {
        console.error('Notification error for monitoring alert:', notifyErr);
      }

      // Add alert to monitoring session
      monitoring.alerts.push({
        alertId: alert._id,
        timestamp: new Date(),
        severity: activityData.riskLevel,
        resolved: false
      });
      await monitoring.save();
    }

    res.json({
      success: true,
      data: { monitoring },
      message: 'Activity data added successfully'
    });

  } catch (error) {
    console.error('Add activity error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while adding activity data' }
    });
  }
});

// @desc    Get monitoring session
// @route   GET /api/monitoring/:sessionId
// @access  Private
router.get('/:sessionId', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const monitoring = await Monitoring.findOne({
      sessionId,
      userId: req.user._id
    }).populate('alerts.alertId');

    if (!monitoring) {
      return res.status(404).json({
        success: false,
        error: { message: 'Monitoring session not found' }
      });
    }

    res.json({
      success: true,
      data: { monitoring }
    });

  } catch (error) {
    console.error('Get monitoring error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while fetching monitoring session' }
    });
  }
});

// @desc    Get user's monitoring sessions
// @route   GET /api/monitoring
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;

    const query = { userId: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { startTime: -1 }
    };

    const sessions = await Monitoring.find(query)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit)
      .populate('alerts.alertId');

    const total = await Monitoring.countDocuments(query);

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit)
        }
      }
    });

  } catch (error) {
    console.error('Get monitoring sessions error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while fetching monitoring sessions' }
    });
  }
});

// @desc    Get monitoring statistics
// @route   GET /api/monitoring/stats/overview
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await Monitoring.aggregate([
      {
        $match: {
          userId: req.user._id,
          startTime: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalDuration: { $sum: { $subtract: ['$endTime', '$startTime'] } },
          avgSessionDuration: { $avg: { $subtract: ['$endTime', '$startTime'] } },
          activeSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalActivities: { $sum: { $size: '$activities' } },
          highRiskActivities: {
            $sum: {
              $size: {
                $filter: {
                  input: '$activities',
                  cond: { $in: ['$$this.riskLevel', ['high', 'critical']] }
                }
              }
            }
          }
        }
      }
    ]);

    const activityBreakdown = await Monitoring.aggregate([
      {
        $match: {
          userId: req.user._id,
          startTime: { $gte: startDate }
        }
      },
      {
        $unwind: '$activities'
      },
      {
        $group: {
          _id: '$activities.activityType',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$activities.confidence' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalSessions: 0,
          totalDuration: 0,
          avgSessionDuration: 0,
          activeSessions: 0,
          totalActivities: 0,
          highRiskActivities: 0
        },
        activityBreakdown,
        timeRange: {
          start: startDate,
          end: new Date(),
          days: parseInt(days)
        }
      }
    });

  } catch (error) {
    console.error('Get monitoring stats error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while fetching monitoring statistics' }
    });
  }
});

// @desc    Update AI analysis settings
// @route   PUT /api/monitoring/:sessionId/ai-settings
// @access  Private
router.put('/:sessionId/ai-settings', protect, [
  body('confidence')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('AI confidence must be between 0 and 1'),
  body('isEnabled')
    .optional()
    .isBoolean()
    .withMessage('isEnabled must be a boolean')
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

    const { sessionId } = req.params;
    const { confidence, isEnabled } = req.body;

    const monitoring = await Monitoring.findOne({
      sessionId,
      userId: req.user._id
    });

    if (!monitoring) {
      return res.status(404).json({
        success: false,
        error: { message: 'Monitoring session not found' }
      });
    }

    if (confidence !== undefined) {
      monitoring.aiAnalysis.confidence = confidence;
    }
    
    if (isEnabled !== undefined) {
      monitoring.aiAnalysis.isEnabled = isEnabled;
    }

    monitoring.aiAnalysis.lastUpdate = new Date();
    await monitoring.save();

    res.json({
      success: true,
      data: { monitoring },
      message: 'AI settings updated successfully'
    });

  } catch (error) {
    console.error('Update AI settings error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while updating AI settings' }
    });
  }
});

// @desc    Update privacy settings
// @route   PUT /api/monitoring/:sessionId/privacy
// @access  Private
router.put('/:sessionId/privacy', protect, [
  body('videoRecording')
    .optional()
    .isBoolean()
    .withMessage('videoRecording must be a boolean'),
  body('dataRetention')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Data retention must be between 1 and 365 days'),
  body('anonymization')
    .optional()
    .isBoolean()
    .withMessage('anonymization must be a boolean')
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

    const { sessionId } = req.params;
    const { videoRecording, dataRetention, anonymization } = req.body;

    const monitoring = await Monitoring.findOne({
      sessionId,
      userId: req.user._id
    });

    if (!monitoring) {
      return res.status(404).json({
        success: false,
        error: { message: 'Monitoring session not found' }
      });
    }

    if (videoRecording !== undefined) {
      monitoring.privacySettings.videoRecording = videoRecording;
    }
    
    if (dataRetention !== undefined) {
      monitoring.privacySettings.dataRetention = dataRetention;
    }
    
    if (anonymization !== undefined) {
      monitoring.privacySettings.anonymization = anonymization;
    }

    await monitoring.save();

    res.json({
      success: true,
      data: { monitoring },
      message: 'Privacy settings updated successfully'
    });

  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while updating privacy settings' }
    });
  }
});

// @desc    Get active monitoring sessions (Admin only)
// @route   GET /api/monitoring/admin/active
// @access  Private, Admin only
router.get('/admin/active', protect, authorize('admin'), async (req, res) => {
  try {
    const activeSessions = await Monitoring.getActiveSessions();

    res.json({
      success: true,
      data: { activeSessions }
    });

  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while fetching active sessions' }
    });
  }
});

module.exports = router;
