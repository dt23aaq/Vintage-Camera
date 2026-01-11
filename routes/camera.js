const express = require('express');
const router = express.Router();

const cameraCtrl = require('../controllers/camera');
const { validateContact, validateMongoId, handleValidationErrors } = require('../middleware/validation');

router.get('/', cameraCtrl.getAllCameras);
router.get('/:id', validateMongoId, handleValidationErrors, cameraCtrl.getOneCamera);
router.post('/order', validateContact, handleValidationErrors, cameraCtrl.orderCameras);

module.exports = router;