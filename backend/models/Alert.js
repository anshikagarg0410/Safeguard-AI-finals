const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  monitoringSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Monitoring'
  },
  alertType: {
    type: String,
    enum: ['fall', 'inactivity', 'medical', 'security', 'wellness', 'system', 'sos'], // Added 'sos'
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved', 'escalated'],
    default: 'active'
  },
  title: {
    type: String,
    required: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  location: {
    type: String,
    default: null
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  acknowledgedAt: {
    type: Date,
    default: null
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  escalationLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  escalationHistory: [{
    level: Number,
    timestamp: Date,
    contactType: String, // email, sms, push
    contactId: String,
    status: String, // sent, delivered, failed
    response: String
  }],
  notifications: [{
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    contactType: String, // email, sms, push
    sentAt: Date,
    status: String, // pending, sent, delivered, failed
    deliveryAttempts: {
      type: Number,
      default: 0
    },
    lastAttempt: Date,
    response: String
  }],
  metadata: {
    activityType: String,
    confidence: Number,
    duration: Number,
    riskFactors: [String],
    aiAnalysis: {
      modelVersion: String,
      confidence: Number,
      processingTime: Number
    }
  },
  tags: [String],
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  autoResolve: {
    type: Boolean,
    default: false
  },
  autoResolveAfter: {
    type: Number, // minutes
    default: 30
  }
}, {
  timestamps: true
});

// Indexes for better query performance
alertSchema.index({ userId: 1, timestamp: -1 });
alertSchema.index({ status: 1, severity: 1 });
alertSchema.index({ alertType: 1, timestamp: -1 });
alertSchema.index({ 'notifications.status': 1 });
alertSchema.index({ escalationLevel: 1, status: 1 });

// Virtual for alert age in minutes
alertSchema.virtual('ageInMinutes').get(function() {
  return Math.floor((Date.now() - this.timestamp) / (1000 * 60));
});

// Virtual for is overdue
alertSchema.virtual('isOverdue').get(function() {
  if (this.autoResolve && this.autoResolveAfter) {
    return this.ageInMinutes > this.autoResolveAfter;
  }
  return false;
});

// Pre-save middleware to set priority based on severity
alertSchema.pre('save', function(next) {
  const severityPriority = {
    'low': 1,
    'medium': 3,
    'high': 6,
    'critical': 10
  };
  
  if (this.isModified('severity')) {
    this.priority = severityPriority[this.severity] || 1;
  }
  
  next();
});

// Method to acknowledge alert
alertSchema.methods.acknowledge = function(userId) {
  this.status = 'acknowledged';
  this.acknowledgedAt = new Date();
  this.acknowledgedBy = userId;
  return this.save();
};

// Method to resolve alert
alertSchema.methods.resolve = function(userId) {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.resolvedBy = userId;
  return this.save();
};

// Method to escalate alert
alertSchema.methods.escalate = function(contactType, contactId) {
  this.escalationLevel += 1;
  this.escalationHistory.push({
    level: this.escalationLevel,
    timestamp: new Date(),
    contactType,
    contactId,
    status: 'sent',
    response: null
  });
  
  if (this.escalationLevel >= 3) {
    this.status = 'escalated';
  }
  
  return this.save();
};

// Method to add notification
alertSchema.methods.addNotification = function(contactId, contactType) {
  this.notifications.push({
    contactId,
    contactType,
    sentAt: new Date(),
    status: 'pending',
    deliveryAttempts: 0,
    lastAttempt: new Date(),
    response: null
  });
  return this.save();
};

// Method to update notification status
alertSchema.methods.updateNotificationStatus = function(contactId, status, response) {
  const notification = this.notifications.find(n => n.contactId.toString() === contactId.toString());
  if (notification) {
    notification.status = status;
    notification.lastAttempt = new Date();
    if (status === 'failed') {
      notification.deliveryAttempts += 1;
    }
    if (response) {
      notification.response = response;
    }
  }
  return this.save();
};

// Static method to get active alerts
alertSchema.statics.getActiveAlerts = function(userId) {
  return this.find({
    userId,
    status: { $in: ['active', 'acknowledged'] }
  }).sort({ priority: -1, timestamp: -1 });
};

// Static method to get alerts by severity
alertSchema.statics.getAlertsBySeverity = function(userId, severity) {
  return this.find({
    userId,
    severity,
    status: { $ne: 'resolved' }
  }).sort({ timestamp: -1 });
};

// Static method to get overdue alerts
alertSchema.statics.getOverdueAlerts = function() {
  const now = new Date();
  return this.find({
    status: { $in: ['active', 'acknowledged'] },
    autoResolve: true,
    autoResolveAfter: { $exists: true },
    $expr: {
      $gt: [
        { $divide: [{ $subtract: [now, '$timestamp'] }, 1000 * 60] },
        '$autoResolveAfter'
      ]
    }
  });
};

module.exports = mongoose.model('Alert', alertSchema);
