// MongoDB initialization script for SafeGuard AI
// This script runs when the MongoDB container starts for the first time

print('Starting SafeGuard AI database initialization...');

// Switch to the SafeGuard AI database
db = db.getSiblingDB('familysafe-ai');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['firstName', 'lastName', 'email', 'password', 'phone'],
      properties: {
        firstName: {
          bsonType: 'string',
          minLength: 2,
          maxLength: 50
        },
        lastName: {
          bsonType: 'string',
          minLength: 2,
          maxLength: 50
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        password: {
          bsonType: 'string',
          minLength: 8
        },
        phone: {
          bsonType: 'string',
          pattern: '^\\+?[\\d\\s\\-\\(\\)]+$'
        }
      }
    }
  }
});

db.createCollection('monitoring', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'sessionId'],
      properties: {
        userId: {
          bsonType: 'objectId'
        },
        sessionId: {
          bsonType: 'string'
        }
      }
    }
  }
});

db.createCollection('alerts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'alertType', 'severity', 'title', 'description'],
      properties: {
        userId: {
          bsonType: 'objectId'
        },
        alertType: {
          enum: ['fall', 'inactivity', 'medical', 'security', 'wellness', 'system']
        },
        severity: {
          enum: ['low', 'medium', 'high', 'critical']
        }
      }
    }
  }
});

db.createCollection('wellness', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'date'],
      properties: {
        userId: {
          bsonType: 'objectId'
        },
        date: {
          bsonType: 'date'
        }
      }
    }
  }
});

db.createCollection('contacts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'contactType', 'firstName', 'lastName', 'relationship', 'email', 'phone'],
      properties: {
        userId: {
          bsonType: 'objectId'
        },
        contactType: {
          enum: ['family_member', 'caregiver', 'emergency_contact', 'healthcare_provider', 'neighbor']
        }
      }
    }
  }
});

// Create indexes for better performance
print('Creating database indexes...');

// Users collection indexes
db.users.createIndex({ 'email': 1 }, { unique: true });
db.users.createIndex({ 'role': 1 });
db.users.createIndex({ 'isActive': 1 });
db.users.createIndex({ 'createdAt': -1 });

// Monitoring collection indexes
db.monitoring.createIndex({ 'userId': 1, 'startTime': -1 });
db.monitoring.createIndex({ 'sessionId': 1 }, { unique: true });
db.monitoring.createIndex({ 'status': 1 });
db.monitoring.createIndex({ 'activities.timestamp': -1 });
db.monitoring.createIndex({ 'activities.activityType': 1 });
db.monitoring.createIndex({ 'activities.riskLevel': 1 });

// Alerts collection indexes
db.alerts.createIndex({ 'userId': 1, 'timestamp': -1 });
db.alerts.createIndex({ 'status': 1, 'severity': 1 });
db.alerts.createIndex({ 'alertType': 1, 'timestamp': -1 });
db.alerts.createIndex({ 'notifications.status': 1 });
db.alerts.createIndex({ 'escalationLevel': 1, 'status': 1 });

// Wellness collection indexes
db.wellness.createIndex({ 'userId': 1, 'date': -1 });
db.wellness.createIndex({ 'wellnessScore.overall': -1 });
db.wellness.createIndex({ 'sleepData.sleepQuality': 1 });
db.wellness.createIndex({ 'mood.score': 1 });

// Contacts collection indexes
db.contacts.createIndex({ 'userId': 1, 'contactType': 1 });
db.contacts.createIndex({ 'userId': 1, 'isPrimary': 1 });
db.contacts.createIndex({ 'email': 1 });
db.contacts.createIndex({ 'phone': 1 });

print('Database indexes created successfully');

// Create a default admin user (optional - for development)
if (db.users.countDocuments({ role: 'admin' }) === 0) {
  print('Creating default admin user...');
  
  // Note: In production, this should be done through the application
  // This is just for development/testing purposes
  const adminUser = {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@safeguard-ai.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8QqHh6e', // 'admin123'
    phone: '+1234567890',
    role: 'admin',
    isActive: true,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  db.users.insertOne(adminUser);
  print('Default admin user created: admin@safeguard-ai.com / admin123');
}

print('SafeGuard AI database initialization completed successfully!');
print('Database: ' + db.getName());
print('Collections: ' + db.getCollectionNames().join(', '));
