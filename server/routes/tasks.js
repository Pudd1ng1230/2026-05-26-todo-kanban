const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/taskController');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.patch('/:id/move', ctrl.move);
router.patch('/:id/restore', ctrl.restore);
router.patch('/:id/pin', ctrl.togglePin);
router.delete('/:id/permanent', ctrl.permanentDelete);

module.exports = router;
