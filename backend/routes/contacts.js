const express = require('express');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user's contacts
// @route   GET /api/contacts
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, contactType, search } = req.query;

    let query = { userId: req.user._id };
    
    if (contactType) {
      query.contactType = contactType;
    }

    let contacts;
    let total;

    if (search) {
      contacts = await Contact.searchContacts(req.user._id, search);
      total = contacts.length;
    } else {
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { isPrimary: -1, firstName: 1, lastName: 1 }
      };

      contacts = await Contact.find(query)
        .sort(options.sort)
        .limit(options.limit)
        .skip((options.page - 1) * options.limit);

      total = await Contact.countDocuments(query);
    }

    res.json({
      success: true,
      data: {
        contacts,
        pagination: search ? null : {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while fetching contacts' }
    });
  }
});

// @desc    Get contact by ID
// @route   GET /api/contacts/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: { message: 'Contact not found' }
      });
    }

    res.json({
      success: true,
      data: { contact }
    });

  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while fetching contact' }
    });
  }
});

// @desc    Create new contact
// @route   POST /api/contacts
// @access  Private
router.post('/', protect, [
  body('contactType')
    .isIn(['family_member', 'caregiver', 'emergency_contact', 'healthcare_provider', 'neighbor'])
    .withMessage('Invalid contact type'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('relationship')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Relationship must be between 1 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  body('isPrimary')
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

    const contactData = {
      ...req.body,
      userId: req.user._id
    };

    const contact = await Contact.create(contactData);

    res.status(201).json({
      success: true,
      data: { contact },
      message: 'Contact created successfully'
    });

  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while creating contact' }
    });
  }
});

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
router.put('/:id', protect, [
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
  body('relationship')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Relationship must be between 1 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number')
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

    const { firstName, lastName, relationship, email, phone, address, coordinates } = req.body;
    const updateFields = {};

    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (relationship) updateFields.relationship = relationship;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;
    if (coordinates) updateFields.coordinates = coordinates;

    const contact = await Contact.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id
      },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: { message: 'Contact not found' }
      });
    }

    res.json({
      success: true,
      data: { contact },
      message: 'Contact updated successfully'
    });

  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while updating contact' }
    });
  }
});

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: { message: 'Contact not found' }
      });
    }

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });

  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while deleting contact' }
    });
  }
});

// @desc    Update notification preferences
// @route   PUT /api/contacts/:id/notifications
// @access  Private
router.put('/:id/notifications', protect, [
  body('notifications.email.enabled')
    .optional()
    .isBoolean()
    .withMessage('Email enabled must be a boolean'),
  body('notifications.email.frequency')
    .optional()
    .isIn(['immediate', 'hourly', 'daily', 'weekly'])
    .withMessage('Invalid email frequency'),
  body('notifications.sms.enabled')
    .optional()
    .isBoolean()
    .withMessage('SMS enabled must be a boolean'),
  body('notifications.sms.frequency')
    .optional()
    .isIn(['immediate', 'hourly', 'daily', 'weekly'])
    .withMessage('Invalid SMS frequency'),
  body('notifications.push.enabled')
    .optional()
    .isBoolean()
    .withMessage('Push enabled must be a boolean'),
  body('notifications.push.frequency')
    .optional()
    .isIn(['immediate', 'hourly', 'daily', 'weekly'])
    .withMessage('Invalid push frequency')
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

    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: { message: 'Contact not found' }
      });
    }

    await contact.updateNotificationPreferences(req.body.notifications);

    res.json({
      success: true,
      data: { contact },
      message: 'Notification preferences updated successfully'
    });

  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while updating notification preferences' }
    });
  }
});

// @desc    Update availability
// @route   PUT /api/contacts/:id/availability
// @access  Private
router.put('/:id/availability', protect, async (req, res) => {
  try {
    const { availability } = req.body;

    if (!availability || typeof availability !== 'object') {
      return res.status(400).json({
        success: false,
        error: { message: 'Availability data is required' }
      });
    }

    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: { message: 'Contact not found' }
      });
    }

    contact.availability = {
      ...contact.availability,
      ...availability
    };

    await contact.save();

    res.json({
      success: true,
      data: { contact },
      message: 'Availability updated successfully'
    });

  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while updating availability' }
    });
  }
});

// @desc    Update emergency response settings
// @route   PUT /api/contacts/:id/emergency-response
// @access  Private
router.put('/:id/emergency-response', protect, [
  body('canRespond')
    .optional()
    .isBoolean()
    .withMessage('canRespond must be a boolean'),
  body('responseTime')
    .optional()
    .isInt({ min: 1, max: 1440 })
    .withMessage('Response time must be between 1 and 1440 minutes'),
  body('specialInstructions')
    .optional()
    .isString()
    .withMessage('Special instructions must be a string'),
  body('accessCode')
    .optional()
    .isString()
    .withMessage('Access code must be a string')
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

    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: { message: 'Contact not found' }
      });
    }

    const { canRespond, responseTime, specialInstructions, accessCode } = req.body;

    if (canRespond !== undefined) contact.emergencyResponse.canRespond = canRespond;
    if (responseTime) contact.emergencyResponse.responseTime = responseTime;
    if (specialInstructions !== undefined) contact.emergencyResponse.specialInstructions = specialInstructions;
    if (accessCode !== undefined) contact.emergencyResponse.accessCode = accessCode;

    await contact.save();

    res.json({
      success: true,
      data: { contact },
      message: 'Emergency response settings updated successfully'
    });

  } catch (error) {
    console.error('Update emergency response error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while updating emergency response settings' }
    });
  }
});

// @desc    Get primary contacts
// @route   GET /api/contacts/primary
// @access  Private
router.get('/primary', protect, async (req, res) => {
  try {
    const primaryContacts = await Contact.getPrimaryContacts(req.user._id);

    res.json({
      success: true,
      data: { primaryContacts }
    });

  } catch (error) {
    console.error('Get primary contacts error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while fetching primary contacts' }
    });
  }
});

// @desc    Get contacts by type
// @route   GET /api/contacts/type/:contactType
// @access  Private
router.get('/type/:contactType', protect, async (req, res) => {
  try {
    const { contactType } = req.params;

    const contacts = await Contact.getContactsByType(req.user._id, contactType);

    res.json({
      success: true,
      data: { contacts }
    });

  } catch (error) {
    console.error('Get contacts by type error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while fetching contacts by type' }
    });
  }
});

// @desc    Search contacts
// @route   GET /api/contacts/search/:term
// @access  Private
router.get('/search/:term', protect, async (req, res) => {
  try {
    const { term } = req.params;

    const contacts = await Contact.searchContacts(req.user._id, term);

    res.json({
      success: true,
      data: { contacts }
    });

  } catch (error) {
    console.error('Search contacts error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while searching contacts' }
    });
  }
});

module.exports = router;
