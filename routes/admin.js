const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { body, param, query } = require('express-validator');

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(verifyAdmin);

/**
 * GET /api/admin/orders - Get all orders with optional filtering
 * Query params: status, page, limit
 */
router.get('/orders', 
  query('status').optional().isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;
      
      const filter = status ? { status } : {};
      
      const orders = await Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await Order.countDocuments(filter);
      
      res.status(200).json({
        orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to retrieve orders',
        details: error.message 
      });
    }
  }
);

/**
 * GET /api/admin/orders/:id - Get single order details
 */
router.get('/orders/:id', 
  param('id').isMongoId(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to retrieve order',
        details: error.message 
      });
    }
  }
);

/**
 * PATCH /api/admin/orders/:id/status - Update order status
 */
router.patch('/orders/:id/status',
  param('id').isMongoId(),
  body('status').isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  handleValidationErrors,
  async (req, res) => {
    try {
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { 
          status: req.body.status,
          updatedAt: Date.now()
        },
        { new: true }
      );
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.status(200).json({
        message: 'Order status updated',
        order
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to update order status',
        details: error.message 
      });
    }
  }
);

/**
 * DELETE /api/admin/orders/:id - Delete an order
 */
router.delete('/orders/:id',
  param('id').isMongoId(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const order = await Order.findByIdAndDelete(req.params.id);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.status(200).json({ 
        message: 'Order deleted successfully',
        orderId: req.params.id
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to delete order',
        details: error.message 
      });
    }
  }
);

/**
 * GET /api/admin/stats - Get order statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    res.status(200).json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      byStatus: stats
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to retrieve statistics',
      details: error.message 
    });
  }
});

module.exports = router;
