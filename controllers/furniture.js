const uuid = require('uuid/v1');
const Furniture = require('../models/Furniture');
const Order = require('../models/Order');

exports.getAllFurniture = (req, res, next) => {
  Furniture.find().then(
    (furniture) => {
      const mappedFurniture = furniture.map((item) => {
        item.imageUrl = req.protocol + '://' + req.get('host') + '/images/' + item.imageUrl;
        return item;
      });
      res.status(200).json(mappedFurniture);
    }
  ).catch(
    (error) => {
      res.status(400).json({ error: 'Failed to retrieve furniture' });
    }
  );
};

exports.getOneFurniture = (req, res, next) => {
  Furniture.findById(req.params.id).then(
    (furniture) => {
      if (!furniture) {
        return res.status(404).json({ error: 'Furniture not found' });
      }
      furniture.imageUrl = req.protocol + '://' + req.get('host') + '/images/' + furniture.imageUrl;
      res.status(200).json(furniture);
    }
  ).catch(
    (error) => {
      res.status(500).json({ error: 'Failed to retrieve furniture' });
    }
  )
};

/**
 * Order furniture
 * Expects request to contain:
 * contact: {
 *   firstName: string,
 *   lastName: string,
 *   address: string,
 *   city: string,
 *   email: string
 * }
 * products: [string] <-- array of product _id
 */
exports.orderFurniture = (req, res, next) => {
  let queries = [];
  let totalPrice = 0;
  
  for (let productId of req.body.products) {
    const queryPromise = new Promise((resolve, reject) => {
      Furniture.findById(productId).then(
        (furniture) => {
          if (!furniture) {
            reject(new Error(`Furniture with ID ${productId} not found`));
          } else {
            totalPrice += furniture.price;
            resolve(furniture);
          }
        }
      ).catch(reject);
    });
    queries.push(queryPromise);
  }
  
  Promise.all(queries).then(
    (furniture) => {
      // Create order with product details
      const orderData = {
        contact: req.body.contact,
        products: furniture.map(item => ({
          productId: item._id,
          productName: item.name,
          price: item.price
        })),
        totalPrice: totalPrice,
        status: 'pending'
      };
      
      // Save order to database
      const order = new Order(orderData);
      return order.save();
    }
  ).then(
    (savedOrder) => {
      res.status(201).json({
        orderId: savedOrder._id,
        contact: savedOrder.contact,
        products: savedOrder.products,
        totalPrice: savedOrder.totalPrice,
        status: savedOrder.status
      });
    }
  ).catch(
    (error) => {
      res.status(500).json({ 
        error: 'There was a problem with your order!',
        details: error.message 
      });
    }
  );
};