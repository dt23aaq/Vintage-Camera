const express = require('express');
const router = express.Router();

const furnitureCtrl = require('../controllers/furniture');
const { validateContact, validateMongoId, handleValidationErrors } = require('../middleware/validation');

router.get('/', furnitureCtrl.getAllFurniture);
router.get('/:id', validateMongoId, handleValidationErrors, furnitureCtrl.getOneFurniture);
router.post('/order', validateContact, handleValidationErrors, furnitureCtrl.orderFurniture);

module.exports = router;