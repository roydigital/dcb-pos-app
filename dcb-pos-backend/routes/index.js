const express = require('express');
const router = express.Router();

router.use('/menu', require('./menu'));
router.use('/inventory', require('./inventory'));
router.use('/recipes', require('./recipes'));
router.use('/customers', require('./customers'));
router.use('/orders', require('./orders'));
router.use('/reports', require('./reports'));

module.exports = router;
