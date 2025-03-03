const express = require('express');
const router = express.Router();
const equipmentsController = require('../controllers/equipmentsController');

router.get('/', equipmentsController.getEquipments);
router.get('/stats', equipmentsController.getEquipmentStats);
router.post('/', equipmentsController.createEquipment);
router.put('/:id', equipmentsController.updateEquipment);
router.delete('/:id', equipmentsController.deleteEquipment);

module.exports = router;