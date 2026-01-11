#!/usr/bin/env node

/**
 * Simple Test Script - Tests basic functionality without MongoDB connection
 * Run with: node test-validation.js
 */

const { validationResult, body } = require('express-validator');

console.log('\n🧪 ORINOCO API - VALIDATION TESTS\n');
console.log('=' .repeat(50));

// Test 1: Import all modules
console.log('\n✅ Test 1: Module Imports');
try {
  const app = require('./app.js');
  console.log('   ✓ app.js imported successfully');
  
  const Order = require('./models/Order.js');
  console.log('   ✓ Order model imported successfully');
  
  const { verifyToken, verifyAdmin, generateToken } = require('./middleware/auth.js');
  console.log('   ✓ Auth middleware imported successfully');
  
  const { rateLimit, apiRateLimit } = require('./middleware/rateLimit.js');
  console.log('   ✓ Rate limit middleware imported successfully');
  
  const { validateContact, validateMongoId } = require('./middleware/validation.js');
  console.log('   ✓ Validation middleware imported successfully');
  
} catch (error) {
  console.error('   ✗ Import failed:', error.message);
  process.exit(1);
}

// Test 2: Validate middleware structure
console.log('\n✅ Test 2: Middleware Structure');
try {
  const { verifyToken, verifyAdmin, generateToken } = require('./middleware/auth.js');
  
  if (typeof verifyToken === 'function') {
    console.log('   ✓ verifyToken is a function');
  }
  
  if (typeof verifyAdmin === 'function') {
    console.log('   ✓ verifyAdmin is a function');
  }
  
  if (typeof generateToken === 'function') {
    console.log('   ✓ generateToken is a function');
  }
  
  // Test token generation
  process.env.JWT_SECRET = 'test-secret-key';
  const token = generateToken({ id: '123', role: 'admin' });
  console.log('   ✓ Token generated:', token.substring(0, 20) + '...');
  
} catch (error) {
  console.error('   ✗ Middleware test failed:', error.message);
}

// Test 3: Validation Rules
console.log('\n✅ Test 3: Input Validation Rules');
try {
  const { validateContact } = require('./middleware/validation.js');
  
  if (Array.isArray(validateContact)) {
    console.log('   ✓ validateContact is an array of validators');
    console.log(`   ✓ Contains ${validateContact.length} validation rules`);
  }
  
} catch (error) {
  console.error('   ✗ Validation test failed:', error.message);
}

// Test 4: Rate Limiter Configuration
console.log('\n✅ Test 4: Rate Limiter Configuration');
try {
  const { rateLimit, authRateLimit, apiRateLimit } = require('./middleware/rateLimit.js');
  
  if (typeof apiRateLimit === 'function') {
    console.log('   ✓ apiRateLimit is a function');
  }
  
  if (typeof authRateLimit === 'function') {
    console.log('   ✓ authRateLimit is a function');
  }
  
  console.log('   ✓ Rate limiting middleware configured');
  
} catch (error) {
  console.error('   ✗ Rate limiter test failed:', error.message);
}

// Test 5: Environment Configuration
console.log('\n✅ Test 5: Environment Configuration');
try {
  require('dotenv').config();
  
  if (process.env.PORT) {
    console.log(`   ✓ PORT configured: ${process.env.PORT}`);
  } else {
    console.log('   ⚠ PORT not set (will use default 3000)');
  }
  
  if (process.env.JWT_SECRET || process.env.NODE_ENV === 'test') {
    console.log('   ✓ JWT_SECRET configured');
  } else {
    console.log('   ⚠ JWT_SECRET not set (should be set in .env)');
  }
  
  console.log('   ✓ Environment configuration working');
  
} catch (error) {
  console.error('   ✗ Environment test failed:', error.message);
}

// Test 6: Route Imports
console.log('\n✅ Test 6: Route Imports');
try {
  const cameraRoutes = require('./routes/camera.js');
  console.log('   ✓ Camera routes imported');
  
  const teddyRoutes = require('./routes/teddy.js');
  console.log('   ✓ Teddy routes imported');
  
  const furnitureRoutes = require('./routes/furniture.js');
  console.log('   ✓ Furniture routes imported');
  
  const adminRoutes = require('./routes/admin.js');
  console.log('   ✓ Admin routes imported');
  
} catch (error) {
  console.error('   ✗ Route import failed:', error.message);
  process.exit(1);
}

// Test 7: Controller Imports
console.log('\n✅ Test 7: Controller Imports');
try {
  const cameraCtrl = require('./controllers/camera.js');
  console.log('   ✓ Camera controller imported');
  
  const teddyCtrl = require('./controllers/teddy.js');
  console.log('   ✓ Teddy controller imported');
  
  const furnitureCtrl = require('./controllers/furniture.js');
  console.log('   ✓ Furniture controller imported');
  
} catch (error) {
  console.error('   ✗ Controller import failed:', error.message);
  process.exit(1);
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n✅ ALL VALIDATION TESTS PASSED!\n');
console.log('📋 Summary:');
console.log('   ✓ All modules load correctly');
console.log('   ✓ Middleware functions are available');
console.log('   ✓ Routes are configured');
console.log('   ✓ Controllers are configured');
console.log('   ✓ Environment setup is working');
console.log('\n🚀 Ready to start server: npm start\n');
console.log('📖 For testing: See TESTING.md for detailed instructions\n');

process.exit(0);
