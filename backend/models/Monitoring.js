const mongoose = require('mongoose');

const monitoringSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'stopped', 'error'],
    default: 'active'
  },
  deviceInfo: {
    deviceId: String,
    deviceType: String,
    location: String,
    ipAddress: String
  },
  aiAnalysis: {
    isEnabled: {
      type: Boolean,
      default: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.8
    },
    modelVersion: String,
    lastUpdate: Date
  },
  activities: [{
    timestamp: {
      type: Date,
      required: true
    },
    activityType: {
      type: String,
      enum: ['sleep', 'walk', 'sit', 'stand', 'fall', 'inactivity', 'unknown'],
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    duration: Number, // in seconds
    location: String,
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    metadata: {
      coordinates: {
        x: Number,
        y: Number
      },
      boundingBox: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
      }
    }
  }],
  alerts: [{
    alertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert'
    },
    timestamp: Date,
    severity: String,
    resolved: {
      type: Boolean,
      default: false
    }
  }],
  privacySettings: {
    videoRecording: {
      type: Boolean,
      default: false
    },
    dataRetention: {
      type: Number, // days
      default: 30
    },
    anonymization: {
      type: Boolean,
      default: true
    }
  },
  performance: {
    fps: Number,
    latency: Number,
    memoryUsage: Number,
    cpuUsage: Number
  },
  errors: [{
    timestamp: Date,
    errorType: String,
    message: String,
    stack: String,
    resolved: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
monitoringSchema.index({ userId: 1, startTime: -1 });
monitoringSchema.index({ sessionId: 1 });
monitoringSchema.index({ 'activities.timestamp': -1 });
monitoringSchema.index({ 'activities.activityType': 1 });
monitoringSchema.index({ 'activities.riskLevel': 1 });

// Virtual for session duration
monitoringSchema.virtual('duration').get(function() {
  if (this.endTime) {
    return this.endTime - this.startTime;
  }
  return Date.now() - this.startTime;
});

// Virtual for current risk level
monitoringSchema.virtual('currentRiskLevel').get(function() {
  if (this.activities.length === 0) return 'low';
  
  const recentActivities = this.activities
    .filter(activity => Date.now() - activity.timestamp < 5 * 60 * 1000) // Last 5 minutes
    .sort((a, b) => b.timestamp - a.timestamp);
  
  if (recentActivities.length === 0) return 'low';
  
  const riskScores = {
    'low': 1,
    'medium': 2,
    'high': 3,
    'critical': 4
  };
  
  const highestRisk = recentActivities.reduce((highest, activity) => {
    return riskScores[activity.riskLevel] > riskScores[highest] ? activity.riskLevel : highest;
  }, 'low');
  
  return highestRisk;
});

// Method to add activity
monitoringSchema.methods.addActivity = function(activityData) {
  this.activities.push({
    ...activityData,
    timestamp: new Date()
  });
  
  // Keep only last 1000 activities to prevent memory issues
  if (this.activities.length > 1000) {
    this.activities = this.activities.slice(-1000);
  }
  
  return this.save();
};

// Method to add error
monitoringSchema.methods.addError = function(errorData) {
  this.errors.push({
    ...errorData,
    timestamp: new Date()
  });
  
  // Keep only last 100 errors
  if (this.errors.length > 100) {
    this.errors = this.errors.slice(-100);
  }
  
  return this.save();
};

// Static method to get active sessions
monitoringSchema.statics.getActiveSessions = function() {
  return this.find({ status: 'active' }).populate('userId', 'firstName lastName email');
};

// Static method to get sessions by date range
monitoringSchema.statics.getSessionsByDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    startTime: { $gte: startDate, $lte: endDate }
  }).sort({ startTime: -1 });
};

module.exports = mongoose.model('Monitoring', monitoringSchema);
