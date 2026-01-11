# Testing Guide for Orinoco API

This guide provides instructions for testing all endpoints of the Orinoco vintage camera e-commerce API.

## Prerequisites

1. **Dependencies installed**
   ```bash
   npm install
   ```

2. **MongoDB configured**
   - Update `.env` file with your MongoDB Atlas connection string
   - Example:
     ```env
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true
     ```

3. **Server running**
   ```bash
   npm start
   # Server runs on http://localhost:3000
   ```

---

## Quick Test Commands

Copy and paste these commands to test the API:

### 1. Test Server Health
```bash
curl http://localhost:3000/api/cameras
```

**Expected Response:** Array of cameras (200 OK) or empty array if no data in DB

---

### 2. Get All Products

#### Get Cameras
```bash
curl http://localhost:3000/api/cameras
```

#### Get Teddies
```bash
curl http://localhost:3000/api/teddies
```

#### Get Furniture
```bash
curl http://localhost:3000/api/furniture
```

---

### 3. Get Single Product (Use Real ID from Get All)

```bash
# Replace PRODUCT_ID with actual ID from previous request
curl http://localhost:3000/api/cameras/PRODUCT_ID
```

**Example with test ID:**
```bash
curl http://localhost:3000/api/cameras/507f1f77bcf86cd799439011
```

---

### 4. Place an Order

```bash
curl -X POST http://localhost:3000/api/cameras/order \
  -H "Content-Type: application/json" \
  -d '{
    "contact": {
      "firstName": "John",
      "lastName": "Doe",
      "address": "123 Main Street",
      "city": "Springfield",
      "email": "john@example.com"
    },
    "products": ["507f1f77bcf86cd799439011"]
  }'
```

**Expected Response:**
- Status: 201 (Created)
- Body: Order confirmation with `orderId`

---

### 5. Test Validation (Should Return 400)

#### Invalid Email
```bash
curl -X POST http://localhost:3000/api/cameras/order \
  -H "Content-Type: application/json" \
  -d '{
    "contact": {
      "firstName": "John",
      "lastName": "Doe",
      "address": "123 Main Street",
      "city": "Springfield",
      "email": "not-an-email"
    },
    "products": ["507f1f77bcf86cd799439011"]
  }'
```

**Expected Response:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "contact.email",
      "message": "Valid email is required"
    }
  ]
}
```

#### Missing Field
```bash
curl -X POST http://localhost:3000/api/cameras/order \
  -H "Content-Type: application/json" \
  -d '{
    "contact": {
      "firstName": "John",
      "lastName": "Doe",
      "address": "123 Main Street",
      "city": "Springfield"
    },
    "products": ["507f1f77bcf86cd799439011"]
  }'
```

#### Invalid Product ID
```bash
curl -X POST http://localhost:3000/api/cameras/order \
  -H "Content-Type: application/json" \
  -d '{
    "contact": {
      "firstName": "John",
      "lastName": "Doe",
      "address": "123 Main Street",
      "city": "Springfield",
      "email": "john@example.com"
    },
    "products": ["not-a-valid-id"]
  }'
```

---

### 6. Test Rate Limiting

Make 101 requests in quick succession (after 100 requests should be rate limited):

```bash
for i in {1..105}; do
  curl http://localhost:3000/api/cameras -H "Content-Type: application/json"
  echo "Request $i"
done
```

**Expected Response at request 101+:**
```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 45
}
```

**Status Code:** 429 (Too Many Requests)

---

### 7. Test 404 Error

```bash
curl http://localhost:3000/api/nonexistent
```

**Expected Response:**
```json
{
  "error": "Route not found"
}
```

**Status Code:** 404

---

### 8. Test Admin Endpoints (Requires JWT)

First, you need a valid JWT token. For testing, you can generate one using Node:

```bash
node -e "console.log(require('jsonwebtoken').sign({role: 'admin', id: 'test-user'}, process.env.JWT_SECRET || 'test-secret', {expiresIn: '24h'}))"
```

This will output a token. Copy it and use in the next commands:

#### Get All Orders (Admin)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  http://localhost:3000/api/admin/orders
```

#### Get Orders with Filters
```bash
# Get shipped orders, page 1, 10 per page
curl -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  "http://localhost:3000/api/admin/orders?status=shipped&page=1&limit=10"
```

#### Get Single Order
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  http://localhost:3000/api/admin/orders/ORDER_ID
```

#### Update Order Status
```bash
curl -X PATCH http://localhost:3000/api/admin/orders/ORDER_ID/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped"}'
```

**Valid statuses:** `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`

#### Get Statistics
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  http://localhost:3000/api/admin/stats
```

**Expected Response:**
```json
{
  "totalOrders": 5,
  "totalRevenue": 450.95,
  "byStatus": [
    {
      "_id": "pending",
      "count": 2,
      "totalRevenue": 150.00
    }
  ]
}
```

---

## Postman Collection

You can import this into Postman for easier testing:

```json
{
  "info": {
    "name": "Orinoco API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get All Cameras",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/cameras"
      }
    },
    {
      "name": "Place Camera Order",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/cameras/order",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"contact\":{\"firstName\":\"John\",\"lastName\":\"Doe\",\"address\":\"123 Main\",\"city\":\"Springfield\",\"email\":\"john@example.com\"},\"products\":[\"507f1f77bcf86cd799439011\"]}"
        }
      }
    },
    {
      "name": "Admin: Get Orders",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/admin/orders",
        "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}]
      }
    },
    {
      "name": "Admin: Get Stats",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/admin/stats",
        "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}]
      }
    }
  ],
  "variable": [
    {"key": "baseUrl", "value": "http://localhost:3000"},
    {"key": "jwt_token", "value": "YOUR_TOKEN_HERE"}
  ]
}
```

---

## Testing Checklist

- [ ] Server starts without errors
- [ ] Can retrieve all cameras
- [ ] Can retrieve all teddies
- [ ] Can retrieve all furniture
- [ ] Can get single product details
- [ ] Can place order with valid data
- [ ] Validation rejects invalid email
- [ ] Validation rejects missing fields
- [ ] Rate limiting blocks after 100 requests
- [ ] 404 error on undefined routes
- [ ] Admin endpoints require JWT
- [ ] Admin can list orders
- [ ] Admin can update order status
- [ ] Order statistics work correctly

---

## Troubleshooting

### "Cannot connect to MongoDB"
- Check your `.env` file has correct `MONGODB_URI`
- Ensure your IP is whitelisted in MongoDB Atlas Network Access
- Verify username and password are URL-encoded if they contain special characters

### "404 on all routes"
- Ensure server is running: `npm start`
- Check port in `.env` (default: 3000)
- Try `http://localhost:3000` instead of `127.0.0.1:3000`

### "Invalid token"
- Generate a new token using the command in section 8
- Ensure token is not expired (24-hour expiration)
- Use exact format: `Authorization: Bearer TOKEN_HERE`

### "Rate limited too quickly"
- Modify limits in `middleware/rateLimit.js` if needed
- For production, consider using Redis-based rate limiting
- Restart server after making changes

### "Cannot find module 'dotenv'"
- Run: `npm install`
- Check that `.env` file exists in project root

---

## Performance Testing

Test with multiple concurrent requests:

```bash
# Using Apache Bench (if installed)
ab -n 100 -c 10 http://localhost:3000/api/cameras

# Or using curl loop
for i in {1..50}; do
  curl http://localhost:3000/api/cameras &
done
wait
```

---

## Integration Testing Notes

1. **Clean Database**: Delete all test orders before starting new tests
2. **Use Consistent Test Data**: Keep same contact info across tests
3. **Check Timestamps**: Verify `createdAt` and `updatedAt` fields in orders
4. **Validate Calculations**: Ensure `totalPrice` matches product prices
5. **Status Workflow**: Test complete workflow: pending → confirmed → shipped → delivered

---

## Next: Automated Testing

For production, implement automated tests using Jest:

```bash
npm install --save-dev jest supertest
```

Then create test files in `__tests__/` directory with integration tests.
