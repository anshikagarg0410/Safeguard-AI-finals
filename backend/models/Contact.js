const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactType: {
    type: String,
    enum: ['family_member', 'caregiver', 'emergency_contact', 'healthcare_provider', 'neighbor'],
    required: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  relationship: {
    type: String,
    required: [true, 'Relationship is required'],
    maxlength: [100, 'Relationship cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  alternatePhone: {
    type: String,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notificationPreferences: {
    email: {
      enabled: { type: Boolean, default: true },
      frequency: {
        type: String,
        enum: ['immediate', 'hourly', 'daily', 'weekly'],
        default: 'immediate'
      }
    },
    sms: {
      enabled: { type: Boolean, default: true },
      frequency: {
        type: String,
        enum: ['immediate', 'hourly', 'daily', 'weekly'],
        default: 'immediate'
      }
    },
    push: {
      enabled: { type: Boolean, default: true },
      frequency: {
        type: String,
        enum: ['immediate', 'hourly', 'daily', 'weekly'],
        default: 'immediate'
      }
    }
  },
  alertTypes: [{
    type: String,
    enum: ['fall', 'inactivity', 'medical', 'security', 'wellness', 'system']
  }],
  availability: {
    monday: {
      start: String, // HH:MM format
      end: String,
      available: { type: Boolean, default: true }
    },
    tuesday: {
      start: String,
      end: String,
      available: { type: Boolean, default: true }
    },
    wednesday: {
      start: String,
      end: String,
      available: { type: Boolean, default: true }
    },
    thursday: {
      start: String,
      end: String,
      available: { type: Boolean, default: true }
    },
    friday: {
      start: String,
      end: String,
      available: { type: Boolean, default: true }
    },
    saturday: {
      start: String,
      end: String,
      available: { type: Boolean, default: true }
    },
    sunday: {
      start: String,
      end: String,
      available: { type: Boolean, default: true }
    }
  },
  emergencyResponse: {
    canRespond: {
      type: Boolean,
      default: true
    },
    responseTime: {
      type: Number, // in minutes
      default: 15
    },
    specialInstructions: String,
    accessCode: String // for building access if needed
  },
  healthInfo: {
    medicalConditions: [String],
    allergies: [String],
    medications: [String],
    emergencyNotes: String
  },
  communicationHistory: [{
    timestamp: Date,
    type: String, // email, sms, push
    status: String, // sent, delivered, failed
    message: String,
    response: String
  }],
  tags: [String],
  notes: String
}, {
  timestamps: true
});

// Indexes for better query performance
contactSchema.index({ userId: 1, contactType: 1 });
contactSchema.index({ userId: 1, isPrimary: 1 });
contactSchema.index({ email: 1 });
contactSchema.index({ phone: 1 });

// Virtual for full name
contactSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for is available now
contactSchema.virtual('isAvailableNow').get(function() {
  if (!this.isActive) return false;
  
  const now = new Date();
  const dayOfWeek = now.toLocaleLowerCase().slice(0, 3);
  const currentTime = now.toTimeString().slice(0, 5);
  
  const daySchedule = this.availability[dayOfWeek];
  if (!daySchedule || !daySchedule.available) return false;
  
  if (!daySchedule.start || !daySchedule.end) return true;
  
  return currentTime >= daySchedule.start && currentTime <= daySchedule.end;
});

// Pre-save middleware to ensure only one primary contact per type
contactSchema.pre('save', async function(next) {
  if (this.isModified('isPrimary') && this.isPrimary) {
    // Set all other contacts of the same type to non-primary
    await this.constructor.updateMany(
      { 
        userId: this.userId, 
        contactType: this.contactType, 
        _id: { $ne: this._id } 
      },
      { isPrimary: false }
    );
  }
  next();
});

// Method to add communication record
contactSchema.methods.addCommunicationRecord = function(record) {
  this.communicationHistory.push({
    ...record,
    timestamp: new Date()
  });
  
  // Keep only last 100 records
  if (this.communicationHistory.length > 100) {
    this.communicationHistory = this.communicationHistory.slice(-100);
  }
  
  return this.save();
};

// Method to update notification preferences
contactSchema.methods.updateNotificationPreferences = function(preferences) {
  this.notificationPreferences = {
    ...this.notificationPreferences,
    ...preferences
  };
  return this.save();
};

// Method to check availability for specific time
contactSchema.methods.isAvailableAt = function(dateTime) {
  if (!this.isActive) return false;
  
  const dayOfWeek = dateTime.toLocaleLowerCase().slice(0, 3);
  const timeString = dateTime.toTimeString().slice(0, 5);
  
  const daySchedule = this.availability[dayOfWeek];
  if (!daySchedule || !daySchedule.available) return false;
  
  if (!daySchedule.start || !daySchedule.end) return true;
  
  return timeString >= daySchedule.start && timeString <= daySchedule.end;
};

// Static method to get primary contacts
contactSchema.statics.getPrimaryContacts = function(userId) {
  return this.find({ userId, isPrimary: true, isActive: true });
};

// Static method to get contacts by type
contactSchema.statics.getContactsByType = function(userId, contactType) {
  return this.find({ userId, contactType, isActive: true }).sort({ isPrimary: -1, firstName: 1 });
};

// Static method to get available contacts for alert type
contactSchema.statics.getAvailableContactsForAlert = function(userId, alertType, dateTime) {
  return this.find({
    userId,
    isActive: true,
    alertTypes: alertType,
    $or: [
      { 'notificationPreferences.email.enabled': true },
      { 'notificationPreferences.sms.enabled': true },
      { 'notificationPreferences.push.enabled': true }
    ]
  }).then(contacts => {
    return contacts.filter(contact => contact.isAvailableAt(dateTime));
  });
};

// Static method to search contacts
contactSchema.statics.searchContacts = function(userId, searchTerm) {
  const regex = new RegExp(searchTerm, 'i');
  return this.find({
    userId,
    isActive: true,
    $or: [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
      { phone: regex },
      { relationship: regex }
    ]
  }).sort({ firstName: 1, lastName: 1 });
};

module.exports = mongoose.model('Contact', contactSchema);
