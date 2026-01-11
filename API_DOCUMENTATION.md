# Orinoco Vintage Camera - API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Public Endpoints (No Authentication Required)

### 1. Get All Products

#### Cameras
```http
GET /cameras
```
**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Vintage Canon AE-1",
    "price": 89.99,
    "description": "Classic 35mm SLR camera",
    "lenses": ["50mm f/1.8", "28mm f/2.8"],
    "imageUrl": "http://localhost:3000/images/camera1.jpg"
  }
]
```

#### Teddies
```http
GET /teddies
```

#### Furniture
```http
GET /furniture
```

---

### 2. Get Single Product

```http
GET /cameras/:id
GET /teddies/:id
GET /furniture/:id
```

**Parameters:**
- `id` (string, required): MongoDB ObjectId

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Vintage Canon AE-1",
  "price": 89.99,
  "description": "Classic 35mm SLR camera",
  "lenses": ["50mm f/1.8", "28mm f/2.8"],
  "imageUrl": "http://localhost:3000/images/camera1.jpg"
}
```

**Error Response (404):**
```json
{
  "error": "Camera not found"
}
```

---

### 3. Place an Order

```http
POST /cameras/order
POST /teddies/order
POST /furniture/order
```

**Request Body:**
```json
{
  "contact": {
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main St",
    "city": "Springfield",
    "email": "john@example.com"
  },
  "products": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ]
}
```

**Response (201):**
```json
{
  "orderId": "607f1f77bcf86cd799439013",
  "contact": {
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main St",
    "city": "Springfield",
    "email": "john@example.com"
  },
  "products": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "productName": "Vintage Canon AE-1",
      "price": 89.99
    }
  ],
  "totalPrice": 89.99,
  "status": "pending"
}
```

**Validation Errors (400):**
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

---

## Protected Endpoints (Admin Only)

All admin endpoints require:
1. Valid JWT token in Authorization header
2. User role must be `admin`

### 1. Get All Orders

```http
GET /admin/orders
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status` (optional): Filter by status - `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`
- `page` (optional, default: 1): Page number for pagination
- `limit` (optional, default: 20, max: 100): Results per page

**Response:**
```json
{
  "orders": [
    {
      "_id": "607f1f77bcf86cd799439013",
      "contact": {
        "firstName": "John",
        "lastName": "Doe",
        "address": "123 Main St",
        "city": "Springfield",
        "email": "john@example.com"
      },
      "products": [
        {
          "productId": "507f1f77bcf86cd799439011",
          "productName": "Vintage Canon AE-1",
          "price": 89.99
        }
      ],
      "totalPrice": 89.99,
      "status": "pending",
      "createdAt": "2026-01-11T10:00:00.000Z",
      "updatedAt": "2026-01-11T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

**Example with filters:**
```http
GET /admin/orders?status=shipped&page=2&limit=10
```

---

### 2. Get Single Order Details

```http
GET /admin/orders/:id
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `id` (string, required): Order MongoDB ObjectId

**Response:**
```json
{
  "_id": "607f1f77bcf86cd799439013",
  "contact": {
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main St",
    "city": "Springfield",
    "email": "john@example.com"
  },
  "products": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "productName": "Vintage Canon AE-1",
      "price": 89.99
    }
  ],
  "totalPrice": 89.99,
  "status": "pending",
  "createdAt": "2026-01-11T10:00:00.000Z",
  "updatedAt": "2026-01-11T10:00:00.000Z"
}
```

---

### 3. Update Order Status

```http
PATCH /admin/orders/:id/status
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "shipped"
}
```

**Valid Status Values:**
- `pending`
- `confirmed`
- `shipped`
- `delivered`
- `cancelled`

**Response:**
```json
{
  "message": "Order status updated",
  "order": {
    "_id": "607f1f77bcf86cd799439013",
    "contact": { ... },
    "products": [ ... ],
    "totalPrice": 89.99,
    "status": "shipped",
    "createdAt": "2026-01-11T10:00:00.000Z",
    "updatedAt": "2026-01-11T10:01:00.000Z"
  }
}
```

---

### 4. Delete an Order

```http
DELETE /admin/orders/:id
Authorization: Bearer <jwt_token>
```

**Parameters:**
- `id` (string, required): Order MongoDB ObjectId

**Response:**
```json
{
  "message": "Order deleted successfully",
  "orderId": "607f1f77bcf86cd799439013"
}
```

---

### 5. Get Order Statistics

```http
GET /admin/stats
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "totalOrders": 150,
  "totalRevenue": 12450.50,
  "byStatus": [
    {
      "_id": "delivered",
      "count": 90,
      "totalRevenue": 8500.00
    },
    {
      "_id": "shipped",
      "count": 40,
      "totalRevenue": 3000.00
    },
    {
      "_id": "pending",
      "count": 20,
      "totalRevenue": 950.50
    }
  ]
}
```

---

## Error Handling

### Rate Limiting (429)
```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 45
}
```

### Authentication Errors (401)
```json
{
  "error": "Missing or invalid authorization header"
}
```

### Authorization Errors (403)
```json
{
  "error": "Access denied. Admin role required."
}
```

### Validation Errors (400)
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "products",
      "message": "Each product must be a valid ID"
    }
  ]
}
```

### Server Errors (500)
```json
{
  "error": "Failed to retrieve orders",
  "details": "Connection timeout"
}
```

---

## Rate Limiting

- **API Endpoints**: 100 requests per 15 minutes
- **Authentication Endpoints**: 5 requests per 15 minutes

Rate limit information is included in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
```

---

## Environment Variables

Create a `.env` file in the project root:
```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true
JWT_SECRET=your_secret_key_change_this_in_production
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

---

## Example Usage

### Get all cameras
```bash
curl -X GET http://localhost:3000/api/cameras
```

### Place an order
```bash
curl -X POST http://localhost:3000/api/cameras/order \
  -H "Content-Type: application/json" \
  -d '{
    "contact": {
      "firstName": "John",
      "lastName": "Doe",
      "address": "123 Main St",
      "city": "Springfield",
      "email": "john@example.com"
    },
    "products": ["507f1f77bcf86cd799439011"]
  }'
```

### Get orders (admin)
```bash
curl -X GET "http://localhost:3000/api/admin/orders?status=shipped&page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update order status (admin)
```bash
curl -X PATCH http://localhost:3000/api/admin/orders/607f1f77bcf86cd799439013/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "delivered"
  }'
```
