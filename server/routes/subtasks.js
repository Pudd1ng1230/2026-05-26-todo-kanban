const express = require('express');
const router = express.Router({ mergeParams: true });
const ctrl = require('../controllers/subtaskController');

router.get('/', ctrl.getByTask);
router.post('/', ctrl.create);
router.patch('/:id/toggle', ctrl.toggle);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
