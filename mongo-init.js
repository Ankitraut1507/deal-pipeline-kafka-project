// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the application database
db = db.getSiblingDB('deal_pipeline_db');

// Create application user
db.createUser({
  user: 'app_user',
  pwd: 'app_password', // This will be overridden by environment variable
  roles: [
    {
      role: 'readWrite',
      db: 'deal_pipeline_db'
    }
  ]
});

// Create initial collections and indexes
db.createCollection('deals');
db.createCollection('users');
db.createCollection('pipelines');

// Create indexes for better performance
db.deals.createIndex({ "title": 1 });
db.deals.createIndex({ "status": 1 });
db.deals.createIndex({ "createdAt": -1 });

db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });

db.pipelines.createIndex({ "name": 1 });
db.pipelines.createIndex({ "status": 1 });
db.pipelines.createIndex({ "createdAt": -1 });

// Insert initial data if needed
db.deals.insertOne({
  title: "Sample Deal",
  description: "This is a sample deal for testing",
  status: "active",
  value: 100000,
  createdAt: new Date(),
  updatedAt: new Date()
});

print("MongoDB initialization completed successfully");
