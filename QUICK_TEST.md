# Quick Testing Steps

## Step 1: Run Validation Tests ✅

```bash
node test-validation.js
```

This tests all modules, middleware, routes, and controllers without needing MongoDB.

**Expected Output:** All tests pass ✅

---

## Step 2: Start the Server

### Option A: Local Testing (with MongoDB)

Update `.env` file with your MongoDB credentials:

```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

Then start:

```bash
npm start
```

Server will run on `http://localhost:3000`

### Option B: Test Without MongoDB (Demo Mode)

If you don't have MongoDB setup yet, the server still starts on port 3000. You can test endpoints, but order persistence won't work.

---

## Step 3: Test the API

Open a new terminal and test endpoints:

### Test 1: Check if server is running
```bash
curl http://localhost:3000/api/cameras
```

**Expected:** Returns array (or error if DB not connected, but server responds)

### Test 2: Test 404 error handling
```bash
curl http://localhost:3000/invalid-route
```

**Expected:** 
```json
{"error": "Route not found"}
```

### Test 3: Test input validation
```bash
curl -X POST http://localhost:3000/api/cameras/order \
  -H "Content-Type: application/json" \
  -d '{
    "contact": {
      "firstName": "John",
      "lastName": "Doe",
      "address": "123 Main",
      "city": "Springfield",
      "email": "invalid-email"
    },
    "products": []
  }'
```

**Expected:**
```json
{
  "error": "Validation failed",
  "details": [
    {"field": "contact.email", "message": "Valid email is required"},
    {"field": "products", "message": "Products array cannot be empty"}
  ]
}
```

### Test 4: Test rate limiting (requires valid MongoDB)
Make 101 requests quickly:

```bash
for i in {1..105}; do
  curl http://localhost:3000/api/cameras
  echo "Request $i"
done
```

After request 100, you should see:
```json
{"error": "Too many requests. Please try again later."}
```

---

## Step 4: Advanced Testing

### Generate a JWT Token

```bash
node -e "console.log(require('jsonwebtoken').sign({role: 'admin', id: 'test-user'}, 'your_secret_here', {expiresIn: '24h'}))"
```

### Test Admin Endpoints (Requires JWT)

```bash
JWT_TOKEN="your_generated_token_here"

# Get all orders
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3000/api/admin/orders

# Get statistics
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3000/api/admin/stats
```

---

## Testing Checklist

After following above steps, verify:

- [ ] Validation tests pass (`node test-validation.js`)
- [ ] Server starts without errors (`npm start`)
- [ ] Can access routes without MongoDB (gets connection error, but route exists)
- [ ] 404 errors handled correctly
- [ ] Input validation rejects invalid data
- [ ] Rate limiting blocks after 100 requests (with real DB)
- [ ] Admin endpoints require JWT token
- [ ] Environment variables load from .env

---

## Full Testing with Real Data

Once MongoDB is configured:

1. **Update .env** with real MongoDB credentials
2. **Start server** with `npm start`
3. **Test order creation**
4. **Check MongoDB** - orders should be saved
5. **Test admin endpoints** - retrieve orders from database
6. **Verify status updates** - change order status and confirm in DB

---

## Debugging

### Server won't start?
- Check for port conflicts: `lsof -i :3000`
- Verify .env file exists
- Run `node test-validation.js` to check all modules

### MongoDB connection error?
- It's OK - server will start without DB
- Just won't be able to save orders
- Fix .env with correct credentials

### Validation not working?
- Make sure `npm install` was run
- Check that express-validator is in node_modules
- Run `node test-validation.js` to verify

### Rate limiting issues?
- Remove this to test: `app.use(apiRateLimit);` in app.js
- Or increase limits in `middleware/rateLimit.js`
- Restart server after changes

---

## Next Steps

1. ✅ Run `node test-validation.js`
2. ✅ Start server with `npm start`
3. ✅ Test with curl commands
4. 📖 See `TESTING.md` for comprehensive testing guide
5. 📖 See `API_DOCUMENTATION.md` for all endpoint details
