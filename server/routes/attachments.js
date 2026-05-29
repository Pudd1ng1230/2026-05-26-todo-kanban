const express = require('express');
const router = express.Router({ mergeParams: true });
const ctrl = require('../controllers/attachmentController');

router.get('/', ctrl.getByTask);
router.post('/', ctrl.upload, ctrl.create);
router.delete('/:id', ctrl.remove);

// 提供静态文件访问
router.use('/file', express.static(require('path').join(__dirname, '..', 'uploads')));

module.exports = router;
