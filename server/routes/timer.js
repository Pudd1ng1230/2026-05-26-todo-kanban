const express = require('express');
const router = express.Router({ mergeParams: true });
const ctrl = require('../controllers/timerController');

router.get('/', ctrl.getTotal);
router.post('/', ctrl.save);

module.exports = router;
