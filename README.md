
# Orinoco - Vintage Camera E-Commerce

Orinoco is a vintage camera storefront with a static browser frontend and an
Express/MongoDB API for products and orders.

## Features

✅ **Security**
- Environment-based configuration with dotenv
- JWT authentication for admin endpoints
- Input validation with express-validator
- CORS support with configurable origins
- Rate limiting to prevent abuse

✅ **Order Management**
- Complete order persistence with MongoDB
- Order status tracking (pending, confirmed, shipped, delivered, cancelled)
- Order statistics and analytics
- Admin endpoints for order management

✅ **API**
- RESTful API with consistent error handling
- Comprehensive API documentation
- Request logging and monitoring
- Proper HTTP status codes

✅ **Code Quality**
- Modular architecture with separate routes, controllers, and middleware
- Error handling middleware
- Input validation middleware
- Clean and maintainable code structure
- Automated validation checks with `npm test`

✅ **Frontend**
- Camera catalogue and product details pages
- Browser cart backed by local storage
- Checkout form with client and server-side validation
- Same-origin API configuration for local and deployed environments
- User-facing loading and request error states

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **MongoDB Atlas** account (for database)

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd Vintage-Camera
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the project root:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true

# Security
JWT_SECRET=your_super_secret_key_change_this_in_production

# CORS
CORS_ORIGIN=http://localhost:3000
```

**Note:** Replace the placeholder values with your actual MongoDB connection string and JWT secret.

### 4. Start the server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`)

The Express server also serves the frontend, so open
`http://localhost:3000/index.html` in a browser. If `MONGODB_URI` is not set,
the pages still load, but product and order API requests cannot access data.

### 5. Run the validation checks

```bash
npm test
```

The checks verify that the application, routes, controllers, authentication,
rate limiting, and validation modules can be imported successfully without a
database connection.

## Project Structure

```
.
├── controllers/           # Request handlers
│   ├── camera.js
│   ├── furniture.js
│   └── teddy.js
├── middleware/           # Custom middleware
│   ├── auth.js          # JWT authentication & authorization
│   ├── rateLimit.js     # Rate limiting
│   └── validation.js    # Input validation
├── models/              # Database schemas
│   ├── Camera.js
│   ├── Furniture.js
│   ├── Order.js         # New: Order persistence
│   └── Teddy.js
├── routes/              # API endpoints
│   ├── admin.js         # New: Admin management routes
│   ├── camera.js
│   ├── furniture.js
│   └── teddy.js
├── app.js              # Express application setup
├── server.js           # Server entry point
├── index.html           # Camera catalogue
├── singleproductdisplay.html # Product details
├── cart.html            # Shopping cart
├── contact-form.html    # Checkout form
├── api-config.js        # Frontend API base URL
├── .env                # Environment variables (create this)
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies and scripts
├── API_DOCUMENTATION.md # Complete API documentation
└── README.md           # This file
```

## API Documentation

For complete API documentation including all endpoints, request/response examples, and error handling, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### Quick Start

**Get all cameras:**
```bash
curl http://localhost:3000/api/cameras
```

**Place an order:**
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
    "products": ["<product_id>"]
  }'
```

**Admin: Get all orders (requires JWT token):**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/admin/orders
```

## Security Features

### Authentication
- JWT tokens required for admin endpoints
- Tokens expire after 24 hours
- Admin role verification for sensitive operations

### Input Validation
- Contact information validated (name, email, address, city)
- Product IDs verified as valid MongoDB ObjectIds
- Detailed validation error messages

### Rate Limiting
- API endpoints: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- Returns 429 status with retry information

### Environment Protection
- Sensitive credentials stored in `.env`
- `.gitignore` prevents accidental commits
- MongoDB connection string not hardcoded

## Development

### Running Tests
```bash
npm test
```

This runs `test-validation.js`, which does not require MongoDB.

## Database Schema

### Order Model
```javascript
{
  contact: {
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    email: String
  },
  products: [{
    productId: ObjectId,
    productName: String,
    price: Number
  }],
  totalPrice: Number,
  status: String (pending|confirmed|shipped|delivered|cancelled),
  createdAt: Date,
  updatedAt: Date
}
```

## Deployment

### Heroku Deployment
1. Create a Heroku app: `heroku create app-name`
2. Set environment variables: `heroku config:set JWT_SECRET=your_secret`
3. Deploy: `git push heroku main`

### Environment Variables for Production
Make sure to set these on your hosting platform:
- `MONGODB_URI` - Production MongoDB connection string
- `JWT_SECRET` - Secure, randomly generated secret
- `CORS_ORIGIN` - Your production frontend URL
- `NODE_ENV` - Set to "production"

## Troubleshooting

### MongoDB Connection Issues
- Verify your IP is whitelisted in MongoDB Atlas Network Access
- Check your connection string in `.env`
- Ensure MongoDB URI includes correct username/password

### JWT Token Errors
- Ensure JWT_SECRET is set in `.env`
- Check token format: `Authorization: Bearer <token>`
- Verify token hasn't expired (tokens expire after 24h)

### Rate Limiting Issues
- For development, increase rate limits in `middleware/rateLimit.js`
- Clear rate limit state by restarting the server
- For production, consider using Redis-based rate limiting

## Technologies Used

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **dotenv** - Environment configuration

## Future Enhancements

- [ ] Email notifications for order updates
- [ ] Payment integration (Stripe/PayPal)
- [ ] User accounts and authentication
- [ ] Product inventory management
- [ ] Search and filtering
- [ ] Broader unit and integration test coverage
- [ ] API versioning
- [ ] Redis-based rate limiting
- [ ] Logging system (Winston/Morgan)

## Support

For issues or questions, please open an issue in the repository or contact the development team.
