const uuid = require('uuid/v1');
const Camera = require('../models/Camera');
const Order = require('../models/Order');

exports.getAllCameras = (req, res, next) => {
  Camera.find().then(
    (cameras) => {
      const mappedCameras = cameras.map((camera) => {
        camera.imageUrl = req.protocol + '://' + req.get('host') + '/images/' + camera.imageUrl;
        return camera;
      });
      res.status(200).json(mappedCameras);
    }
  ).catch(
    (error) => {
      res.status(400).json({ error: 'Failed to retrieve cameras' });
    }
  );
};

exports.getOneCamera = (req, res, next) => {
  Camera.findById(req.params.id).then(
    (camera) => {
      if (!camera) {
        return res.status(404).json({ error: 'Camera not found' });
      }
      camera.imageUrl = req.protocol + '://' + req.get('host') + '/images/' + camera.imageUrl;
      res.status(200).json(camera);
    }
  ).catch(
    (error) => {
      res.status(500).json({ error: 'Failed to retrieve camera' });
    }
  )
};

/**
 * Order cameras
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
exports.orderCameras = (req, res, next) => {
  let queries = [];
  let totalPrice = 0;
  
  for (let productId of req.body.products) {
    const queryPromise = new Promise((resolve, reject) => {
      Camera.findById(productId).then(
        (camera) => {
          if (!camera) {
            reject(new Error(`Camera with ID ${productId} not found`));
          } else {
            totalPrice += camera.price;
            resolve(camera);
          }
        }
      ).catch(reject);
    });
    queries.push(queryPromise);
  }
  
  Promise.all(queries).then(
    (cameras) => {
      // Create order with product details
      const orderData = {
        contact: req.body.contact,
        products: cameras.map(camera => ({
          productId: camera._id,
          productName: camera.name,
          price: camera.price
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
