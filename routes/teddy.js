const express = require('express');
const router = express.Router();

const teddyCtrl = require('../controllers/teddy');
const { validateContact, validateMongoId, handleValidationErrors } = require('../middleware/validation');

router.get('/', teddyCtrl.getAllTeddies);
router.get('/:id', validateMongoId, handleValidationErrors, teddyCtrl.getOneTeddy);
router.post('/order', validateContact, handleValidationErrors, teddyCtrl.orderTeddies);

module.exports = router;