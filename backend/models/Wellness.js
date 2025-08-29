const mongoose = require('mongoose');

const wellnessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  sleepData: {
    bedtime: Date,
    wakeTime: Date,
    totalSleepHours: Number,
    sleepQuality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent'],
      default: 'good'
    },
    sleepInterruptions: Number,
    deepSleepPercentage: Number,
    remSleepPercentage: Number
  },
  medication: [{
    name: String,
    dosage: String,
    time: Date,
    taken: {
      type: Boolean,
      default: false
    },
    reminderSent: {
      type: Boolean,
      default: false
    },
    notes: String
  }],
  vitalSigns: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      timestamp: Date
    },
    heartRate: {
      value: Number,
      timestamp: Date
    },
    temperature: {
      value: Number,
      timestamp: Date
    },
    oxygenSaturation: {
      value: Number,
      timestamp: Date
    }
  },
  activityMetrics: {
    steps: Number,
    distance: Number, // in meters
    caloriesBurned: Number,
    activeMinutes: Number,
    sedentaryMinutes: Number
  },
  mood: {
    score: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    description: String,
    factors: [String]
  },
  nutrition: {
    waterIntake: Number, // in ml
    meals: [{
      type: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack']
      },
      time: Date,
      description: String,
      calories: Number,
      nutrients: {
        protein: Number,
        carbs: Number,
        fat: Number,
        fiber: Number
      }
    }],
    supplements: [String]
  },
  symptoms: [{
    name: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    startTime: Date,
    endTime: Date,
    notes: String
  }],
  wellnessScore: {
    overall: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    components: {
      sleep: { type: Number, min: 0, max: 100 },
      activity: { type: Number, min: 0, max: 100 },
      nutrition: { type: Number, min: 0, max: 100 },
      mood: { type: Number, min: 0, max: 100 },
      medication: { type: Number, min: 0, max: 100 }
    },
    lastCalculated: Date
  },
  goals: [{
    category: String,
    target: String,
    current: String,
    deadline: Date,
    completed: {
      type: Boolean,
      default: false
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  }],
  notes: String,
  tags: [String]
}, {
  timestamps: true
});

// Indexes for better query performance
wellnessSchema.index({ userId: 1, date: -1 });
wellnessSchema.index({ 'wellnessScore.overall': -1 });
wellnessSchema.index({ 'sleepData.sleepQuality': 1 });
wellnessSchema.index({ 'mood.score': 1 });

// Virtual for sleep efficiency
wellnessSchema.virtual('sleepEfficiency').get(function() {
  if (!this.sleepData.bedtime || !this.sleepData.wakeTime) return null;
  
  const totalTimeInBed = this.sleepData.wakeTime - this.sleepData.bedtime;
  const actualSleepTime = this.sleepData.totalSleepHours * 60 * 60 * 1000; // Convert to milliseconds
  
  if (totalTimeInBed === 0) return 0;
  return Math.round((actualSleepTime / totalTimeInBed) * 100);
});

// Virtual for medication adherence
wellnessSchema.virtual('medicationAdherence').get(function() {
  if (this.medication.length === 0) return 100;
  
  const taken = this.medication.filter(med => med.taken).length;
  return Math.round((taken / this.medication.length) * 100);
});

// Pre-save middleware to calculate wellness score
wellnessSchema.pre('save', function(next) {
  if (this.isModified('sleepData') || this.isModified('activityMetrics') || 
      this.isModified('nutrition') || this.isModified('mood') || this.isModified('medication')) {
    this.calculateWellnessScore();
  }
  next();
});

// Method to calculate wellness score
wellnessSchema.methods.calculateWellnessScore = function() {
  let totalScore = 0;
  let componentCount = 0;
  
  // Sleep score (0-100)
  if (this.sleepData.totalSleepHours) {
    let sleepScore = 0;
    if (this.sleepData.totalSleepHours >= 7 && this.sleepData.totalSleepHours <= 9) {
      sleepScore = 100;
    } else if (this.sleepData.totalSleepHours >= 6 && this.sleepData.totalSleepHours <= 10) {
      sleepScore = 80;
    } else if (this.sleepData.totalSleepHours >= 5 && this.sleepData.totalSleepHours <= 11) {
      sleepScore = 60;
    } else {
      sleepScore = 40;
    }
    
    // Adjust for sleep quality
    const qualityMultiplier = {
      'excellent': 1.0,
      'good': 0.9,
      'fair': 0.7,
      'poor': 0.5
    };
    sleepScore *= qualityMultiplier[this.sleepData.sleepQuality] || 0.7;
    
    this.wellnessScore.components.sleep = Math.round(sleepScore);
    totalScore += sleepScore;
    componentCount++;
  }
  
  // Activity score (0-100)
  if (this.activityMetrics.steps) {
    let activityScore = 0;
    if (this.activityMetrics.steps >= 10000) {
      activityScore = 100;
    } else if (this.activityMetrics.steps >= 7500) {
      activityScore = 85;
    } else if (this.activityMetrics.steps >= 5000) {
      activityScore = 70;
    } else if (this.activityMetrics.steps >= 2500) {
      activityScore = 50;
    } else {
      activityScore = 30;
    }
    
    this.wellnessScore.components.activity = Math.round(activityScore);
    totalScore += activityScore;
    componentCount++;
  }
  
  // Nutrition score (0-100)
  if (this.nutrition.waterIntake) {
    let nutritionScore = 0;
    if (this.nutrition.waterIntake >= 2000) {
      nutritionScore = 100;
    } else if (this.nutrition.waterIntake >= 1500) {
      nutritionScore = 80;
    } else if (this.nutrition.waterIntake >= 1000) {
      nutritionScore = 60;
    } else {
      nutritionScore = 40;
    }
    
    this.wellnessScore.components.nutrition = Math.round(nutritionScore);
    totalScore += nutritionScore;
    componentCount++;
  }
  
  // Mood score (0-100)
  if (this.mood.score) {
    const moodScore = this.mood.score * 10; // Convert 1-10 to 0-100
    this.wellnessScore.components.mood = Math.round(moodScore);
    totalScore += moodScore;
    componentCount++;
  }
  
  // Medication adherence score (0-100)
  const adherenceScore = this.medicationAdherence;
  this.wellnessScore.components.medication = adherenceScore;
  totalScore += adherenceScore;
  componentCount++;
  
  // Calculate overall score
  if (componentCount > 0) {
    this.wellnessScore.overall = Math.round(totalScore / componentCount);
  }
  
  this.wellnessScore.lastCalculated = new Date();
};

// Method to add medication
wellnessSchema.methods.addMedication = function(medicationData) {
  this.medication.push(medicationData);
  return this.save();
};

// Method to mark medication as taken
wellnessSchema.methods.markMedicationTaken = function(medicationId) {
  const medication = this.medication.id(medicationId);
  if (medication) {
    medication.taken = true;
    medication.time = new Date();
  }
  return this.save();
};

// Method to add symptom
wellnessSchema.methods.addSymptom = function(symptomData) {
  this.symptoms.push({
    ...symptomData,
    startTime: new Date()
  });
  return this.save();
};

// Method to resolve symptom
wellnessSchema.methods.resolveSymptom = function(symptomId) {
  const symptom = this.symptoms.id(symptomId);
  if (symptom) {
    symptom.endTime = new Date();
  }
  return this.save();
};

// Static method to get wellness data by date range
wellnessSchema.statics.getWellnessByDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: -1 });
};

// Static method to get wellness trends
wellnessSchema.statics.getWellnessTrends = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), date: { $gte: startDate } } },
    { $sort: { date: 1 } },
    { $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
      wellnessScore: { $avg: "$wellnessScore.overall" },
      sleepHours: { $avg: "$sleepData.totalSleepHours" },
      steps: { $avg: "$activityMetrics.steps" },
      moodScore: { $avg: "$mood.score" }
    }},
    { $sort: { _id: 1 } }
  ]);
};

module.exports = mongoose.model('Wellness', wellnessSchema);
