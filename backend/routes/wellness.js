const express = require('express');
const { body, validationResult } = require('express-validator');
const Wellness = require('../models/Wellness');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get wellness data
// @route   GET /api/wellness
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    const query = { userId: req.user._id };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { date: -1 }
    };

    const wellnessData = await Wellness.find(query)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);

    const total = await Wellness.countDocuments(query);

    res.json({
      success: true,
      data: {
        wellnessData,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit)
        }
      }
    });

  } catch (error) {
    console.error('Get wellness data error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while fetching wellness data' }
    });
  }
});

// @desc    Get wellness data by date
// @route   GET /api/wellness/date/:date
// @access  Private
router.get('/date/:date', protect, async (req, res) => {
  try {
    const { date } = req.params;
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const wellnessData = await Wellness.findOne({
      userId: req.user._id,
      date: {
        $gte: targetDate,
        $lt: nextDate
      }
    });

    if (!wellnessData) {
      return res.status(404).json({
        success: false,
        error: { message: 'No wellness data found for this date' }
      });
    }

    res.json({
      success: true,
      data: { wellnessData }
    });

  } catch (error) {
    console.error('Get wellness by date error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while fetching wellness data' }
    });
  }
});

// @desc    Create wellness entry
// @route   POST /api/wellness
// @access  Private
router.post('/', protect, [
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('sleepData.totalSleepHours')
    .optional()
    .isFloat({ min: 0, max: 24 })
    .withMessage('Sleep hours must be between 0 and 24'),
  body('sleepData.sleepQuality')
    .optional()
    .isIn(['poor', 'fair', 'good', 'excellent'])
    .withMessage('Invalid sleep quality'),
  body('mood.score')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Mood score must be between 1 and 10'),
  body('activityMetrics.steps')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Steps must be a positive integer'),
  body('nutrition.waterIntake')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Water intake must be a positive integer')
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

    const wellnessData = {
      ...req.body,
      userId: req.user._id,
      date: req.body.date || new Date()
    };

    // Check if entry already exists for this date
    const existingEntry = await Wellness.findOne({
      userId: req.user._id,
      date: {
        $gte: new Date(wellnessData.date).setHours(0, 0, 0, 0),
        $lt: new Date(new Date(wellnessData.date).setDate(new Date(wellnessData.date).getDate() + 1))
      }
    });

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        error: { message: 'Wellness entry already exists for this date' }
      });
    }

    const wellness = await Wellness.create(wellnessData);

    res.status(201).json({
      success: true,
      data: { wellness },
      message: 'Wellness entry created successfully'
    });

  } catch (error) {
    console.error('Create wellness error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while creating wellness entry' }
    });
  }
});

// @desc    Update wellness entry
// @route   PUT /api/wellness/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const wellness = await Wellness.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!wellness) {
      return res.status(404).json({
        success: false,
        error: { message: 'Wellness entry not found' }
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'userId' && key !== '_id') {
        wellness[key] = req.body[key];
      }
    });

    await wellness.save();

    res.json({
      success: true,
      data: { wellness },
      message: 'Wellness entry updated successfully'
    });

  } catch (error) {
    console.error('Update wellness error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while updating wellness entry' }
    });
  }
});

// @desc    Add medication
// @route   POST /api/wellness/:id/medication
// @access  Private
router.post('/:id/medication', protect, [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Medication name is required'),
  body('dosage')
    .trim()
    .notEmpty()
    .withMessage('Dosage is required'),
  body('time')
    .optional()
    .isISO8601()
    .withMessage('Time must be a valid ISO 8601 date'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
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

    const wellness = await Wellness.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!wellness) {
      return res.status(404).json({
        success: false,
        error: { message: 'Wellness entry not found' }
      });
    }

    await wellness.addMedication(req.body);

    res.json({
      success: true,
      data: { wellness },
      message: 'Medication added successfully'
    });

  } catch (error) {
    console.error('Add medication error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while adding medication' }
    });
  }
});

// @desc    Mark medication as taken
// @route   PUT /api/wellness/:id/medication/:medicationId
// @access  Private
router.put('/:id/medication/:medicationId', protect, async (req, res) => {
  try {
    const wellness = await Wellness.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!wellness) {
      return res.status(404).json({
        success: false,
        error: { message: 'Wellness entry not found' }
      });
    }

    await wellness.markMedicationTaken(req.params.medicationId);

    res.json({
      success: true,
      data: { wellness },
      message: 'Medication marked as taken'
    });

  } catch (error) {
    console.error('Mark medication error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while marking medication' }
    });
  }
});

// @desc    Add symptom
// @route   POST /api/wellness/:id/symptoms
// @access  Private
router.post('/:id/symptoms', protect, [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Symptom name is required'),
  body('severity')
    .isIn(['mild', 'moderate', 'severe'])
    .withMessage('Invalid severity level'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
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

    const wellness = await Wellness.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!wellness) {
      return res.status(404).json({
        success: false,
        error: { message: 'Wellness entry not found' }
      });
    }

    await wellness.addSymptom(req.body);

    res.json({
      success: true,
      data: { wellness },
      message: 'Symptom added successfully'
    });

  } catch (error) {
    console.error('Add symptom error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while adding symptom' }
    });
  }
});

// @desc    Resolve symptom
// @route   PUT /api/wellness/:id/symptoms/:symptomId
// @access  Private
router.put('/:id/symptoms/:symptomId', protect, async (req, res) => {
  try {
    const wellness = await Wellness.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!wellness) {
      return res.status(404).json({
        success: false,
        error: { message: 'Wellness entry not found' }
      });
    }

    await wellness.resolveSymptom(req.params.symptomId);

    res.json({
      success: true,
      data: { wellness },
      message: 'Symptom resolved successfully'
    });

  } catch (error) {
    console.error('Resolve symptom error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while resolving symptom' }
    });
  }
});

// @desc    Get wellness trends
// @route   GET /api/wellness/trends
// @access  Private
router.get('/trends', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const trends = await Wellness.getWellnessTrends(req.user._id, parseInt(days));

    res.json({
      success: true,
      data: { trends }
    });

  } catch (error) {
    console.error('Get wellness trends error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while fetching wellness trends' }
    });
  }
});

// @desc    Get wellness statistics
// @route   GET /api/wellness/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await Wellness.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          avgWellnessScore: { $avg: '$wellnessScore.overall' },
          avgSleepHours: { $avg: '$sleepData.totalSleepHours' },
          avgSteps: { $avg: '$activityMetrics.steps' },
          avgMoodScore: { $avg: '$mood.score' },
          totalMedications: { $sum: { $size: '$medication' } },
          takenMedications: {
            $sum: {
              $size: {
                $filter: {
                  input: '$medication',
                  cond: { $eq: ['$$this.taken', true] }
                }
              }
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        stats: stats[0] || {
          avgWellnessScore: 0,
          avgSleepHours: 0,
          avgSteps: 0,
          avgMoodScore: 0,
          totalMedications: 0,
          takenMedications: 0
        },
        timeRange: {
          start: startDate,
          end: new Date(),
          days: parseInt(days)
        }
      }
    });

  } catch (error) {
    console.error('Get wellness stats error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while fetching wellness statistics' }
    });
  }
});

module.exports = router;
