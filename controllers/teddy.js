const uuid = require('uuid/v1');
const Teddy = require('../models/Teddy');
const Order = require('../models/Order');

exports.getAllTeddies = (req, res, next) => {
  Teddy.find().then(
    (teddies) => {
      const mappedTeddies = teddies.map((teddy) => {
        teddy.imageUrl = req.protocol + '://' + req.get('host') + '/images/' + teddy.imageUrl;
        return teddy;
      });
      res.status(200).json(mappedTeddies);
    }
  ).catch(
    (error) => {
      res.status(400).json({ error: 'Failed to retrieve teddies' });
    }
  );
};

exports.getOneTeddy = (req, res, next) => {
  Teddy.findById(req.params.id).then(
    (teddy) => {
      if (!teddy) {
        return res.status(404).json({ error: 'Teddy not found' });
      }
      teddy.imageUrl = req.protocol + '://' + req.get('host') + '/images/' + teddy.imageUrl;
      res.status(200).json(teddy);
    }
  ).catch(
    (error) => {
      res.status(500).json({ error: 'Failed to retrieve teddy' });
    }
  )
};

/**
 * Order teddies
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
exports.orderTeddies = (req, res, next) => {
  let queries = [];
  let totalPrice = 0;
  
  for (let productId of req.body.products) {
    const queryPromise = new Promise((resolve, reject) => {
      Teddy.findById(productId).then(
        (teddy) => {
          if (!teddy) {
            reject(new Error(`Teddy with ID ${productId} not found`));
          } else {
            totalPrice += teddy.price;
            resolve(teddy);
          }
        }
      ).catch(reject);
    });
    queries.push(queryPromise);
  }
  
  Promise.all(queries).then(
    (teddies) => {
      // Create order with product details
      const orderData = {
        contact: req.body.contact,
        products: teddies.map(teddy => ({
          productId: teddy._id,
          productName: teddy.name,
          price: teddy.price
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